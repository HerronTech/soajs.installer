'use strict';
var fs = require('fs');
var async = require('async');

var config = require(__dirname + '/FILES/swarm/config.js');
var lib = require(__dirname + '/FILES/swarm/index.js');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //to avoid self signed certificates error

console.log ('SOAJS High Availability Deployer');
console.log ('Current configuration: Machine IP/URL: ' + config.docker.machineIP + ' | Certificates Local Path: ' + config.docker.certsPath);
console.log ('You can change this configuration by setting CONTAINER_HOST & SOAJS_DOCKER_CERTS_PATH environment variables\n');

lib.getDeployer(config.docker, function (deployer) {
	lib.ifSwarmExists(deployer, function (error, exists) {
		if (error) throw new Error(error);
		
		if (exists) {
			console.log ("Swarm exists, inspecting ...");
			lib.inspectSwarm(deployer, function (error, swarmInfo) {
				if (error) throw new Error(error);
				
				lib.saveSwarmTokens(swarmInfo);
				
				console.log('Cleaning previous docker services ...');
				lib.deletePreviousServices(deployer, function (error, result) {
					if (error) throw new Error(error);
					
					console.log ('Deploying SOAJS ...');
					return deploySOAJS(deployer);
				});
			});
		}
		else {
			console.log ('No swarm exists on this machine, initializing new swarm ...');
			return initSwarm(deployer);
		}
	});
});

function initSwarm(deployer) {
	deployer.swarmInit(config.docker.options, function (error) {
		if (error) throw new Error(error);
		
		lib.inspectSwarm(deployer, function (error, swarmInfo) {
			if (error) throw new Error(error);
			
			lib.saveSwarmTokens(swarmInfo);
			
			console.log ('New swarm initialized ...');
			console.log ('Deploying SOAJS ...');
			
			setTimeout(function () {
				deploySOAJS(deployer);
			}, 1000);
		});
	});
}

function deploySOAJS(deployer) {
	lib.prepareSwarmNetwork(deployer, function (error) {
		if (error) throw new Error(error);
		async.eachSeries(config.deployGroups, function (oneGroup, callback) {
			deploy(oneGroup, deployer, function (error, result) {
				if (error) return callback(error);
				
				console.log(oneGroup + ' services deployed successfully ...');
				return callback(null, true);
			});
		}, function (error, result) {
			if (error) throw new Error (error);
			
			lib.registerNode(deployer, config.docker.swarmConfig, function (error, result) {
				if (error) throw new Error(error);
				
				console.log('Swarm node has been registered ...');
				lib.configureEnvDeployer(function (error, result) {
					if (error) throw new Error(error);
					lib.closeDbCon(function(){});
				});
			});
		});
	});
}

function deploy (group, deployer, cb) {
	lib.getContent('services', group, function (error, services) {
		if (error) return cb(error);
		
		if (group === 'core') {
			lib.addMongoInfo(services, config.mongo.services, function (error) {
				if (error) return cb(error);
				lib.deployGroup(group, services, deployer, cb);
			});
		}
		else {
			lib.deployGroup(group, services, deployer, function (error) {
				if (error) return cb(error);
				
				if (group === 'db') {
					if (config.mongo.external) {
						console.log ('External Mongo deployment detected, will not create a container for mongo.');
						lib.importData(config.mongo.services, function(error){
							return cb(error, true);
						});
					}
					else{
						return importProvisionData(services, deployer, cb);
					}
				}
				else {
					return cb(null, true);
				}
			});
		}
	});
}

function importProvisionData (dbServices, deployer, cb) {
	for (var i = 0; i < dbServices.length; i++) {
		if (dbServices[i].Name === config.mongo.services.dashboard.name) {
			config.mongo.services.dashboard.count = dbServices[i].Mode.Replicated.Replicas;
		}
	}
	
	console.log ("Fetching data containers' IP addresses ... ");
	console.log ('This step might take some time if docker is currently pulling the containers\' image ...');
	lib.getServiceIPs(config.mongo.services.dashboard.name, deployer, config.mongo.services.dashboard.count, function (error, dashMongoIPs) {
		if (error) return cb(error);
		
		config.mongo.services.dashboard.ips = dashMongoIPs;
		setTimeout(function () {
			lib.importData(config.mongo.services, cb);
		}, 5000);
	});
}
