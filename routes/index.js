"use strict";
var os = require("os");
var path = require("path");

var utils = require("./utils");

//configuration file
var dataDir = __dirname + "/../data/";

var routes = {
	"getOverview": function(req, res){
		
		var data = {
			"manual": "",
			"docker": "",
			"kubernetes": ""
		};
		
		if(process.platform === 'linux'){
			data.manual = {
				"v": path.resolve(__dirname + "/../scripts/pre/manual-linux.sh"),
				"t": "sh"
			};
			data.docker = {
				"v": path.resolve(__dirname + "/../scripts/pre/docker-linux.sh"),
				"t": "sh"
			};
			data.kubernetes = {
				"v": path.resolve(__dirname + "/../scripts/pre/kubernetes-linux.sh"),
				"l": "sh"
			};
		}
		else if(process.platform === 'darwin'){
			data.manual = {
				"v": path.resolve(__dirname + "/../scripts/pre/manual-mac.sh"),
				"t": "sh"
			};
			data.docker = {
				"v": "https://download.docker.com/mac/beta/Docker.dmg",
				"t": "link"
			};
			data.kubernetes = {
				"v": path.resolve(__dirname + "/../scripts/pre/kubernetes-mac.sh"),
				"l": "sh"
			};
		}
		
		utils.loadCustomData('deployment', function (customData) {
			if(customData){
				data.deployer = {
					deployType: customData.deployType,
					deployDriver: customData.deployDriver
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
						return res.json(req.soajs.buildResponse(null, {
							"extKey": req.soajs.inputmaskData.security.extKey1
						}));
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
		utils.updateCustomData(req, res, req.soajs.inputmaskData.clusters, "clusters");
	},
	
	"getDeployment": function (req, res) {
		utils.loadCustomData('deployment', function (customData) {
			return res.json(req.soajs.buildResponse(null, customData || null));
		});
	},
	"postDeployment": function (req, res) {
		utils.updateCustomData(req, res, req.soajs.inputmaskData.deployment, "deployment", function(){
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
				
				//fill the files with the user values
				utils.fillFiles(folder, body);
				
				//import data to mongo
				utils.importMongo(folder, body, function (error) {
					if (error) {
						return res.json(req.soajs.buildResponse({"code": 400, "msg": error.message}));
					}
					
					//launch deployer script
					switch(body.deployment.deployDriver){
						case 'manual':
							utils.deployManual(body, function (error, data) {
								if (error) {
									return res.json(req.soajs.buildResponse({"code": 500, "msg": error.message}));
								}
								return res.json(req.soajs.buildResponse(null, data));
							});
							break;
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
	}
};

module.exports = routes;