'use strict';
var K8Api = require('kubernetes-client');
var async = require('async');

var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var soajs = require('soajs');
var request = require('request');
var clone = require('clone');

var config = require('./config.js');
delete require.cache[config.profile];
var profile = soajs.utils.cloneObj(require(config.profile));
var profile2 = JSON.parse(JSON.stringify(profile));
if(!process.env.MONGO_EXT || process.env.MONGO_EXT === 'false'){
	profile2.servers[0].port = parseInt(process.env.MONGO_PORT) || 27017;
}
var mongo = new soajs.mongo(profile2);
var dbConfiguration = require('../../../data/startup/environments/dashboard');
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

		lib.getServerVersion(deployerConfig, function (error, version) {
			if(error) return cb(error);

			if(version && version.major && version.minor) {
				utilLog.log('Kubernetes server version is: ' + version.major + '.' + version.minor);
			}

			deployerConfig.version = 'v1beta1';
	        deployer.extensions = new K8Api.Extensions(deployerConfig);
			deployer.rbac = new K8Api.Rbac(deployerConfig);
			deployer.apiregistration = new K8Api.ApiRegistration(deployerConfig);

	        deployerConfig.version = 'v1';
	        deployer.core = new K8Api.Core(deployerConfig);

			if(version.minor === '6') {
				deployerConfig.version = 'v2alpha1';
				deployer.autoscaling = new K8Api.Autoscaling(deployerConfig);
            }
            else if (version.minor === '7') {
				deployerConfig.version = 'v1';
				deployer.autoscaling = new K8Api.Autoscaling(deployerConfig);
            }

	        return cb(null, deployer);
		});
    },

	getServerVersion: function (deployerConfig, cb) {
        var requestOptions = {
            uri: deployerConfig.url + '/version',
            auth: {
                bearer: ''
            },
            strictSSL: false,
            json: true
        };

        if (deployerConfig.auth && deployerConfig.auth.bearer) {
            requestOptions.auth.bearer = deployerConfig.auth.bearer;
        }

        request.get(requestOptions, function (error, response, body) {
            if(error) return cb(error);

        	return cb(null, body);
        });
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
			if(type === 'plugins') {
				lib.checkIfDeployed(deployer, oneService, function(error, updatedService) {
					if(error) return cb(error);

					lib.deployService(deployer, updatedService, callback);
				});
			}
			else {
				let imgTs = new Date().getTime().toString();
				if(type === "core"){
	                oneService.service.metadata.labels["soajs.catalog.id"] = process.env.DASH_SRV_ID;
	                oneService.deployment.metadata.labels["soajs.catalog.id"] = process.env.DASH_SRV_ID;
	                oneService.deployment.spec.template.metadata.labels["soajs.catalog.id"] = process.env.DASH_SRV_ID;

	                oneService.service.metadata.labels["soajs.catalog.v"] = "1";
	                oneService.deployment.metadata.labels["soajs.catalog.v"] = "1";
	                oneService.deployment.spec.template.metadata.labels["soajs.catalog.v"] = "1";

		            oneService.service.metadata.labels["service.image.ts"] = imgTs;
		            oneService.deployment.metadata.labels["service.image.ts"] = imgTs;
	                oneService.deployment.spec.template.metadata.labels["service.image.ts"] = imgTs;
	            }
	            else if (type === "nginx"){
	                oneService.service.metadata.labels["soajs.catalog.id"] = process.env.DASH_NGINX_ID;
	                oneService.deployment.metadata.labels["soajs.catalog.id"] = process.env.DASH_NGINX_ID;
	                oneService.deployment.spec.template.metadata.labels["soajs.catalog.id"] = process.env.DASH_NGINX_ID;

	                oneService.service.metadata.labels["soajs.catalog.v"] = "1";
	                oneService.deployment.metadata.labels["soajs.catalog.v"] = "1";
	                oneService.deployment.spec.template.metadata.labels["soajs.catalog.v"] = "1";

		            oneService.service.metadata.labels["service.image.ts"] = imgTs;
		            oneService.deployment.metadata.labels["service.image.ts"] = imgTs;
	                oneService.deployment.spec.template.metadata.labels["service.image.ts"] = imgTs;
	            }

	            lib.deployService(deployer, oneService, callback);
			}
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
	    nginxRecipe.recipe.deployOptions.image.prefix = config.images.nginx.prefix;
	    nginxRecipe.recipe.deployOptions.image.tag = config.images.nginx.tag;

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

        //Add every environment variable that is added by the installer.
        //Add environment variables related to SSL
        if(process.env.SOAJS_NX_API_HTTPS){
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_API_HTTPS"] = {
                "type": "static",
                "default": process.env.SOAJS_NX_API_HTTPS,
                "label": "API HTTPS"
            };
        }
        if(process.env.SOAJS_NX_API_HTTP_REDIRECT){
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_API_HTTP_REDIRECT"] = {
                "type": "static",
                "default": process.env.SOAJS_NX_API_HTTP_REDIRECT,
                "label": "API HTTP Redirect"
            };
        }
        if(process.env.SOAJS_NX_SITE_HTTPS){
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_SITE_HTTPS"] = {
                "type": "static",
                "default": process.env.SOAJS_NX_SITE_HTTPS,
                "label": "Site HTTPS"
            };
        }
        if(process.env.SOAJS_NX_SITE_HTTP_REDIRECT){
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_SITE_HTTP_REDIRECT"] = {
                "type": "static",
                "default": process.env.SOAJS_NX_SITE_HTTP_REDIRECT,
                "label": "Site HTTP Redirect"
            };
        }

        if(process.env.SOAJS_NX_SSL_SECRET){
            //Add environment variable containing the value of the SSL secret
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_SSL_SECRET"] = {
                "type": "static",
                "default": process.env.SOAJS_NX_SSL_SECRET,
                "label": "Nginx SSL Secret"
            };
            //Add environment variable related to custom SSL
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_CUSTOM_SSL"] = {
                "type": "static",
                "default": "1",
                "label": "Enable Custom SSL"
            };
            //Add environment variable containing the location of the certificates
            nginxRecipe.recipe.buildOptions.env["SOAJS_NX_SSL_CERTS_LOCATION"] = {
                "type": "static",
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
        serviceRecipe.recipe.deployOptions.image.prefix = config.images.soajs.prefix;
        serviceRecipe.recipe.deployOptions.image.tag = config.images.soajs.tag;

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
        utilLog.log('Importing provision data to:', profile2.servers[0].host + ":" + profile2.servers[0].port);
        var dataImportFile = __dirname + "/../dataImport/index.js";
        var execString = process.env.NODE_PATH + " " + dataImportFile;
        exec(execString, function (error, stdout, stderr) {
            if (error) {
                utilLog.log(error);
            }
            setTimeout(function () {
                const dataFolder = process.env.SOAJS_DATA_FOLDER;
                var fields;
                //require the default nginx and service catalog recipes
                var catalogDefaulEntries = require(dataFolder + "catalogs/index.js");
                var dashboardCatalogEntries = [catalogDefaulEntries[0], catalogDefaulEntries[3]];
                //update the catalog recipes to include data used for dashboard environment deployment
                dashboardCatalogEntries[0] = lib.updateServiceRecipe(dashboardCatalogEntries[0]);
                dashboardCatalogEntries[1] = lib.updateNginxRecipe(dashboardCatalogEntries[1]);
	            if(process.env.SOAJS_NX_SSL === 'true'){
		            fields = {
			            "$set": {
				            protocol: "https",
				            port: dashboardCatalogEntries[1].recipe.deployOptions.ports[1].published
			            }
		            };
	            }
	            else {
		            fields = {
			            "$set": {
				            port: dashboardCatalogEntries[1].recipe.deployOptions.ports[0].published
			            }
		            };
	            }
	            var options = {
		            "safe": true,
		            "upsert": false,
		            "multi": false
	            };
	            var condition = {
		            "code": "DASHBOARD"
	            };
	            async.parallel({
		            insertCatalogs: function (callback) {
			            //add catalogs to the database
			            mongo.insert("catalogs", dashboardCatalogEntries, true, (error, catalogEntries) => {
				            if(error){
					            return callback(error);
				            }
				            utilLog.log("Dashboard Catalog Recipes updated.");
				            process.env.DASH_SRV_ID = catalogEntries[0]._id.toString();
				            process.env.DASH_NGINX_ID = catalogEntries[1]._id.toString();
				            return callback();
			            });
		            },
		            updateDashboard: function (callback) {
			            //update Dashboard Environment
			            mongo.update("environment", condition, fields, options, (error) => {
				            if(error){
					            return callback(error);
				            }
				            utilLog.log("Dashboard Environment updated.");
				            return callback();
			            });
		            }
	            }, cb);
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
		var namespace;

		async.series([
			function(callback) { initNamespace(callback); },
			function(callback) { createServiceAccount(callback); },
			function(callback) { createService(callback); },
			function(callback) { createDeployment(callback); },
			function(callback) { createClusterRoleBinding(callback); },
			function(callback) { createRoleBinding(callback); },
			function(callback) { createApiService(callback); }
		], cb);

		function initNamespace(cb) {
			if(options.customNamespace) return cb(null, true);

			var serviceName;
			namespace = config.kubernetes.config.namespaces.default;
	        if (config.kubernetes.config.namespaces.perService) {
	            serviceName = options.deployment.metadata.labels['soajs.service.label'];
	            namespace += '-' + serviceName;
	        }

	        return lib.initNamespace(deployer, {namespace: namespace}, cb);
		}

		function createService(cb) {
			if(!options.service || Object.keys(options.service).length === 0) return cb(null, true);

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

			if(!namespace) namespace = 'default';

			if(options.customNamespace && options.service.metadata && options.service.metadata.namespace) {
				namespace = options.service.metadata.namespace;
			}

			return deployer.core.namespaces(namespace).services.post({ body: options.service }, cb);
		}

		function createServiceAccount(cb) {
			if(!options.serviceAccount || Object.keys(options.serviceAccount).length === 0) return cb(null, true);

			if(!namespace) namespace = 'default';

			if(options.customNamespace && options.serviceAccount.metadata && options.serviceAccount.metadata.namespace) {
				namespace = options.serviceAccount.metadata.namespace;
			}

			return deployer.core.namespaces(namespace).serviceaccounts.post({ body: options.serviceAccount }, cb);
		}

        function createDeployment(cb) {
			if(!options.deployment || Object.keys(options.deployment).length === 0) return cb(null, true);

	        //support daemonsets
	        var deploytype;
	        if (options.deployment.kind === "DaemonSet") {
		        deploytype = "daemonsets";
	        }
	        else if (options.deployment.kind === "Deployment") {
		        deploytype = "deployments";
	        }

			if(!namespace) namespace = 'default';

			if(options.customNamespace && options.deployment.metadata && options.deployment.metadata.namespace) {
				namespace = options.deployment.metadata.namespace;
			}

            return deployer.extensions.namespaces(namespace)[deploytype].post({ body: options.deployment }, cb);
        }
	
	    function createClusterRoleBinding(cb) {
		    if(!options.clusterRoleBinding || Object.keys(options.clusterRoleBinding).length === 0) return cb(null, true);
		    return deployer.rbac.clusterrolebinding.post({ body: options.clusterRoleBinding }, cb);
	    }
	
	    function createRoleBinding(cb) {
		    if(!options.roleBinding || Object.keys(options.roleBinding).length === 0) return cb(null, true);
		
		    if(!namespace) namespace = 'default';
		
		    if(options.customNamespace && options.roleBinding.metadata && options.roleBinding.metadata.namespace) {
			    namespace = options.roleBinding.metadata.namespace;
		    }
		
		    return deployer.rbac.namespaces(namespace).rolebinding.post({ body: options.roleBinding }, cb);
	    }
	    
	    function createApiService(cb) {
		    if(!options.apiService || Object.keys(options.apiService).length === 0) return cb(null, true);
		    return deployer.apiregistration.apiservice.post({ body: options.apiService }, cb);
	    }
    },

	checkIfDeployed: function (deployer, options, cb) {

		async.series({
			// deployment: function (callback) { getResource('deployment', 'extensions', callback); },
			service: function (callback) { getResource('service', 'core', callback); },
			// serviceAccount: function (callback) { getResource('serviceAccount', 'core', callback); }
		}, function(error, result) {
			if(error) return cb(error);

			/*
				result.* =
					object: required and deployed, delete it from main object
					false: required and not deployed, keep it in main object, do nothing
					null: not required, do nothing
			 */
			 //NOTE: if a resource is deployed, delete it and return the object, this way it will not be deployed
			 //NOTE: Only plugin for now is heapster, we check the service only
			 if(result.service && Object.keys(result.service).length > 0) {
				 options = {};
			 }

			//  if(result.deployment) delete options.deployment;
			//  if(result.service) delete options.service;
			//  if(result.serviceAccount) delete options.serviceAccount;

			 return cb(null, options);
		});

		function getResource(type, apiGroup, cb) {
			var info = getResourceInfo(options, type);

			if(!info.name) return cb(); //this means that the plugin does not have a resource, ignore

			type = type.toLowerCase();
			deployer[apiGroup].namespaces(info.namespace)[type].get({ name: info.name }, function(error, resource) {
				if(error) {
					if(error.code === 404) return cb(null, false);

					return cb(error);
				}

				return cb(null, resource);
			});
		}

		function getResourceInfo(options, resource) {
			var serviceName, namespace = 'default';

			if(options[resource] && options[resource].metadata) {
				if(options[resource].metadata.name) {
					serviceName = options[resource].metadata.name;
				}
				if(options[resource].metadata.namespace) {
					namespace = options[resource].metadata.namespace;
				}
			}

			return { name: serviceName, namespace: namespace };
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
                        deployer.extensions.namespaces(oneDeployment.metadata.namespace).deployments.delete({ name: oneDeployment.metadata.name, qs: params }, function (error) {
							if(error) return callback(error);

							//hpa objects have the same naming as their deployments
							deployer.autoscaling.namespaces(oneDeployment.metadata.namespace).hpa.delete({ name: oneDeployment.metadata.name }, function (error) {
								if(error) {
									if(error.code === 404) return callback();
									else return callback(error);
								}

								return callback();
							});
						});
                    }, 5000);
                });
            }, cb);
        });
    },

	deleteDaemonsets: function(deployer, options, cb) {
		var filter = { labelSelector: 'soajs.content=true' };
		deployer.extensions.daemonsets.get({qs: filter}, function(error, daemonsetList) {
			if(error) return cb(error);

			if (!daemonsetList || !daemonsetList.items || daemonsetList.items.length === 0) return cb();
			async.each(daemonsetList.items, function(oneDaemonset, callback) {
				deployer.extensions.namespaces(oneDaemonset.metadata.namespace).daemonsets.delete({ name: oneDaemonset.metadata.name }, callback);
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

			lib.deleteDaemonsets(deployer, {}, function(error) {
				if(error) return cb(error);

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