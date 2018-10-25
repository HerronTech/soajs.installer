"use strict";
var path = require("path");

var utils = require("./utils");
let config = require("../config");

//configuration file
var dataDir = __dirname + "/../data/";

var routes = {
    "getOverview": function(req, res){
        var osName;
        var data = {
            "docker": "",
            "kubernetes": ""
        };
        var platform = process.platform;
        if(platform === 'linux'){
            osName = 'linux';
            data.docker = {
                local: {
                    "v": "sudo " + path.resolve(__dirname + "/../scripts/pre/docker-linux.sh"),
                    "t": "sh"
                },
                remote:{
                    "v": "sudo " + path.resolve(__dirname + "/../scripts/pre/docker-linux.sh <%Your_Domain%>"),
                    "t": "sh"
                }
            };

            data.kubernetes = {
                local: {
                    "v": "sudo " + path.resolve(__dirname + "/../scripts/pre/kubernetes-linux.sh"),
                    "l": "sh"
                },
                remote: {
                    "v": "sudo " + path.resolve(__dirname + "/../scripts/pre/kubernetes-linux.sh"),
                    "l": "sh"
                }
            };
        }
        else if(platform === 'darwin'){
            osName = 'mac';
            data.docker = {
                local: [
	                {
		                "v": "https://download.docker.com/mac/stable/Docker.dmg",
		                "t": "link"
	                },
	                {
		                "v": "sudo " + path.resolve(__dirname + "/../scripts/pre/docker-api.sh"),
		                "t": "sh"
	                }
                ],
                remote:{
                    "v": "sudo " + path.resolve(__dirname + "/../scripts/pre/docker-linux.sh"),
                    "t": "sh"
                }
            };

            data.kubernetes = {
                local: {
                    "v": "sudo " + path.resolve(__dirname + "/../scripts/pre/kubernetes-mac.sh"),
                    "l": "sh"
                },
                remote: {
                    "v": "sudo " + path.resolve(__dirname + "/../scripts/pre/kubernetes-linux.sh"),
                    "l": "sh"
                }
            };
        }

        utils.loadCustomData('deployment', function (customData) {
            if(customData){
                data.deployer = {
                    deployType: customData.deployType,
                    deployDriver: customData.deployDriver,
                    os : osName
                };
	            data.remoteProvider= customData.remoteProvider;
            }
            else {
                data.deployer = {
                    os : osName
                };
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

            //generate extKey for Main
            var opts = {
                "tenantId": defaultTenant._id,
                "secret": req.soajs.inputmaskData.security.key,
                "package": defaultTenant.applications[0].package,
                "key": defaultTenant.applications[0].key
            };
            utils.generateExtKeys(opts, function (error) {
                if (error) {
                    return res.json(req.soajs.buildResponse({"code": 400, "msg": error.message}));
                }

                req.soajs.inputmaskData.security.extKey1 = opts.extKey;

                //generate extKey for Owner
                var opts2 = {
                    "tenantId": defaultTenant._id,
                    "secret": req.soajs.inputmaskData.security.key,
                    "package": defaultTenant.applications[1].package,
                    "key": defaultTenant.applications[1].key
                };
                utils.generateExtKeys(opts2, function (error) {
                    if (error) {
                        return res.json(req.soajs.buildResponse({"code": 400, "msg": error.message}));
                    }

                    req.soajs.inputmaskData.security.extKey2 = opts2.extKey;

                    utils.updateCustomData(req, res, req.soajs.inputmaskData.security, "security", function () {
	                    
	                    //generate extKey for Techop
	                    var opts3 = {
		                    "tenantId": defaultTenant._id,
		                    "secret": req.soajs.inputmaskData.security.key,
		                    "package": defaultTenant.applications[2].package,
		                    "key": defaultTenant.applications[2].key
	                    };
	                    utils.generateExtKeys(opts3, function (error) {
		                    if (error) {
			                    return res.json(req.soajs.buildResponse({"code": 400, "msg": error.message}));
		                    }
		
		                    req.soajs.inputmaskData.security.extKey3 = opts3.extKey;
		
		                    utils.updateCustomData(req, res, req.soajs.inputmaskData.security, "security", function () {
			                    return res.json(req.soajs.buildResponse(null, {
				                    "extKey": req.soajs.inputmaskData.security.extKey1
			                    }));
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
