'use strict';
var K8Api = require('kubernetes-client');
var async = require('async');

var path = require('path');
var fs = require('fs');
var Grid = require('gridfs-stream');
var exec = require('child_process').exec;
var soajs = require('soajs');
var request = require('request');
var clone = require('clone');

var config = require('./config.js');
var folder = config.folder;
delete require.cache[config.profile];
var profile = soajs.utils.cloneObj(require(config.profile));
var profile2 = JSON.parse(JSON.stringify(profile));
if(!process.env.MONGO_EXT || process.env.MONGO_EXT === 'false'){
	profile2.servers[0].port = parseInt(process.env.MONGO_PORT) || 27017;
}
var mongo = new soajs.mongo(profile2);
var analyticsCollection = 'analytics';
var dbConfiguration = require('../../../data/startup/environments/dashboard');
var esClient;
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
        };

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
	    if (type === 'elk' && (!config.analytics || config.analytics === "false")){
		    return cb(null, true);
	    }
        async.eachSeries(services, function (oneService, callback) {
            if(type === "core"){
                oneService.service.metadata.labels["soajs.catalog.id"] = process.env.DASH_SRV_ID;
                oneService.deployment.metadata.labels["soajs.catalog.id"] = process.env.DASH_SRV_ID;
                oneService.deployment.spec.template.metadata.labels["soajs.catalog.id"] = process.env.DASH_SRV_ID;
	            oneService.deployment.spec.template.metadata.labels["soajs.catalog.v"] = "1";
	            oneService.deployment.spec.template.metadata.labels["service.image.ts"] = new Date().getTime().toString();
            }
            else if (type === "nginx"){
                oneService.service.metadata.labels["soajs.catalog.id"] = process.env.DASH_NGINX_ID;
                oneService.deployment.metadata.labels["soajs.catalog.id"] = process.env.DASH_NGINX_ID;
                oneService.deployment.spec.template.metadata.labels["soajs.catalog.id"] = process.env.DASH_NGINX_ID;
	            oneService.deployment.spec.template.metadata.labels["soajs.catalog.v"] = "1";
	            oneService.deployment.spec.template.metadata.labels["service.image.ts"] = new Date().getTime().toString();
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
    	delete nginxRecipe.locked;
        nginxRecipe.name = "Dashboard Nginx Recipe";
        nginxRecipe.description = "This is the nginx catalog recipe used to deploy the nginx in the dashboard environment."
	    nginxRecipe.recipe.deployOptions.image.prefix = config.imagePrefix;
        if (process.env.SOAJS_IMAGE_PULL_POLICY) {
            nginxRecipe.recipe.deployOptions.image.pullPolicy = process.env.SOAJS_IMAGE_PULL_POLICY;
        }

        if(process.env.SOAJS_NX_SSL === 'true'){
            process.env['SOAJS_NX_API_HTTPS']=1;
            process.env['SOAJS_NX_API_HTTP_REDIRECT']=1;
            process.env['SOAJS_NX_SITE_HTTPS']=1;
            process.env['SOAJS_NX_SITE_HTTP_REDIRECT']=1;
        }

	    nginxRecipe.recipe.deployOptions.ports[0].published = config.nginx.port.http;
	    nginxRecipe.recipe.deployOptions.ports[1].published = config.nginx.port.https;

	    nginxRecipe.recipe.buildOptions.env["SOAJS_GIT_DASHBOARD_BRANCH"] = {
		    "type": "static",
		    "value": config.dashUISrc.branch
	    };

	    if (config.customUISrc.repo && config.customUISrc.owner) {
		    nginxRecipe.recipe.buildOptions.env["SOAJS_GIT_REPO"] = {
			    "type": "userInput",
			    "default": config.customUISrc.repo,
                "label": "Git Repository"
		    };

		    nginxRecipe.recipe.buildOptions.env["SOAJS_GIT_OWNER"] = {
			    "type": "userInput",
			    "default": config.customUISrc.owner,
                "label": "Git Owner"
		    };

		    if (config.customUISrc.branch) {
			    nginxRecipe.recipe.buildOptions.env["SOAJS_GIT_BRANCH"] = {
				    "type": "userInput",
				    "default": config.customUISrc.branch,
                    "label": "Git Branch"
			    };
		    }

		    if (config.customUISrc.provider) {
			    nginxRecipe.recipe.buildOptions.env["SOAJS_GIT_PROVIDER"] = {
				    "type": "userInput",
				    "default": config.customUISrc.provider,
                    "label": "Git Provider"
			    };
		    }

		    if (config.customUISrc.domain) {
			    nginxRecipe.recipe.buildOptions.env["SOAJS_GIT_DOMAIN"] = {
				    "type": "userInput",
				    "default": config.customUISrc.domain,
                    "label": "Git Domain"
			    };
		    }

		    if (config.customUISrc.token) {
			    nginxRecipe.recipe.buildOptions.env["SOAJS_GIT_TOKEN"] = {
				    "type": "userInput",
				    "default": config.customUISrc.token,
                    "label": "Git Token"
			    };
		    }
		
		    if (config.customUISrc.path) {
			    nginxRecipe.recipe.buildOptions.env["SOAJS_GIT_PATH"] = {
				    "type": "userInput",
				    "default": config.customUISrc.path,
				    "label": "Git Path"
			    };
		    }
	    }

        //Add every environment variable that is added by the installer.
        //Add environment variables related to SSL
        if(process.env.SOAJS_NX_API_HTTPS){
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_API_HTTPS"] = {
                "type": "userInput",
                "default": process.env.SOAJS_NX_API_HTTPS,
                "label": "API HTTPS"
            };
        }
        if(process.env.SOAJS_NX_API_HTTP_REDIRECT){
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_API_HTTP_REDIRECT"] = {
                "type": "userInput",
                "default": process.env.SOAJS_NX_API_HTTP_REDIRECT,
                "label": "API HTTP Redirect"
            };
        }
        if(process.env.SOAJS_NX_SITE_HTTPS){
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_SITE_HTTPS"] = {
                "type": "userInput",
                "default": process.env.SOAJS_NX_SITE_HTTPS,
                "label": "Site HTTPS"
            };
        }
        if(process.env.SOAJS_NX_SITE_HTTP_REDIRECT){
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_SITE_HTTP_REDIRECT"] = {
                "type": "userInput",
                "default": process.env.SOAJS_NX_SITE_HTTP_REDIRECT,
                "label": "Site HTTP Redirect"
            };
        }

        if(process.env.SOAJS_NX_SSL_SECRET){
            //Add environment variable containing the value of the SSL secret
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_SSL_SECRET"] = {
                "type": "userInput",
                "default": process.env.SOAJS_NX_SSL_SECRET,
                "label": "Nginx SSL Secret"
            };
            //Add environment variable related to custom SSL
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_CUSTOM_SSL"] = {
                "type": "userInput",
                "default": "1",
                "label": "Enable Custom SSL"
            };
            //Add environment variable containing the location of the certificates
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_SSL_CERTS_LOCATION"] = {
                "type": "userInput",
                "default": "/etc/soajs/ssl",
                "label": "Certificates Location"
            };

            //Add secret volume to the recipe's volumes
            if (!nginxRecipe.recipe.deployOptions.voluming) {
                nginxRecipe.recipe.deployOptions.voluming = { volumes: [], volumeMounts: [] };
            }
            nginxRecipe.recipe.deployOptions.voluming.volumes.push({
                name: 'ssl',
    			secret: {
    				secretName: process.env.SOAJS_NX_SSL_SECRET
    			}
            });
            nginxRecipe.recipe.deployOptions.voluming.volumeMounts.push({
                name: 'ssl',
    			mountPath: '/etc/soajs/ssl/',
    			readOnly: true
            });
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
    	delete serviceRecipe.locked;
        serviceRecipe.name = "Dashboard Service Recipe";
	    serviceRecipe.description = "This is the service catalog recipe used to deploy the core services in the dashboard environment."
        serviceRecipe.recipe.deployOptions.image.prefix = config.imagePrefix;
        if (process.env.SOAJS_IMAGE_PULL_POLICY) {
            serviceRecipe.recipe.deployOptions.image.pullPolicy = process.env.SOAJS_IMAGE_PULL_POLICY;
        }

	    if(config.deploy_acc){
		    serviceRecipe.recipe.buildOptions.env["SOAJS_DEPLOY_ACC"] = {
			    "type": "static",
			    "value": "true"
		    };
	    }

        //Add environment variables containing mongo information
        if(profile.servers && profile.servers.length > 0){
            serviceRecipe.recipe.buildOptions.env["SOAJS_MONGO_NB"] = {
                "type": "computed",
                "value": "$SOAJS_MONGO_NB"
            };

	        serviceRecipe.recipe.buildOptions.env["SOAJS_MONGO_IP"] = {
		        "type": "computed",
		        "value": "$SOAJS_MONGO_IP_N"
	        };

	        serviceRecipe.recipe.buildOptions.env["SOAJS_MONGO_PORT"] = {
		        "type": "computed",
		        "value": "$SOAJS_MONGO_PORT_N"
	        };
        }

        if(profile.prefix && profile.prefix !== ''){
            serviceRecipe.recipe.buildOptions.env["SOAJS_MONGO_PREFIX"] = {
                "type": "computed",
                "value": "$SOAJS_MONGO_PREFIX"
            };
        }

        if(profile.URLParam.replicaSet){
            serviceRecipe.recipe.buildOptions.env["SOAJS_MONGO_RSNAME"] = {
                "type": "computed",
                "value": "$SOAJS_MONGO_RSNAME"
            };
        }

        if(profile.URLParam.authSource){
            serviceRecipe.recipe.buildOptions.env["SOAJS_MONGO_AUTH_DB"] = {
                "type": "computed",
                "value": "$SOAJS_MONGO_AUTH_DB"
            };
        }

        if(profile.URLParam.ssl){
            serviceRecipe.recipe.buildOptions.env["SOAJS_MONGO_SSL"] = {
                "type": "computed",
                "value": "$SOAJS_MONGO_SSL"
            };
        }

	    if(profile.credentials.username){
		    serviceRecipe.recipe.buildOptions.env["SOAJS_MONGO_USERNAME"] = {
			    "type": "computed",
			    "value": "$SOAJS_MONGO_USERNAME"
		    };
	    }

	    if(profile.credentials.password){
		    serviceRecipe.recipe.buildOptions.env["SOAJS_MONGO_PASSWORD"] = {
			    "type": "computed",
			    "value": "$SOAJS_MONGO_PASSWORD"
		    };
	    }

        return serviceRecipe;
    },

    importData: function (mongoInfo, cb) {
        utilLog.log('Importing provision data to:', profile.servers[0].host + ":" + profile.servers[0].port);
        var dataImportFile = __dirname + "/../dataImport/index.js";
        var execString = process.env.NODE_PATH + " " + dataImportFile;
        exec(execString, function (error, stdout, stderr) {
            if (error) {
                utilLog.log(error);
            }
            setTimeout(function () {
                const dataFolder = process.env.SOAJS_DATA_FOLDER;
                //require the default nginx and service catalog recipes
                var catalogDefaulEntries = require(dataFolder + "catalogs/index.js");
                var dashboardCatalogEntries = [catalogDefaulEntries[0], catalogDefaulEntries[3]];
                //update the catalog recipes to include data used for dashboard environment deployment
                dashboardCatalogEntries[0] = lib.updateServiceRecipe(dashboardCatalogEntries[0]);
                dashboardCatalogEntries[1] = lib.updateNginxRecipe(dashboardCatalogEntries[1]);
                //add catalogs to the database
                mongo.insert("catalogs", dashboardCatalogEntries, true, (error, catalogEntries) => {
                    if(error){
                        return cb(error);
                    }
	                utilLog.log("Dashboard Catalog Recipes updated.");
                    process.env.DASH_SRV_ID = catalogEntries[0]._id.toString();
                    process.env.DASH_NGINX_ID = catalogEntries[1]._id.toString();
                    return cb();
                });
            }, 5000);
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
            serviceName = options.deployment.metadata.labels['soajs.service.label'];
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
	                createDeployment(function () {
		                if (config.analytics === "true") {
			                //check if elasticsearch
			                if (options.deployment.metadata.name === "soajs-analytics-elasticsearch") {
				                lib.configureElastic(deployer, options, cb);
			                }
			                else {
				                lib.configureKibana(deployer, options, cb);
			                }
		                }
		                else {
			                return cb(null, true);
		                }
	                });
                });
            }
            else {
                createDeployment(cb);
            }
        });

        function createDeployment(cb1) {
	        //support daemonsets
	        var deploytype;
	        if (options.deployment.kind === "DaemonSet") {
		        deploytype = "daemonsets";
	        }
	        else if (options.deployment.kind === "Deployment") {
		        deploytype = "deployments";
	        }
            deployer.extensions.namespaces(namespace)[deploytype].post({body: options.deployment}, cb1);
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


	configureElastic: function (deployer, serviceOptions, cb) {
		mongo.findOne('analytics', {_type: 'settings'}, function (error, settings) {
			if (error) {
				return cb(error);
			}
			if (settings && settings.elasticsearch && dbConfiguration.dbs.databases[settings.elasticsearch.db_name]) {
				var cluster = dbConfiguration.dbs.databases[settings.elasticsearch.db_name].cluster;
				//change to exposed port
				dbConfiguration.dbs.clusters[cluster].servers[0].port = 30920;
				if (!process.env.SOAJS_INSTALL_DEBUG){
					dbConfiguration.dbs.clusters[cluster].extraParam.log = [{
						type: 'stdio',
						levels: [] // remove the logs
					}];
				}
				esClient = new soajs.es(dbConfiguration.dbs.clusters[cluster]);
			}
			else {
				throw new Error("No Elastic db name found!");
			}
			lib.getServiceIPs(serviceOptions.deployment.metadata.name, deployer, serviceOptions.deployment.spec.replicas, function (error) {
				if (error) return cb(error);
				pingElastic(function (err, esResponse) {
					utilLog.log('Configuring elasticsearch ...');
					async.series({
						"mapping": function (callback) {
							putMapping(callback);
						},
						"template": function (callback) {
							putTemplate(callback);
						},
						"settings": function (callback) {
							putSettings(esResponse, settings, callback);
						}
					}, function (err) {
						if (err) return cb(err);

						return cb(null, true);
					});
				});
			});
		});

		function pingElastic(cb) {
			esClient.ping(function (error) {
				if (error) {
					lib.printProgress('Waiting for ' + serviceOptions.deployment.metadata.name + ' server to become connected');
					setTimeout(function () {
						pingElastic(cb);
					}, 2000);
				}
				else {
					infoElastic(function (err, response) {
						if (error) {
							cb(err);
						}
						else {
							//delete all indexes
							var params = {
								index: '_all'
							};
							esClient.db.indices.delete(params, function (err) {
								return cb(err, response);
							});
						}
					});
				}
			});
		}

		function infoElastic(cb) {
			esClient.db.info(function (error, response) {
				if (error) {
					lib.printProgress('Waiting for ' + serviceOptions.deployment.metadata.name + ' server to become available');
					setTimeout(function () {
						infoElastic(cb);
					}, 3000);
				}
				else {
					return cb(null, response);
				}
			});
		}

		function putTemplate(cb) {
			mongo.find('analytics', {_type: 'template'}, function (error, templates) {
				if (error) return cb(error);
				async.each(templates, function (oneTemplate, callback) {
					if (oneTemplate._json.dynamic_templates && oneTemplate._json.dynamic_templates["system-process-cgroup-cpuacct-percpu"]) {
						oneTemplate._json.dynamic_templates["system.process.cgroup.cpuacct.percpu"] = oneTemplate._json.dynamic_templates["system-process-cgroup-cpuacct-percpu"];
						delete oneTemplate._json.dynamic_templates["system-process-cgroup-cpuacct-percpu"];
					}
					oneTemplate._json.settings["index.mapping.total_fields.limit"] = oneTemplate._json.settings["index-mapping-total_fields-limit"];
					oneTemplate._json.settings["index.refresh_interval"] = oneTemplate._json.settings["index-refresh_interval"];
					delete oneTemplate._json.settings["index-refresh_interval"];
					delete oneTemplate._json.settings["index-mapping-total_fields-limit"];
					var options = {
						'name': oneTemplate._name,
						'body': oneTemplate._json
					};
					esClient.db.indices.putTemplate(options, function (error) {
						return callback(error, true);
					});
				}, cb);
			});
		}

		function putMapping(cb) {
			mongo.findOne('analytics', {_type: 'mapping'}, function (error, mapping) {
				if (error) return cb(error);
				var mappings = {
					index: '.kibana',
				};
				esClient.db.indices.exists(mappings, function (error, result) {
					if (error || !result) {
						mappings = {
							index: '.kibana',
							body: {
								"mappings": mapping._json
							}
						};
						esClient.db.indices.create(mappings, function (error) {
							return cb(error, true);
						});
					}
					else {
						return cb(null, true);
					}
				});
			});
		}

		function putSettings(esResponse, settings, cb) {
			settings.env = {
				"dashboard": true
			};
			settings.elasticsearch.status = "deployed";
			settings.elasticsearch.version = esResponse.version.number;
			mongo.save('analytics', settings, function (error) {
				if (error) {
					return cb(error);
				}
				return cb(null, true)
			});
		}
	},

	configureKibana: function (deployer, serviceOptions, cb) {
		var dockerServiceName = serviceOptions.deployment.metadata.name;
		var serviceGroup, serviceName, serviceEnv, serviceType;

		if (serviceOptions.deployment.metadata.labels) {
			serviceGroup = serviceOptions.deployment.metadata.labels['soajs.service.group'];
			serviceName = serviceOptions.deployment.metadata.labels['soajs.service.repo.name'];
			serviceEnv = serviceOptions.deployment.metadata.labels['soajs.env.code'];
		}
		if (serviceGroup === 'soajs-core-services') {
			serviceType = (serviceName === 'soajs_controller') ? 'controller' : 'service';
		}
		else if (serviceGroup === 'nginx') {
			serviceType = 'nginx';
			serviceName = 'nginx';
		}
		else {
			return cb(null, true);
		}
		var replicaCount = serviceOptions.deployment.spec.replicas;
		utilLog.log('Fetching analytics for ' + serviceName);
		var analyticsArray = [];
		async.parallel({
			"filebeat": function (callback) {
				lib.getServiceIPs(dockerServiceName, deployer, replicaCount, function (error, serviceIPs) {
					if (error) return cb(error);
					var options = {
						"$or": [
							{
								"$and": [
									{
										"_type": {
											"$in": ["dashboard", "visualization", "search"]
										}
									},
									{
										"_service": serviceType
									}
								]

							}
						]
					};
					serviceEnv.replace(/[\/*?"<>|,.-]/g, "_");
					//insert index-patterns to kibana
					serviceIPs.forEach(function (task_Name, key) {
						task_Name.name = task_Name.name.replace(/[\/*?"<>|,.-]/g, "_");

						//filebeat-service-environment-taskname-*

						//filebeat-service-environment-taskname-*
						var filebeatIndex = require("../analytics/indexes/filebeat-index");
						// var allIndex = require("../analytics/indexes/all-index");
						// analyticsArray = analyticsArray.concat(
						// 	[
						// 		{
						// 			index: {
						// 				_index: '.kibana',
						// 				_type: 'index-pattern',
						// 				_id: 'filebeat-' + serviceName + "-" + serviceEnv + "-" + task_Name.name + "-" + "*"
						// 			}
						// 		},
						// 		{
						// 			title: 'filebeat-' + serviceName + "-" + serviceEnv + "-" + task_Name.name + "-" + "*",
						// 			timeFieldName: '@timestamp',
						// 			fields: filebeatIndex.fields,
						// 			fieldFormatMap: filebeatIndex.fieldFormatMap
						// 		}
						// 	]
						// );

						// analyticsArray = analyticsArray.concat(
						// 	[
						// 		{
						// 			index: {
						// 				_index: '.kibana',
						// 				_type: 'index-pattern',
						// 				_id: '*-' + serviceName + "-" + serviceEnv + "-" + task_Name.name + "-" + "*"
						// 			}
						// 		},
						// 		{
						// 			title: '*-' + serviceName + "-" + serviceEnv + "-" + task_Name.name + "-" + "*",
						// 			timeFieldName: '@timestamp',
						// 			fields: allIndex.fields,
						// 			fieldFormatMap: allIndex.fieldFormatMap
						// 		}
						// 	]
						// );


						if (key == 0) {
							//filebeat-service-environment-*

							analyticsArray = analyticsArray.concat(
								[
									{
										index: {
											_index: '.kibana',
											_type: 'index-pattern',
											_id: 'filebeat-' + serviceName + "-" + serviceEnv + "-" + "*"
										}
									},
									{
										title: 'filebeat-' + serviceName + "-" + serviceEnv + "-" + "*",
										timeFieldName: '@timestamp',
										fields: filebeatIndex.fields,
										fieldFormatMap: filebeatIndex.fieldFormatMap
									}
								]
							);


							// analyticsArray = analyticsArray.concat(
							// 	[
							// 		{
							// 			index: {
							// 				_index: '.kibana',
							// 				_type: 'index-pattern',
							// 				_id: '*-' + serviceName + "-" + serviceEnv + "-" + "*"
							// 			}
							// 		},
							// 		{
							// 			title: '*-' + serviceName + "-" + serviceEnv + "-" + "*",
							// 			timeFieldName: '@timestamp',
							// 			fields: allIndex.fields,
							// 			fieldFormatMap: allIndex.fieldFormatMap
							// 		}
							// 	]
							// );

							//filebeat-service-environment-*


							// analyticsArray = analyticsArray.concat(
							// 	[
							// 		{
							// 			index: {
							// 				_index: '.kibana',
							// 				_type: 'index-pattern',
							// 				_id: 'filebeat-' + serviceName + '-' + "*"
							// 			}
							// 		},
							// 		{
							// 			title: 'filebeat-' + serviceName + '-' + "*",
							// 			timeFieldName: '@timestamp',
							// 			fields: filebeatIndex.fields,
							// 			fieldFormatMap: filebeatIndex.fieldFormatMap
							// 		}
							// 	]
							// );

							// analyticsArray = analyticsArray.concat(
							// 	[
							// 		{
							// 			index: {
							// 				_index: '.kibana',
							// 				_type: 'index-pattern',
							// 				_id: '*-' + serviceName + "-" + "*"
							// 			}
							// 		},
							// 		{
							// 			title: '*-' + serviceName + "-" + "*",
							// 			timeFieldName: '@timestamp',
							// 			fields: allIndex.fields,
							// 			fieldFormatMap: allIndex.fieldFormatMap
							// 		}
							// 	]
							// );
						}
					});

					//insert visualization, search and deshbord rrecords per service  to kibana
					mongo.find(analyticsCollection, options, function (error, records) {
						if (error) {
							return cb(error);
						}
						records.forEach(function (oneRecord) {
							if (Array.isArray(serviceIPs) && serviceIPs.length > 0) {
								serviceIPs.forEach(function (task_Name) {
									task_Name.name = task_Name.name.replace(/[\/*?"<>|,.-]/g, "_");
									var serviceIndex;
									if (oneRecord._type === "visualization" || oneRecord._type === "search") {
										serviceIndex = serviceName + "-";
										if (oneRecord._injector === "service") {
											serviceIndex = serviceIndex + serviceEnv + "-" + "*";
										}
										else if (oneRecord._injector === "env") {
											serviceIndex = "*-" + serviceEnv + "-" + "*";
										}
										else if (oneRecord._injector === "taskname") {
											serviceIndex = serviceIndex + serviceEnv + "-" + task_Name.name + "-" + "*";
										}
									}

									var injector;
									if (oneRecord._injector === 'service') {
										injector = serviceName + "-" + serviceEnv;
									}
									else if (oneRecord._injector === 'taskname') {
										injector = task_Name.name;
									}
									else if (oneRecord._injector === 'env') {
										injector = serviceEnv;
									}
									oneRecord = JSON.stringify(oneRecord);
									if (serviceIndex) {
										oneRecord = oneRecord.replace(/%serviceIndex%/g, serviceIndex);
									}
									if (injector) {
										oneRecord = oneRecord.replace(/%injector%/g, injector);
									}
									oneRecord = oneRecord.replace(/%env%/g, serviceEnv);
									oneRecord = JSON.parse(oneRecord);
									var recordIndex = {
										index: {
											_index: '.kibana',
											_type: oneRecord._type,
											_id: oneRecord.id
										}
									};

									analyticsArray = analyticsArray.concat([recordIndex, oneRecord._source]);
								});
							}
						});
						return callback(null, true);
					});
				});
			},
			"metricbeat": function (callback) {
				var metricbeatIndex = require("../analytics/indexes/metricbeat-index");
				var filebeatIndex = require("../analytics/indexes/filebeat-index");
				analyticsArray = analyticsArray.concat(
					[
						{
							index: {
								_index: '.kibana',
								_type: 'index-pattern',
								_id: 'metricbeat-*'
							}
						},
						{
							title: 'metricbeat-*',
							timeFieldName: '@timestamp',
							fields: metricbeatIndex.fields,
							fieldFormatMap: metricbeatIndex.fieldFormatMap
						}
					]
				);
				analyticsArray = analyticsArray.concat(
					[
						{
							index: {
								_index: '.kibana',
								_type: 'index-pattern',
								_id: 'filebeat-*-' + serviceEnv + "-*"
							}
						},
						{
							title: 'filebeat-*-' + serviceEnv + "-*",
							timeFieldName: '@timestamp',
							fields: filebeatIndex.fields,
							fieldFormatMap: filebeatIndex.fieldFormatMap
						}
					]
				);
				var condition = {
					"_shipper": "metricbeat"
				};
				mongo.find(analyticsCollection, condition, function (error, records) {
					if (error) {
						return callback(error);
					}
					if (records && records.length > 0) {
						records.forEach(function (onRecord) {
							onRecord = JSON.stringify(onRecord);
							onRecord = onRecord.replace(/%env%/g, serviceEnv);
							onRecord = JSON.parse(onRecord);
							var recordIndex = {
								index: {
									_index: '.kibana',
									_type: onRecord._type,
									_id: onRecord.id
								}
							};
							analyticsArray = analyticsArray.concat([recordIndex, onRecord._source]);
						});

					}
					return callback(null, true);

				});
			}
		}, function (err) {
			if (err) {
				return cb(err);
			}
			function esBulk(array, cb) {
				esClient.bulk(array, function (error, response) {
					if (error) {
						return cb(error)
					}
					return cb(error, response);
				});
			}

			if (analyticsArray.length !== 0) {
				esClient.checkIndex('.kibana', function (error, response) {
					if (error) {
						return cb(error);
					}
					if (response) {
						esBulk(analyticsArray, cb);
					}
					else {
						esClient.createIndex('.kibana', function (error) {
							if (error) {
								return cb(error);
							}
							esBulk(analyticsArray, cb);
						})
					}
				});
			}
			else {
				return cb(null, true);
			}
		});
	},

	setDefaultIndex: function (cb) {

		var index = {
			index: ".kibana",
			type: 'config',
			body: {
				doc: {"defaultIndex": "metricbeat-*"}
			}
		};
		var condition = {
			index: ".kibana",
			type: 'config'
		};
		esClient.db.search(condition, function (err, res) {
			if (err) {
				return cb(err);
			}
			if (res && res.hits && res.hits.hits && res.hits.hits.length > 0) {
				mongo.findOne(analyticsCollection, {"_type": "settings"}, function (err, result) {
					if (err) {
						return cb(err);
					}
					if (result && result.env && result.env.dashboard) {
						index.id = res.hits.hits[0]._id;

						async.parallel({
							"updateES": function (call) {
								esClient.db.update(index, call);
							},
							"updateSettings": function (call) {
								var condition = {
									"_type": "settings"
								};
								var criteria = {
									"$set": {
										"kibana": {
											"version": index.id,
											"status": "deployed",
											"port": "32601"
										},
										"logstash": {
											"dashboard": {
												"status": "deployed"
											}
										},
										"filebeat": {
											"dashboard": {
												"status": "deployed"
											}
										},
										"metricbeat": {
											"status": "deployed"
										}
									}
								};
								var options = {
									"safe": true,
									"multi": false,
									"upsert": true
								};
								mongo.update('analytics', condition, criteria, options, call);
							}

						}, cb);
					}
					else {
						setTimeout(function () {
							lib.printProgress('Waiting for kibana to become available');
							lib.setDefaultIndex(cb);
						}, 5000);
					}
				});
			}
			else {
				setTimeout(function () {
					lib.printProgress('Waiting for kibana to become available');
					lib.setDefaultIndex(cb);
				}, 1000);
			}
		});
	},

	closeDbCon: function (cb) {
		mongo.closeDb();
		if (esClient) {
			esClient.close();
		}
		return cb();
	}
};

module.exports = lib;
//
