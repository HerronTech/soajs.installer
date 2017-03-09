'use strict';
var fs = require('fs');
var async = require('async');

var config = require(__dirname + '/FILES/kubernetes/config.js');
var lib = require(__dirname + '/FILES/kubernetes/index.js');

var utilLog = require('util');

utilLog.log ('SOAJS High Availability Deployer | Kubernetes');
utilLog.log ('Current configuration: Machine IP/URL: ' + config.kubernetes.machineIP + ' | Certificates Local Path: ' + config.kubernetes.certsPath);
utilLog.log ('You can change this configuration by setting SOAJS_MACHINE_IP & SOAJS_KUBE_CERTS_PATH environment variables\n');

utilLog.log ('Initializing deployer ...');
lib.getDeployer(config.kubernetes.config, function (error, deployer) {
	   if(error){ throw new Error(error); }

	utilLog.log ('Deleting previous Kubernetes deployments ...');
    lib.deletePreviousServices(deployer, function (error) {
        if (error) throw new Error(error);

	    utilLog.log ('Deploying SOAJS ...');
        setTimeout(function () {
            async.eachSeries(config.deployGroups, function (oneGroup, callback) {
                deploy(oneGroup, deployer, function (error) {
                    if (error) return callback(error);

	                utilLog.log(oneGroup + ' services deployed successfully ...');
                    return callback(null, true);
                });
            }, function (error, result) {
                if (error) throw new Error (error);
                utilLog.log('SOAJS Has been deployed.');
                process.exit();
            });
        }, 5000);
    });
});

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
	utilLog.log ("Fetching data containers' IP addresses ... ");
	utilLog.log ('This step might take some time if kubernetes is currently pulling the containers\' image ...');
    lib.getServiceIPs(config.mongo.services.dashboard.name, deployer, 1, function (error) {
        if (error) return cb(error);

		setTimeout(function () {
			lib.importData(config.mongo.services, cb);
		}, 30000);
	});
}
