'use strict';
var async = require('async');

var config = require(__dirname + '/FILES/swarm/config.js');
var lib = require(__dirname + '/FILES/swarm/index.js');

var utilLog = require('util');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //to avoid self signed certificates error

utilLog.log ('SOAJS High Availability Deployer');
utilLog.log ('Current configuration: Machine IP/URL: ' + config.docker.machineIP);
utilLog.log ('You can change this configuration by setting CONTAINER_HOST');

lib.getDeployer(config.docker, function (error, deployer) {
	if(error){ throw new Error(error); }

	lib.ifSwarmExists(deployer, function (error, exists) {
		if (error) throw new Error(error);

		if (exists) {
			utilLog.log ("Swarm exists, inspecting ...");
			lib.inspectSwarm(deployer, function (error, swarmInfo) {
				if (error) throw new Error(error);

				lib.saveSwarmTokens(swarmInfo);

				utilLog.log('Cleaning previous docker services ...');
				lib.deletePreviousServices(deployer, function (error, result) {
					if (error) throw new Error(error);

					utilLog.log ('Deploying SOAJS ...');
					deploySOAJS(deployer);
				});
			});
		}
		else {
			utilLog.log ('No swarm exists on this machine, initializing new swarm ...');
			initSwarm(deployer);
		}
	});
});

function initSwarm(deployer) {
	deployer.swarmInit(config.docker.options, function (error) {
		if (error) throw new Error(error);

		delete deployer.modem.headers['Content-Length'];
		lib.inspectSwarm(deployer, function (error, swarmInfo) {
			if (error) throw new Error(error);

			lib.saveSwarmTokens(swarmInfo);

			utilLog.log ('New swarm initialized ...');
			utilLog.log ('Deploying SOAJS ...');

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
				return callback(null, true);

			});
		}, function (error, result) {
			if (error) throw new Error (error);
			lib.closeDbCon(function(){
				utilLog.log('SOAJS Has been deployed.');
				process.exit();
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
						utilLog.log ('External Mongo deployment detected, will not create a container for mongo.');
						lib.importData(config.mongo.services, cb);
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
	utilLog.log ("Fetching data containers' IP addresses ... ");
	utilLog.log ('This step might take some time if docker is currently pulling the containers\' image ...');
	delete deployer.modem.headers['Content-Length'];

	lib.getServiceInstances(config.mongo.services.dashboard.name, deployer, 1, function (error) {
		if (error) return cb(error);
		setTimeout(function () {
            lib.importData(config.mongo.services, cb);
		}, 5000);
	});
}
