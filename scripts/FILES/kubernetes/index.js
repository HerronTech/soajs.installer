'use strict';
var K8Api = require('kubernetes-client');
var async = require('async');

var path = require('path');
var fs = require('fs');
var Grid = require('gridfs-stream');
var spawn = require('child_process').spawn;
var soajs = require('soajs');
var soajsModules = require('soajs.core.modules');
var request = require('request');
var clone = require('clone');

var config = require('./config.js');
var folder = config.folder;
delete require.cache[config.profile];
var profile = require(config.profile);
var mongo = new soajsModules.mongo(profile);

var utilLog = require('util');

var lib = {

    "loadCustomData": function (cb) {
        var dataDir = process.env.SOAJS_DATA_FOLDER;

        fs.exists(path.normalize(dataDir + "/../custom.js"), function (exists) {
            if (!exists) {
                return cb(null);
            }
            else {
                delete require.cache[require.resolve(path.normalize(dataDir + "/../custom.js"))];
                var customData = require(path.normalize(dataDir + "/../custom.js"));
                return cb(customData);
            }
        });
    },

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
        if(!config.kubernetes.config.auth.bearer){
            return cb(new Error('No valid access token found for the kubernetes cluster'));
        }
        var deployer = {};

        deployerConfig.request = {
            strictSSL: false
        }

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
            if(type === "core"){
                oneService.service.metadata.labels["soajs.catalog.id"] = process.env.DASH_SRV_ID;
                oneService.deployment.metadata.labels["soajs.catalog.id"] = process.env.DASH_SRV_ID;
                oneService.deployment.spec.template.metadata.labels["soajs.catalog.id"] = process.env.DASH_SRV_ID;
            }
            else if (type === "nginx"){
                oneService.service.metadat.Labels["soajs.catalog.id"] = process.env.DASH_NGINX_ID;
                oneService.deployment.metadata.labels["soajs.catalog.id"] = process.env.DASH_NGINX_ID;
                oneService.deployment.spec.template.metadata.labels["soajs.catalog.id"] = process.env.DASH_NGINX_ID;
            }
            lib.deployService(deployer, oneService, callback);
        }, cb);
    },

    /**
     * Customizes a new nginx recipe used to deploy the NGINX of the dashboard environment
     * @param nginxRecipe
     * @param cb
     * @returns {*}
     */
    updateNginxRecipe (nginxRecipe) {
        nginxRecipe.name = "Dashboard Nginx Recipe";
        nginxRecipe.description = "This is the nginx catalog recipe used to deploy the nginx in the dashboard environment."
        if(process.env.SOAJS_NX_SSL === 'true'){
            process.env['SOAJS_NX_API_HTTPS']=1;
            process.env['SOAJS_NX_API_HTTP_REDIRECT']=1;
            process.env['SOAJS_NX_SITE_HTTPS']=1;
            process.env['SOAJS_NX_SITE_HTTP_REDIRECT']=1;
        }

        //Add every environment variable that is added by the installer.
        //Add environment variables related to SSL
        if(process.env.SOAJS_NX_API_HTTPS){
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_API_HTTPS"] = {
                "type": "userInput",
                "value": process.env.SOAJS_NX_API_HTTPS
            };
        }
        if(process.env.SOAJS_NX_API_HTTP_REDIRECT){
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_API_HTTP_REDIRECT"] = {
                "type": "userInput",
                "value": process.env.SOAJS_NX_API_HTTP_REDIRECT
            };
        }
        if(process.env.SOAJS_NX_SITE_HTTPS){
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_SITE_HTTPS"] = {
                "type": "userInput",
                "value": process.env.SOAJS_NX_SITE_HTTPS
            };
        }
        if(process.env.SOAJS_NX_SITE_HTTP_REDIRECT){
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_SITE_HTTP_REDIRECT"] = {
                "type": "userInput",
                "value": process.env.SOAJS_NX_SITE_HTTP_REDIRECT
            };
        }

        if(process.env.SOAJS_NX_SSL_SECRET){
            //Add environment variable containing the value of the SSL secret
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_SSL_SECRET"] = {
                "type": "userInput",
                "value": process.env.SOAJS_NX_SSL_SECRET
            };
            //Add environment variable related to custom SSL
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_CUSTOM_SSL"] = {
                "type": "userInput",
                "value": "1"
            };
            //Add environment variable containing the location of the certificates
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_SSL_CERTS_LOCATION"] = {
                "type": "userInput",
                "value": "/etc/soajs/ssl"
            };
        }

        return nginxRecipe;
    },

    /**
     * Customizes a new service recipe used to deploy the core services of the dashboard environment
     * @param serviceRecipe
     * @param cb
     * @returns {*}
     */
    updateServiceRecipe (serviceRecipe) {
        serviceRecipe.name = "Dashboard Service Recipe";
        nginxRecipe.description = "This is the service catalog recipe used to deploy the core services in the dashboard environment."

        //Add environment variables containing mongo information
        if(process.env.SOAJS_MONGO_NB){
            serviceRecipe.recipe.buildOptions.env["SOAJS_MONGO_NB"] = {
                "type": "computed",
                "value": "$SOAJS_MONGO_NB"
            };
        }
        if(process.env.SOAJS_MONGO_PREFIX){
            serviceRecipe.recipe.buildOptions.env["SOAJS_MONGO_PREFIX"] = {
                "type": "computed",
                "value": "$SOAJS_MONGO_PREFIX"
            };
        }
        if(process.env.SOAJS_MONGO_RSNAME){
            serviceRecipe.recipe.buildOptions.env["SOAJS_MONGO_RSNAME"] = {
                "type": "computed",
                "value": "$SOAJS_MONGO_RSNAME"
            };
        }
        if(process.env.SOAJS_MONGO_AUTH_DB){
            serviceRecipe.recipe.buildOptions.env["SOAJS_MONGO_AUTH_DB"] = {
                "type": "computed",
                "value": "$SOAJS_MONGO_AUTH_DB"
            };
        }
        return serviceRecipe;
    },

    importData: function (mongoInfo, cb) {
        utilLog.log('Importing provision data to:', profile.servers[0].host + ":" + profile.servers[0].port);
        var dataImportFile = __dirname + "/../dataImport/index.js";
        const importFiles = spawn(process.env.NODE_PATH, [ 'index.js' ], { stdio: 'inherit', cwd: dataImportFile });
        importFiles.on('data', (data) => {
            console.log(data.toString());
        });

        importFiles.on('close', (code) => {
            if (code === 0) {
                utilLog.log("Successfully imported the data files.");
                setTimeout(function () {
                    const dataFolder = process.env.SOAJS_DATA_FOLDER;
                    //require the default nginx and service catalog recipes
                    var catalogDefaulEntries = require(dataFolder + "catalogs/index.js");
                    var dashboardCatalogEntries = [catalogDefaulEntries[0], catalogDefaulEntries[3]];
                    //update the catalog recipes to include data used for dashboard environment deployment
                    dashboardCatalogEntries[0] = lib.updateServiceRecipe(dashboardCatalogEntries[0]);
                    dashboardCatalogEntries[1] = lib.updateNginxRecipe(dashboardCatalogEntries[1]);
                    //add catalogs to the database
                    mongo.insert("catalogs", dashboardCatalogEntries, (error, catalogEntries) => {
                        if(error){
                            return cb(error);
                        }

                        process.env.DASH_SRV_ID = catalogEntries[0]._id.toString();
                        process.env.DASH_NGINX_ID = catalogEntries[1]._id.toString();
                        return cb();
                    });
                }, 2000);
            }
            else {
                throw new Error(`Data import failed, exit code: ${code}`);
            }
        });
        importFiles.on("error", (error) => {
            utilLog.log ("Error while importing the data files.");
            return cb(error);
        });
    },

    initNamespace: function (deployer, options, cb) {
        //options.namespace
        //1. check if namespace already exists. if it does, return true
        //2. if namespace does not exist create it and return true
        deployer.core.namespaces.get({}, function (error, namespacesList) {
            if (error) return cb(error);

            async.detect(namespacesList.items, function (oneNamespace, callback) {
                return callback(null, oneNamespace.metadata.name === options.namespace);
            }, function (error, foundNamespace) {
                if (foundNamespace) {
                    utilLog.log('Reusing existing namespace: ' + foundNamespace.metadata.name + ' ...');
                    return cb(null, true);
                }

                utilLog.log('Creating a new namespace: ' + options.namespace + ' ...');
                var namespace = {
                    kind: 'Namespace',
                    apiVersion: 'v1',
                    metadata: {
                        name: options.namespace,
                        labels: {
                            'soajs.content': 'true'
                        }
                    }
                };
                deployer.core.namespace.post({body: namespace}, cb);
            });
        });
    },

    deployService: function (deployer, options, cb) {
        var namespace = config.kubernetes.config.namespaces.default, serviceName;
        if (config.kubernetes.config.namespaces.perService) {
            serviceName = options.service.metadata.labels['soajs.service.label'];
            namespace += '-' + serviceName;
        }

        lib.initNamespace(deployer, {namespace: namespace}, function (error) {
            if (error) return cb(error);

            if (options.service) {

                //if deploying NGINX, modify the spec object according to deployType
                if(config.nginx.deployType === 'LoadBalancer') {
                    if (options.service.metadata.labels['soajs.service.type'] === 'nginx') {
                        options.service.spec.type = 'LoadBalancer';
                        if (options.service.spec.ports[0]) {
                            delete options.service.spec.ports[0].nodePort;
                        }
                        if (options.service.spec.ports[1]) {
                            delete options.service.spec.ports[1].nodePort;
                        }
                    }
                }

                deployer.core.namespaces(namespace).services.post({body: options.service}, function (error) {
                    if (error) return cb(error);
                    createDeployment(cb);
                });
            }
            else {
                createDeployment(cb);
            }
        });

        function createDeployment(cb1) {
            deployer.extensions.namespaces(namespace).deployments.post({body: options.deployment}, cb1);
        }
    },

    deleteDeployments: function (deployer, options, cb) {
        var filter = { labelSelector: 'soajs.content=true' };
        deployer.extensions.deployments.get({qs: filter}, function (error, deploymentList) {
            if (error) return cb(error);

            if (!deploymentList || !deploymentList.items || deploymentList.items.length === 0) return cb();
            var params = { gracePeriodSeconds: 0 };
            async.each(deploymentList.items, function (oneDeployment, callback) {
                oneDeployment.spec.replicas = 0;
                deployer.extensions.namespaces(oneDeployment.metadata.namespace).deployments.put({ name: oneDeployment.metadata.name, body: oneDeployment }, function (error) {
                    if (error) return callback(error);

                    setTimeout(function () {
                        deployer.extensions.namespaces(oneDeployment.metadata.namespace).deployments.delete({ name: oneDeployment.metadata.name, qs: params }, callback);
                    }, 5000);
                });
            }, cb);
        });
    },

    deleteKubeServices: function (deployer, options, cb) {
        var filter = { labelSelector: 'soajs.content=true', gracePeriodSeconds: 0  };
        deployer.core.services.get({qs: filter}, function (error, serviceList) {
            if (error) return cb(error);

            if (!serviceList || !serviceList.items || serviceList.items.length === 0) return cb();
            async.each(serviceList.items, function (oneService, callback) {
                deployer.core.namespaces(oneService.metadata.namespace).services.delete({ name: oneService.metadata.name }, callback);
            }, cb);
        });
    },

    deletePods: function (deployer, options, cb) {
        //force delete all pods for a better cleanup
        var filter = { labelSelector: 'soajs.content=true' };
        deployer.core.pods.get({ qs: filter }, function (error, podList) {
            if (error) return cb(error);

            if (!podList || !podList.items || podList.items.length === 0) return cb();
            var params = { gracePeriodSeconds: 0 };
            async.each(podList.items, function (onePod, callback) {
                deployer.core.namespaces(onePod.metadata.namespace).pods.delete({ name: onePod.metadata.name, qs: params }, callback);
            }, cb);
        });
    },

    ensurePods: function (deployer, options, counter, cb) {
        if (typeof (counter) === 'function') {
            cb = counter; //counter wasn't passed as param
            counter = 0;
        }

        var filter = { labelSelector: 'soajs.content=true' };
        deployer.core.pods.get({ qs: filter }, function (error, podList) {
            if (error) return cb(error);

            if (!podList || !podList.items || podList.items.length === 0) {
                console.log (); // moving to new line
                return cb();
            }

            if (podList.items.length > 0) {
                lib.printProgress('Waiting for all previous pods to terminate', counter++);
                setTimeout(function () {
                    return lib.ensurePods(deployer, options, cb);
                }, 1000);
            }
        });
    },

    deleteReplicaSets: function (deployer, params, cb) {
        var options = {
            method: 'GET',
            uri: deployer.extensions.url + deployer.extensions.path + '/replicasets',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + deployer.extensions.requestOptions.auth.bearer
            },
            qs: {
                labelSelector: 'soajs.content=true'
            },
            json: true,
            "strictSSL": false
        };

        request(options, function (error, response, rsList) {
            if (error) return cb(error);

            if (!rsList || !rsList.items || rsList.items.length === 0) return cb();
            async.each(rsList.items, function (oneRS, callback) {
                var reqOpts = clone(options);

                reqOpts.method = 'DELETE';
                reqOpts.uri = deployer.extensions.url + oneRS.metadata.selfLink;

                reqOpts.qs = { gracePeriodSeconds: 0 };
                setTimeout(function () {
                    request(options, function (error, response, body) {
                        if (error) return callback(error);

                        return callback(null, true);
                    });
                }, 5000);
            }, cb);
        });
    },

    deleteNamespaces: function (deployer, options, cb) {
        var filter = { labelSelector: 'soajs.content=true' };
        deployer.core.namespaces.delete({ qs: filter }, cb);
    },

    deletePreviousServices: function (deployer, cb) {
        lib.deleteDeployments(deployer, {}, function (error) {
            if (error) return cb(error);

            lib.deleteReplicaSets(deployer, {}, function (error) {
                if (error) return cb(error);

                lib.deleteKubeServices(deployer, {}, function (error) {
                    if (error) return cb(error);

                    lib.deletePods(deployer, {}, function (error) {
                        if (error) return cb(error);

                        lib.ensurePods(deployer, {}, function (error) {
                            if (error) return cb(error);

                            return cb();
                        });
                    });
                });
            });
        });
    },

    getServiceIPs: function (serviceName, deployer, replicaCount, counter, cb) {
        if (typeof (counter) === 'function') {
            cb = counter; //counter wasn't passed as param
            counter = 0;
        }

        var namespace = config.kubernetes.config.namespaces.default;
        if (config.kubernetes.config.namespaces.perService) {
            namespace += '-' + serviceName;
        }

        //if serviceName is provided with namespace, remove namespace and filter only by service name
        //splitting based on dots is ok since it's a reseverd char in kubernetes, no service name can include a dot
        if (serviceName.indexOf('.') !== -1) {
            serviceName = serviceName.split('.')[0];
        }

        var filter = { labelSelector: 'soajs.service.label=' + serviceName };
        deployer.core.namespaces(namespace).pods.get({ qs: filter }, function (error, podList) {
            if (error) return cb(error);
            var onePod, ips = [];
            if (podList && podList.items && Array.isArray(podList.items)) {
                podList.items.forEach(function (onePod) {
                    if (onePod.status.phase === 'Running' && onePod.metadata.namespace === namespace) {
                        ips.push({
                            name: onePod.metadata.name,
                            ip: onePod.status.podIP
                        });
                    }
                });
            }

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
            if(config.mongo.rsName && config.mongo.rsName !== null){
                mongoEnv.push({name: 'SOAJS_MONGO_RSNAME', value: config.mongo.rsName});
            }

            // if (!config.dataLayer.mongo.url || !config.dataLayer.mongo.port) {
            if (!profile.servers[0].host || !profile.servers[0].port) {
                utilLog.log('ERROR: External Mongo information is missing URL or port, make sure SOAJS_MONGO_EXTERNAL_URL and SOAJS_MONGO_EXTERNAL_PORT are set ...');
                return cb('ERROR: missing mongo information');
            }

            mongoEnv.push({ name: 'SOAJS_MONGO_NB', value: '' + profile.servers.length });
            for(var i = 0; i < profile.servers.length; i++){
                mongoEnv.push({name: 'SOAJS_MONGO_IP_' + (i + 1), value: profile.servers[i].host});
                mongoEnv.push({name: 'SOAJS_MONGO_PORT_' + (i + 1), value: '' + profile.servers[i].port});
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


    closeDbCon: function (cb) {
        mongo.closeDb();
        return cb();
    }
};

module.exports = lib;
//
