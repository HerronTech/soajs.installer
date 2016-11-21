'use strict';

var fs = require('fs');
var async = require('async');
var util = require('util');

var config = require(__dirname + '/FILES/kubernetes/config.js');
var lib = require(__dirname + '/FILES/kubernetes/index.js');

util.log ('SOAJS High Availability Deployer | Kubernetes');
util.log ('Current configuration: Machine IP/URL: ' + config.machineIP + ' | Certificates Local Path: ' + config.certsPath);
util.log ('You can change this configuration by setting SOAJS_MACHINE_IP & SOAJS_KUBE_CERTS_PATH environment variables\n');

util.log ('Initializing deployer ...');
lib.getDeployer(config.kubeConfig, function (deployer) {
    util.log ('Deleting previous Kubernetes deployments ...');
    lib.deletePreviousServices(deployer, function (error, result) {
        if (error) throw new Error(error);

        util.log ('Deploying SOAJS ...');
        setTimeout(function () {
            async.eachSeries(config.deployGroups, function (oneGroup, callback) {
                deploy(oneGroup, deployer, function (error, result) {
                    if (error) return callback(error);

                    util.log(oneGroup + ' services deployed successfully ...');
                    return callback(null, true);
                });
            }, function (error, result) {
                if (error) throw new Error (error);

                lib.registerNode(deployer, config.swarmConfig, function (error, result) {
                    if (error) throw new Error(error);

                    util.log('Cluster node has been registered ...');
                    lib.configureEnvDeployer(function (error, result) {
                        if (error) throw new Error(error);

                        util.log('Environment deployer configuration has been updated ...');

                        lib.closeDbCon(function () {
                            util.log ('Add the following entries to your /etc/hosts file:\n' +
                                        '                    ' + config.machineIP + ' dashboard-api.' + (process.env.MASTER_DOMAIN || config.defaultMasterDomain) + '\n' +
                                        '                    ' + config.machineIP + ' dashboard.' + (process.env.MASTER_DOMAIN || config.defaultMasterDomain) + '\n');
                            util.log ('SOAJS has been deployed. You can now login to your dashboard @ http://dashboard.' + (process.env.MASTER_DOMAIN || config.defaultMasterDomain));
                        });
                    });
                });
            });
        }, 5000);
    });
});

function deploy (group, deployer, cb) {
    lib.getContent('services', group, function (error, services) {
        if (error) return cb(error);

        if (group === 'core') {
            lib.addMongoInfo(services, config.mongoServices, function (error, result) {
                if (error) return cb(error);

                lib.deployGroup(group, services, deployer, cb);
            });
        }
        else {
            lib.deployGroup(group, services, deployer, function (error, result) {
                if (error) return cb(error);

                if (group === 'db') {
                    if (config.dataLayer.mongo.external) {
                        util.log ('External Mongo deployment detected, provision data will not be imported ...');
                        return cb(null, true);
                    }

                    return importProvisionData(services, deployer, cb);
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
        if (dbServices[i].deployment.metadata.name === config.mongoServices.dashboard.name) {
            config.mongoServices.dashboard.count = dbServices[i].deployment.spec.replicas;
            break;
        }
    }

    util.log ("Fetching data containers' IP addresses ... ");
    util.log ('This step might take some time if docker is currently pulling the containers\' image ...');
    lib.getServiceIPs(config.mongoServices.dashboard.name, deployer, config.mongoServices.dashboard.count, function (error, dashMongoIPs) {
        if (error) return cb(error);

        config.mongoServices.dashboard.ips = dashMongoIPs;
        setTimeout(function () {
            lib.importData(config.mongoServices, function (error, result) {
                if (error) return cb(error);

                return cb(null, true);
            });
        }, 5000);
    });
}
