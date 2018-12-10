"use strict";
var path = require("path");

var utils = require("./utils");
let config = require("../config");

//configuration file
var dataDir = __dirname + "/../data/";

var routes = {
    "getOverview": function(req, res){
        var data = {};
      
        utils.loadCustomData('deployment', function (customData) {
            if(customData){
                data.deployer = {
                    deployType: customData.deployType,
                    deployDriver: customData.deployDriver
                };
            }
            else {
                data.deployer = {};
            }
            return res.json(req.soajs.buildResponse(null, data));
        });
    },
    "postOverview": function(req, res){
        utils.updateCustomData(req, res, req.soajs.inputmaskData.overview, "deployment");
    },

    "getGi": function (req, res) {
        utils.loadCustomData(null, function (customData) {
            var data = null;
            if(customData && customData.gi){
                data = customData.gi;
                data.disableWrkDir = (customData.deployment && customData.deployment.deployType !== 'manual');
            }
            return res.json(req.soajs.buildResponse(null, data));
        });
    },
    "postGi": function (req, res) {
        utils.updateCustomData(req, res, req.soajs.inputmaskData.gi, "gi");
    },

    "getSecurity": function (req, res) {
        utils.loadCustomData('security', function (customData) {
            if(customData){
                delete customData.extKey1;
                delete customData.extKey2;
                delete customData.extKey3;
            }

            return res.json(req.soajs.buildResponse(null, customData || null));
        });
    },
    "postSecurity": function (req, res) {
        if (req.soajs.inputmaskData && req.soajs.inputmaskData.security && req.soajs.inputmaskData.security.key) {
            //load tenant record
            delete require.cache[require.resolve(dataDir + "provision/tenants/info.js")];
            var defaultTenant = require(dataDir + "provision/tenants/info.js");
            
            //generate extKey for guest
            var guest = {
                "tenantId": defaultTenant.guest._id,
                "secret": req.soajs.inputmaskData.security.key,
                "package": defaultTenant.guest.applications.package,
                "key": defaultTenant.guest.applications.key
            };
            utils.generateExtKeys(guest, function (error) {
                if (error) {
                    return res.json(req.soajs.buildResponse({"code": 400, "msg": error.message}));
                }

                req.soajs.inputmaskData.security.guestExtKey = guest.extKey;
                
	            utils.updateCustomData(req, res, req.soajs.inputmaskData.security, "security", function () {
	            	
		            //generate extKey for Owner
		            var owner = {
			            "tenantId": defaultTenant.owner._id,
			            "secret": req.soajs.inputmaskData.security.key,
			            "package": defaultTenant.owner.applications.package,
			            "key": defaultTenant.owner.applications.key
		            };
		            utils.generateExtKeys(owner, function (error) {
			            if (error) {
				            return res.json(req.soajs.buildResponse({"code": 400, "msg": error.message}));
			            }
			
			            req.soajs.inputmaskData.security.ownerExtKey = owner.extKey;
			            
			            utils.updateCustomData(req, res, req.soajs.inputmaskData.security, "security", function () {
				            //generate extKey for developer
				            var developer = {
					            "tenantId": defaultTenant.developer._id,
					            "secret": req.soajs.inputmaskData.security.key,
					            "package": defaultTenant.developer.applications.package,
					            "key": defaultTenant.developer.applications.key
				            };
				            utils.generateExtKeys(developer, function (error) {
					            if (error) {
						            return res.json(req.soajs.buildResponse({"code": 400, "msg": error.message}));
					            }
					            req.soajs.inputmaskData.security.developerExtKey = developer.extKey;
					
					            utils.updateCustomData(req, res, req.soajs.inputmaskData.security, "security", function () {
						            //generate extKey for devOps
						            var devOps = {
							            "tenantId": defaultTenant.devOps._id,
							            "secret": req.soajs.inputmaskData.security.key,
							            "package": defaultTenant.devOps.applications.package,
							            "key": defaultTenant.devOps.applications.key
						            };
						
						            utils.generateExtKeys(devOps, function (error) {
							            if (error) {
								            return res.json(req.soajs.buildResponse({"code": 400, "msg": error.message}));
							            }
							            req.soajs.inputmaskData.security.devOpsExtKey = developer.extKey;
							            utils.updateCustomData(req, res, req.soajs.inputmaskData.security, "security", function () {
								            return res.json(req.soajs.buildResponse(null, {
									            "extKey": req.soajs.inputmaskData.security.guestExtKey
								            }));
							            });
						            });
					            });
					           
				            });
			            });
		            });
	            });
            });
        }
        else {
            utils.updateCustomData(req, res, req.soajs.inputmaskData.security, "security", function () {
                return res.json(req.soajs.buildResponse(null, true));
            });
        }
    },

    "getClusters": function (req, res) {
        utils.loadCustomData(null, function (customData) {
            return res.json(req.soajs.buildResponse(null, customData || null));
        });
    },
    "postClusters": function (req, res) {
        utils.verifyMongoIP(req,res, function(error){
            if(error){
                if(error === "noIP")
                    return res.json(req.soajs.buildResponse({code: 601, msg: "You have added a host with no hostname. Please provide a valid hostname."}));
                else
                    return res.json(req.soajs.buildResponse({code: 601, msg: "Invalid machine IP address: " + error + ". Provide the machine's external IP address."}));
            }
            utils.updateCustomData(req, res, req.soajs.inputmaskData.clusters, "clusters", function(){
	            utils.updateCustomData(req, res, req.soajs.inputmaskData.deployment, "deployment");
            });
        });
    },
    
	"getDeployment": function (req, res) {
        utils.loadCustomData('deployment', function (customData) {
	        utils.loadCustomData('clusters', function (customData2) {
	        	if(customData && customData2){
	                customData.mongoExt = customData2.mongoExt;
		        }
                return res.json(req.soajs.buildResponse(null, customData || null));
	        });
        });
    },
    "postDeployment": function (req, res) {
	
	    if (req.soajs.inputmaskData.deployment.deployDriver.indexOf("kubernetes") !== -1) {
		    if (!req.soajs.inputmaskData.deployment.nginxSsl || req.soajs.inputmaskData.deployment.nginxSsl && req.soajs.inputmaskData.deployment.generateSsc) {
			    req.soajs.inputmaskData.deployment.nginxKubeSecret = null;
		    }
		
		    if(!req.soajs.inputmaskData.deployment.namespaces || !req.soajs.inputmaskData.deployment.namespaces.default){
			    return res.json(req.soajs.buildResponse({code: 173, 'msg': 'Missing required field [namespaces]'}));
		    }
		
		    if(!req.soajs.inputmaskData.deployment.authentication || !req.soajs.inputmaskData.deployment.authentication.accessToken){
			    return res.json(req.soajs.buildResponse({code: 173, 'msg': 'Missing required field [kubernetes authentication token]'}));
		    }
	    }
	    else if(req.soajs.inputmaskData.deployment.deployDriver.indexOf("docker") !== -1){
		    
	    	if(!req.soajs.inputmaskData.deployment.authentication || !req.soajs.inputmaskData.deployment.authentication.accessToken){
			    return res.json(req.soajs.buildResponse({code: 173, 'msg': 'Missing required field [docker authentication token]'}));
		    }
		    
		    if(!req.soajs.inputmaskData.deployment.dockerSocket){
			    return res.json(req.soajs.buildResponse({code: 173, 'msg': 'Missing required field [Docker Socket Directory]'}));
		    }
	    }
	    else{
		    req.soajs.inputmaskData.deployment.nginxPort = 80;
		    req.soajs.inputmaskData.deployment.nginxSecurePort = 443;
	    }
	
	    if(req.soajs.inputmaskData.deployment.nginxDeployType === 'LoadBalancer'){
		    req.soajs.inputmaskData.deployment.nginxPort = 80;
		    req.soajs.inputmaskData.deployment.nginxSecurePort = 443;
	    }
	
	    if(req.soajs.inputmaskData.deployment.nginxPort < config.kubernetes.minPort || req.soajs.inputmaskData.deployment.nginxPort > config.kubernetes.maxPort){
		    return res.json(req.soajs.buildResponse({code: 173, 'msg': `HTTP Port should be within the range of: ${config.kubernetes.minPort} and ${config.kubernetes.maxPort}`}));
	    }
	
	    if(req.soajs.inputmaskData.deployment.nginxSecurePort < config.kubernetes.minPort || req.soajs.inputmaskData.deployment.nginxSecurePort > config.kubernetes.maxPort){
		    return res.json(req.soajs.buildResponse({code: 173, 'msg': `HTTP Secure Port should be within the range of: ${config.kubernetes.minPort} and ${config.kubernetes.maxPort}`}));
	    }
	
	    if(req.soajs.inputmaskData.deployment.nginxSecurePort === req.soajs.inputmaskData.deployment.nginxPort){
		   return res.json(req.soajs.buildResponse({code: 173, 'msg': `HTTP Port and HTTP Secure Port cannot be the same!`}));
	    }
	    
        var deployment = JSON.parse(JSON.stringify(req.soajs.inputmaskData.deployment));
        if(deployment.deployDriver.indexOf("docker") !== -1){
            deployment.docker = {
                "networkName": deployment.networkName,
                "dockerSocket": deployment.dockerSocket,
                "containerPort": deployment.containerPort,
                "dockerInternalPort": deployment.dockerInternalPort,
                "containerDir": deployment.containerDir
            };

            delete deployment.networkName;
            delete deployment.dockerSocket;
            delete deployment.containerPort;
            delete deployment.dockerInternalPort;
            delete deployment.containerDir;
        }
        else if (deployment.deployDriver.indexOf("kubernetes") !== -1){
            deployment.kubernetes = {
                "containerPort": deployment.kubeContainerPort,
                "containerDir": deployment.containerDir
            };
            delete deployment.containerPort;
            delete deployment.containerDir;
            delete deployment.dockerSocket;
            delete deployment.networkName;
            delete deployment.dockerInternalPort;
            delete deployment.kubeContainerPort;
        }
        utils.updateCustomData(req, res, deployment, "deployment", function(){
            utils.loadCustomData(null, function(data){
                if(data.security){
                    delete data.security.extKey1;
                    delete data.security.extKey2;
                }
                if(data.gi){
                    data.gi.password = "******";
                }
                return res.json(req.soajs.buildResponse(null, data));
            });
        });
    },
	
	"reconfirmDeployment": function(req, res){
		utils.loadCustomData(null, function(data){
			if(data.security){
				delete data.security.extKey1;
				delete data.security.extKey2;
			}
			if(data.gi){
				data.gi.password = "******";
			}
			return res.json(req.soajs.buildResponse(null, data));
		});
	},

    "installSOAJS": function (req, res) {
        var folder = dataDir + "startup/";

        //regenerate folders from template
        utils.reCreateFolder(function (error) {
            if (error) {
                return res.json(req.soajs.buildResponse({"code": 400, "msg": error.message}));
            }

            delete require.cache[require.resolve(dataDir + "default.js")];
            var defaultData = require(dataDir + "default.js");

            //load custom filled data from user
            utils.loadCustomData(null, function (body) {

                body = utils.unifyData(defaultData, body);

                utils.updateCustomData(req, res, body.gi, "gi", function(){
	                
	                //fill the files with the user values
	                utils.fillFiles(folder, body);

	                //launch deployer script
	                switch(body.deployment.deployDriver){
		                case 'container.docker.local':
			                utils.deployContainer(body, 'docker', 'local', function (error, data) {
				                if (error) {
					                return res.json(req.soajs.buildResponse({"code": 500, "msg": error.message}));
				                }
				                return res.json(req.soajs.buildResponse(null, data));
			                });
			                break;

		                case 'container.docker.remote':
			                utils.deployContainer(body, 'docker', 'remote', function (error, data) {
				                if (error) {
					                return res.json(req.soajs.buildResponse({"code": 500, "msg": error.message}));
				                }
				                return res.json(req.soajs.buildResponse(null, data));
			                });
			                break;

		                case 'container.kubernetes.local':
			                utils.deployContainer(body, 'kubernetes', 'local', function (error, data) {
				                if (error) {
					                return res.json(req.soajs.buildResponse({"code": 500, "msg": error.message}));
				                }
				                return res.json(req.soajs.buildResponse(null, data));
			                });
			                break;

		                case 'container.kubernetes.remote':
			                utils.deployContainer(body, 'kubernetes', 'remote', function (error, data) {
				                if (error) {
					                return res.json(req.soajs.buildResponse({"code": 500, "msg": error.message}));
				                }
				                return res.json(req.soajs.buildResponse(null, data));
			                });
			                break;
	                }
                });
            });
        });
    },

    "progressInfo": function(req, res){
        utils.loadCustomData(null, function(customData){
            var type;
            switch(customData.deployment.deployDriver){
                case 'container.docker.local':
                case 'container.docker.remote':
                    type = 'swarm';
                    break;

                case 'container.kubernetes.local':
                case 'container.kubernetes.remote':
                    type = 'kubernetes';
                    break;
            }

            utils.regenerateInfo(type, customData, function(error, response){
                if(error){
                    return res.json(req.soajs.buildResponse({"code": 500, "msg": error.message }));
                }
                return res.json(req.soajs.buildResponse(null, response));
            });
        });
    },

    "progress": function(req, res){
        utils.loadCustomData(null, function (customData) {

            utils.returnInstallProgress(customData, function(error, response){
                if(error){
                    return res.json(req.soajs.buildResponse({"code": 500, "msg": error.message }));
                }
                return res.json(req.soajs.buildResponse(null, response));
            });
        });

    },
	
	"versions": function(req, res){
		utils.versions(config, req, function(error, response){
			if(error){
				return res.json(req.soajs.buildResponse({"code": 500, "msg": error.message }));
			}
			return res.json(req.soajs.buildResponse(null, response));
		})
	}
};

module.exports = routes;
