'use strict';
var K8Api = require('kubernetes-client');
var async = require('async');
var fs = require('fs');
var exec = require('child_process').exec;
var soajs = require('soajs');
var request = require('request');

var config = require('./config.js');
var folder = config.folder;
delete require.cache[config.profile];
var profile = require(config.profile);
var mongo = new soajs.mongo(profile);

var utilLog = require('util');
var lib = {

    printProgress: function (message, counter) {
        process.stdout.clearLine();
        process.stdout.write(showTimestamp() + ' - ' + message + ' ' + showDots() + '\r');

        function showDots() {
            var output = '';
            var numOfDots = counter % 5;
            for (var i = 0; i < numOfDots; i++) { output += '.'; }
            return output;
        }

        function showTimestamp() {
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var now = new Date();
            return '' + now.getDate() + ' ' + months[now.getMonth()] + ' ' + now.getHours() + ':' +
                ((now.getMinutes().toString().length === 2) ? now.getMinutes() : '0' + now.getMinutes()) + ':' +
                ((now.getSeconds().toString().length === 2) ? now.getSeconds() : '0' + now.getSeconds());
        }
    },

    getDeployer: function (deployerConfig, cb) {
	        if(!config.kubernetes.certsPath){
		        return cb(new Error('No certificates found for remote machine.'));
	        }
        var deployer = {};

        deployerConfig.ca = fs.readFileSync(config.kubernetes.certsPath + '/ca.crt');
        deployerConfig.cert = fs.readFileSync(config.kubernetes.certsPath + '/apiserver.crt');
        deployerConfig.key = fs.readFileSync(config.kubernetes.certsPath + '/apiserver.key');

        deployerConfig.version = 'v1beta1';
        deployer.extensions = new K8Api.Extensions(deployerConfig);

        deployerConfig.version = 'v1';
        deployer.core = new K8Api.Core(deployerConfig);

        return cb(null, deployer);
    },

    getContent: function (type, group, cb) {
        var path = config.services.path.dir + group + '/';
        fs.exists(path, function (exists) {
            if (!exists) {
                utilLog.log('Folder [' + path + '] does not exist, skipping ...');
                return cb(null, true);
            }

            fs.readdir(path, function (error, content) {
                if (error) return cb(error);

                var regex = new RegExp('[a-zA-Z0-9]*\.' + config.services.path.fileType, 'g');
                var loadContent, allContent = [];
                content.forEach(function (oneContent) {
                    if (oneContent.match(regex)) {
                        try {
                            loadContent = require(path + oneContent);
                        }
                        catch (e) {
                            return cb(e);
                        }
                        allContent.push(loadContent);
                    }
                });
                return cb(null, allContent);
            });
        });
    },

    deployGroup: function (type, services, deployer, cb) {
        if (services.length === 0) {
            utilLog.log('No services of type [' + type + '] found, skipping ...');
            return cb(null, true);
        }

        if (type === 'db' && config.mongo.external) {
            utilLog.log('External Mongo deployment detected, data containers will not be deployed ...');
            return cb(null, true);
        }

        async.eachSeries(services, function (oneService, callback) {
            lib.deployService(deployer, oneService, callback);
        }, cb);
    },

    importData: function (mongoInfo, cb) {
        utilLog.log('Importing provision data to:', profile.servers[0].host + ":" + profile.servers[0].port);
        var execString = "cd " + folder + " && mongo --host " + profile.servers[0].host + ":" + profile.servers[0].port;
        if (profile.credentials && profile.credentials.username && profile.credentials.password && profile.URLParam && profile.URLParam.authSource) {
            execString += " -u " + profile.credentials.username + " -p " + profile.credentials.password + " --authenticationDatabase " + profile.URLParam.authSource;
        }
        execString += " data.js";
        exec(execString, cb);
    },

    deployService: function (deployer, options, cb) {
        if (options.service) {
            deployer.core.namespaces.services.post({body: options.service}, function (error) {
                if (error) return cb(error);
                return createDeployment();
            });
        }
        else {
            return createDeployment();
        }

        function createDeployment() {
            deployer.extensions.namespaces.deployments.post({body: options.deployment}, function (error, result) {
                if (error) return cb(error);
                lib.registerContainers(deployer, options, cb);
            });
        }
    },

    deleteDeployments: function (deployer, options, cb) {
        deployer.extensions.namespaces.deployments.delete({}, cb);
    },

    deleteKubeServices: function (deployer, options, cb) {
        var filter = { labelSelector: 'type=soajs-service' };
        deployer.core.namespaces.services.get({qs: filter}, function (error, serviceList) {
            if (error) return cb(error);

            async.each(serviceList.items, function (oneService, callback) {
                deployer.core.namespaces.services.delete({ name: oneService.metadata.name }, callback);
            }, cb);
        });
    },

    deletePods: function (deployer, options, cb) {
        //force delete all pods for a better cleanup
        deployer.core.namespaces.pods.delete({}, cb);
    },

    deletePreviousServices: function (deployer, cb) {
        lib.deleteDeployments(deployer, {}, function (error) {
            if (error) return cb(error);

            lib.deleteKubeServices(deployer, {}, function (error) {
                if (error) return cb(error);

                lib.deletePods(deployer, {}, cb);
            });
        });
    },

    getServiceIPs: function (serviceName, deployer, replicaCount, counter, cb) {
        if (typeof (counter) === 'function') {
            cb = counter; //counter wasn't passed as param
            counter = 0;
        }
	    
        deployer.core.namespaces.pods.get({}, function (error, podList) {
            if (error) return cb(error);
	        
            var onePod, ips = [];
            podList.items.forEach(function (onePod) {
                if (onePod.metadata.labels['soajs-app'] === serviceName && onePod.status.phase === 'Running') {
                    ips.push({
                        name: onePod.metadata.name,
                        ip: onePod.status.podIP
                    });
                }
            });
	        
            if (ips.length !== replicaCount) {
                //pod containers may not be ready yet
                lib.printProgress('Waiting for ' + serviceName + ' containers to become available', counter++);
                setTimeout(function () {
                    return lib.getServiceIPs(serviceName, deployer, replicaCount, counter, cb);
                }, 1000);
            }
            else {
                utilLog.log(""); //intentional, to force writting a new line.
                return cb(null, ips);
            }
        });
    },

    addMongoInfo: function (services, mongoInfo, cb) {
        var mongoEnv = [];
	
	    if(config.mongo.prefix && config.mongo.prefix !== ""){
		    mongoEnv.push({name: 'SOAJS_MONGO_PREFIX', value: config.mongo.prefix});
	    }
	    
        if (config.mongo.external) {
            // if (!config.dataLayer.mongo.url || !config.dataLayer.mongo.port) {
            if (!profile.servers[0].host || !profile.servers[0].port) {
                utilLog.log('ERROR: External Mongo information is missing URL or port, make sure SOAJS_MONGO_EXTERNAL_URL and SOAJS_MONGO_EXTERNAL_PORT are set ...');
                return cb('ERROR: missing mongo information');
            }

            mongoEnv.push({ name: 'SOAJS_MONGO_NB', value: profile.servers.length });
	        for(var i =1; i <= profile.servers.length; i++){
		        mongoEnv.push({name: 'SOAJS_MONGO_IP_' + i, value: profile.servers[i].host});
		        mongoEnv.push({name: 'SOAJS_MONGO_PORT_' + i, value: '' + profile.servers[i].port});
	        }

            if (profile.credentials && profile.credentials.username && profile.credentials.password) {
                mongoEnv.push({ name: 'SOAJS_MONGO_USERNAME', value: profile.credentials.username });
                mongoEnv.push({ name: 'SOAJS_MONGO_PASSWORD', value: profile.credentials.password });
	            mongoEnv.push({ name: 'SOAJS_MONGO_AUTH_DB', value: profile.URLParam.authSource });
            }
            
            if(profile.URLParam.ssl){
	            mongoEnv.push({ name: 'SOAJS_MONGO_SSL', value: profile.URLParam.ssl });
            }
        }
        else {
            mongoEnv.push({ name: 'SOAJS_MONGO_NB', value: '1' });
	        mongoEnv.push({ name: 'SOAJS_MONGO_IP_1', value: profile.servers[0].host});
	        mongoEnv.push({ name: 'SOAJS_MONGO_PORT_1', value: '27017'});
        }

        services.forEach(function (oneService) {
            oneService.deployment.spec.template.spec.containers[0].env = oneService.deployment.spec.template.spec.containers[0].env.concat(mongoEnv);
        });

        return cb(null, services);
    },

    inspectSwarm: function (deployer, cb) {
        //TODO: re-implement
        // deployer.swarmInspect(cb);
    },

    saveSwarmTokens: function (swarmInfo) {
        //TODO: re-implement


        // Object.keys(swarmInfo.JoinTokens).forEach(function (oneType) {
        //     config.swarmConfig.tokens[oneType.toLowerCase()] = swarmInfo.JoinTokens[oneType];
        // });
    },

    registerNode: function (deployer, swarmConfig, cb) {
        deployer.core.nodes.get({}, function (error, nodeList) {
            if (error) return cb(error);

            async.map(nodeList.items, function (oneNode, callback) {
                var record = {
                    recordType: 'node',
                    id: oneNode.metadata.uid,
                    name: oneNode.metadata.name,
                    ip: '',
                    kubePort: config.machinePort,
                    swarmPort: oneNode.status.daemonEndpoints.kubeletEndpoint.Port,
                    availability: 'active', //TODO: make dynamic
                    role: 'manager', //TODO: make dynamic
                    resources: {
                        cpuCount: oneNode.status.capacity.cpu,
                        memory: oneNode.status.capacity.memory
                    },
                    tokens: {}
                };

                return callback(null, record);
            }, function (error, nodeRecords) {
                if (error) return cb(error);

                for (var i = nodeRecords.length; i >= 0; i--) {
                    if (!nodeRecords[i]) {
                        nodeRecords.splice(i, 1);
                    }
                }

                mongo.insert(config.kubernetes.mongoCollection, nodeRecords, cb);
            });
        });
    },

    configureEnvDeployer: function (cb) {
        // if (config.machineIP === '127.0.0.1' || config.machineIP === 'localhost') {
        //     //local deployment, unix socket is used, no need to add node information
        //     return cb(null, true);
        // }

        var criteria = {role: 'manager'};
        mongo.find('docker', criteria, function (error, managerNodes) {
            if (error) return cb(error);

            async.map(managerNodes, function (oneNode, callback) {
                return callback(null, oneNode.name);
            }, function (error, nodeHostnames) {
                //get environments records
                mongo.find('environment', {}, function (error, envs) {
                    if (error) return cb(error);

                    async.each(envs, function (oneEnv, callback) {
                        oneEnv.deployer.container.kubernetes.remote.nodes = nodeHostnames;
                        mongo.save('environment', oneEnv, callback);
                    }, cb);
                });
            });
        });
    },

    registerContainers: function (deployer, serviceOptions, cb) {
        var info = {};
        var kubeServiceName = serviceOptions.deployment.metadata.name;
        var serviceGroup, serviceName, serviceEnv;

        if (serviceOptions.deployment.metadata.labels) {
            serviceGroup = serviceOptions.deployment.metadata.labels['soajs.service.group'];
            serviceName = serviceOptions.deployment.metadata.labels['soajs.service'];
            serviceEnv = serviceOptions.deployment.metadata.labels['soajs.env'];
        }

        if (serviceGroup === 'core') {
            info.type = (serviceName === 'controller') ? 'controller' : 'service';
        }
        else if (serviceGroup === 'nginx') {
            info.type = 'nginx';
        }
        else {
            return cb(null, true);
        }

        var replicaCount = serviceOptions.deployment.spec.replicas;

        utilLog.log ('Registering ' + serviceName + ' containers in docker collection ...');

        info.env = serviceEnv;
        info.running = true;
        info.recordType = 'container';

        lib.getServiceIPs(kubeServiceName, deployer, replicaCount, function (error, serviceIPs) {
            if (error) return cb(error);

            async.map(serviceIPs, function (oneServiceInfo, callback) {
                deployer.core.namespaces.pods.get({name: oneServiceInfo.name}, function (error, pod) {
                    if (error) return callback(error);
                    var record = JSON.parse(JSON.stringify(info));
                    record.taskName = oneServiceInfo.name;
                    record.serviceName = kubeServiceName;
                    delete pod.metadata.annotations;
                    record.info = pod;
                    return callback(null, record);
                });
            }, function (error, records) {
                if (error) return cb(error);
                mongo.insert(config.kubernetes.mongoCollection, records, cb);
            });
        });
    },

    closeDbCon: function (cb) {
        mongo.closeDb();
        return cb();
    }
};

module.exports = lib;
