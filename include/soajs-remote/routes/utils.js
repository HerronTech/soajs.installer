"use strict";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var os = require("os");
var fs = require("fs");
var path = require("path");
var soajs = require("soajs");
var request = require("request");
var randomString = require("randomstring");
var whereis = require('whereis');

//external libs
var ncp = require("ncp");
var rimraf = require("rimraf");
var async = require("async");

var dataDir = __dirname + "/../data/";
var lib = {
	"updateCustomData": function (req, res, body, section, cb) {
		fs.exists(dataDir + "custom.js", function (exists) {
			if (exists) {
				delete require.cache[require.resolve(dataDir + "custom.js")];
				var custom = require(dataDir + "custom.js");
				custom[section] = {};
				for (var i in body) {
					if (body[i] && body[i] !== "") {
						custom[section][i] = body[i];
					}
				}
				writeFileAndExit(custom);
			}
			else {
				var custom = {};
				custom[section] = JSON.parse(JSON.stringify(body));
				writeFileAndExit(custom);
			}
		});
		
		function writeFileAndExit(custom) {
			custom = "\"use strict\";" + os.EOL + "module.exports = " + JSON.stringify(custom, null, 2) + ";";
			fs.writeFile(dataDir + "custom.js", custom, "utf8", function (error) {
				if (error) {
					return res.json(req.soajs.buildResponse(res, {code: 174, msg: error.message}));
				}
				if (cb && typeof(cb) === 'function') {
					return cb();
				}
				return res.json(req.soajs.buildResponse(null, true));
			});
		}
	},
	
	"loadCustomData": function (section, cb) {
		fs.exists(dataDir + "custom.js", function (exists) {
			if (!exists) {
				return cb(null);
			}
			else {
				try {
					delete require.cache[require.resolve(dataDir + "custom.js")];
					var customData = require(dataDir + "custom.js");
					if (section) {
						return cb(customData[section]);
					}
					else {
						return cb(customData);
					}
				}
				catch (e) {
					console.log(e);
					return cb(null);
				}
			}
		});
	},
	
	"generateExtKeys": function (opts, cb) {
		//soajs encryption engine
		var module = require("soajs").core.key;
		var key = opts.key;
		
		var tenant = {
			id: opts.tenantId
		};
		var application = {
			"package": opts.package
		};
		var config = {
			algorithm: "aes256",
			password: opts.secret
		};
		
		module.generateExternalKey(key, tenant, application, config, function (error, extKey) {
			if (error) {
				return cb(error);
			}
			
			module.getInfo(extKey, config, function (error, response) {
				if (error) {
					return cb(error);
				}
				if (response.key === key) {
					opts.extKey = extKey;
					return cb(null, true);
				}
				else {
					return cb(new Error("Generated Key is invalid."))
				}
			});
		});
	},
	
	"reCreateFolder": function (cb) {
		var source = dataDir + "provision/";
		var destination = dataDir + "startup/";
		
		fs.exists(destination, function (exists) {
			if (exists) {
				rimraf(destination, function (error) {
					if (error) {
						return cb(error);
					}
					ncp(source, destination, cb);
				});
			}
			else {
				ncp(source, destination, cb);
			}
		});
	},
	
	"fillFiles": function (folder, body) {
		var clusters = JSON.parse(JSON.stringify(body.clusters));
		var deployment = JSON.parse(JSON.stringify(body.deployment));
		delete clusters.prefix;
		
		//fix clusters credentials
		if (clusters.credentials.username === "") {
			clusters.credentials = {};
			delete clusters.URLParam.authSource;
		}
		
		if (clusters.servers[0].host.indexOf("https") !== -1) {
			clusters.URLParam.ssl = true;
			body.clusters.URLParam.ssl = true;
		}
		
		if (clusters.replicaSet) {
			clusters.URLParam.replicaSet = clusters.replicaSet;
			clusters.URLParam.readPreference = "secondaryPreferred";
			clusters.URLParam.w = "majority";
			clusters.URLParam.ha = true;
			
			if (!clusters.extraParam.replSet) {
				clusters.extraParam.replSet = {};
			}
			clusters.extraParam.replSet.ha = true;
		}
		
		//generate profile
		var profileData = '"use strict";' + os.EOL;
		clusters.name = "core_provision";
		clusters.prefix = body.clusters.prefix || "";
		var mongoExt = clusters.mongoExt;
		if (!mongoExt) {
			if (body.deployment.deployDriver.indexOf("container.docker") !== -1) {
				clusters.servers = [
					{
						host: "dashboard-soajsdata",
						port: 27017
					}
				];
			}
			if (body.deployment.deployDriver.indexOf("container.kubernetes") !== -1) {
				//build mongo service with based on namespace
				var namespace = (deployment && deployment.namespaces && deployment.namespaces.default) ? deployment.namespaces.default : 'default';
				if (deployment && deployment.namespaces && deployment.namespaces.perService) {
					namespace += '-dashboard-soajsdata';
				}
				clusters.servers = [
					{
						host: "dashboard-soajsdata." + namespace,
						port: 5000 + 27017
					}
				];
			}
		}
		delete clusters.replicaSet;
		delete clusters.mongoExt;
		profileData += 'module.exports = ' + JSON.stringify(clusters, null, 2) + ';';
		fs.writeFileSync(folder + "profile.js", profileData, "utf8");
		
		if (body.deployment.deployDriver.includes("docker.local")) {
			body.deployment.deployDriver = "container.docker.remote";
		}
		if (body.deployment.deployDriver.indexOf("kubernetes") !== -1 && !mongoExt) {
			clusters.servers[0].port = 27017;
		}
		
		delete clusters.name;
		delete clusters.prefix;
		
		//modify users file
		var userData = fs.readFileSync(folder + "urac/users/owner.js", "utf8");
		userData = userData.replace(/%username%/g, body.gi.username);
		userData = userData.replace(/%email%/g, body.gi.email);
		
		var Hasher = soajs.hasher;
		Hasher.init({
			"hashIterations": 1024,
			"seedLength": 32
		});
		var hashedPwd = Hasher.hash(body.gi.password);
		userData = userData.replace(/%password%/g, hashedPwd);
		fs.writeFileSync(folder + "urac/users/owner.js", userData, "utf8");
		
		if (body.deployment.deployType === 'container') {
			body.gi.wrkDir = "/opt";
		}
		
		//modify environments file
		var envData = fs.readFileSync(folder + "environments/dashboard.js", "utf8");
		
		envData = envData.replace(/%domain%/g, body.gi.domain);
		envData = envData.replace(/%site%/g, body.gi.site);
		envData = envData.replace(/%api%/g, body.gi.api);
		envData = envData.replace(/%wrkDir%/g, "/opt");
		
		envData = envData.replace(/%deployType%/g, body.deployment.deployType);
		envData = envData.replace(/%deployDriver%/g, body.deployment.deployDriver);
		envData = envData.replace(/%deployDockerNodes%/g, body.deployment.containerHost);
		envData = envData.replace(/%containerNode%/g, body.deployment.containerHost);
		envData = envData.replace(/%clusterPrefix%/g, body.clusters.prefix);
		
		var mongoCluster = fs.readFileSync(folder + "resources/mongo.js", "utf8");
		mongoCluster = mongoCluster.replace(/"%clusters%"/g, JSON.stringify(clusters, null, 2));
		fs.writeFileSync(folder + "resources/mongo.js", mongoCluster, "utf8");
		
		envData = envData.replace(/%keySecret%/g, body.security.key);
		envData = envData.replace(/%sessionSecret%/g, body.security.session);
		envData = envData.replace(/%cookieSecret%/g, body.security.cookie);
		
		if (body.deployment.deployDriver.split('.')[1] === 'kubernetes') {
			envData = envData.replace(/"%namespace%"/g, JSON.stringify(body.deployment.namespaces, null, 2));
			envData = envData.replace(/%kubetoken%/g, body.deployment.authentication.accessToken);
			
			if (body.deployment.deployDriver.split('.')[2] === 'local') {
				envData = envData.replace(/"apiPort": "%dockerRemotePort%",/g, '');
				envData = envData.replace(/"%kubernetesRemotePort%"/g, body.deployment.kubernetes.containerPort);
			}
			else {
				envData = envData.replace(/"apiPort": "%dockerRemotePort%",/g, '');
				envData = envData.replace(/"%kubernetesRemotePort%"/g, body.deployment.kubernetes.containerPort);
			}
		}
		else if (body.deployment.deployDriver.split('.')[1] === 'docker') {
			envData = envData.replace(/"%namespace%"/g, JSON.stringify({}, null, 2));
			envData = envData.replace(/%dockertoken%/g, body.deployment.authentication.accessToken);
			
			if (body.deployment.deployDriver.split('.')[2] === 'local') {
				envData = envData.replace(/"%dockerRemotePort%"/g, body.deployment.docker.containerPort);
				envData = envData.replace(/"apiPort": "%kubernetesRemotePort%",/g, '');
			}
			else {
				envData = envData.replace(/"apiPort": "%dockerLocalPort%",/g, '');
				envData = envData.replace(/"%dockerRemotePort%"/g, body.deployment.docker.containerPort);
				envData = envData.replace(/"apiPort": "%kubernetesRemotePort%",/g, '');
			}
		}
		fs.writeFileSync(folder + "environments/dashboard.js", envData, "utf8");
		
		//modify tenants file
		let protocol = "http";
		let port = body.deployment.nginxPort;
		
		if (body.deployment.nginxSsl) {
			protocol = "https";
			port = body.deployment.nginxSecurePort;
		}
		
		var tntData = fs.readFileSync(folder + "tenants/owner.js", "utf8");
		tntData = tntData.replace(/%protocol%/g, protocol);
		tntData = tntData.replace(/%port%/g, port);
		tntData = tntData.replace(/%email%/g, body.gi.email);
		tntData = tntData.replace(/%site%/g, body.gi.site);
		tntData = tntData.replace(/%domain%/g, body.gi.domain);
		tntData = tntData.replace(/%wrkDir%/g, body.gi.wrkDir);
		tntData = tntData.replace(/%ownerExtKey%/g, body.security.ownerExtKey);
		fs.writeFileSync(folder + "tenants/owner.js", tntData, "utf8");
		
		var tntData = fs.readFileSync(folder + "tenants/devOps.js", "utf8");
		tntData = tntData.replace(/%protocol%/g, protocol);
		tntData = tntData.replace(/%port%/g, port);
		tntData = tntData.replace(/%email%/g, body.gi.email);
		tntData = tntData.replace(/%site%/g, body.gi.site);
		tntData = tntData.replace(/%domain%/g, body.gi.domain);
		tntData = tntData.replace(/%wrkDir%/g, body.gi.wrkDir);
		tntData = tntData.replace(/%devOpsExtKey%/g, body.security.devOpsExtKey);
		fs.writeFileSync(folder + "tenants/devOps.js", tntData, "utf8");
		
		var tntData = fs.readFileSync(folder + "tenants/guest.js", "utf8");
		tntData = tntData.replace(/%protocol%/g, protocol);
		tntData = tntData.replace(/%port%/g, port);
		tntData = tntData.replace(/%email%/g, body.gi.email);
		tntData = tntData.replace(/%site%/g, body.gi.site);
		tntData = tntData.replace(/%domain%/g, body.gi.domain);
		tntData = tntData.replace(/%wrkDir%/g, body.gi.wrkDir);
		tntData = tntData.replace(/%guestExtKey%/g, body.security.guestExtKey);
		fs.writeFileSync(folder + "tenants/guest.js", tntData, "utf8");
		
		var tntData = fs.readFileSync(folder + "tenants/developer.js", "utf8");
		tntData = tntData.replace(/%protocol%/g, protocol);
		tntData = tntData.replace(/%port%/g, port);
		tntData = tntData.replace(/%email%/g, body.gi.email);
		tntData = tntData.replace(/%site%/g, body.gi.site);
		tntData = tntData.replace(/%domain%/g, body.gi.domain);
		tntData = tntData.replace(/%wrkDir%/g, body.gi.wrkDir);
		tntData = tntData.replace(/%developerExtKey%/g, body.security.developerExtKey);
		fs.writeFileSync(folder + "tenants/developer.js", tntData, "utf8");
		
		
		//remove unneeded file
		fs.unlinkSync(folder + "tenants/info.js");
		
		//infra
		
		var infraData = fs.readFileSync(folder + "infra/infra.js", "utf8");
		infraData = infraData.replace(/%ipaddress%/g, body.deployment.containerHost);
		infraData = infraData.replace(/%token%/g, body.deployment.authentication.accessToken);
		var name;
		if (body.deployment.remoteProvider) {
			name = body.deployment.remoteProvider.name;
		}
		else {
			name = "local";
		}
		name = "ht" + name + randomString.generate({
			length: 13,
			charset: 'alphanumeric',
			capitalization: 'lowercase'
		});
		infraData = infraData.replace(/%name%/g, name);
		
		if (body.deployment.deployDriver.split('.')[1] === 'docker') {
			infraData = infraData.replace(/"%port%"/g, body.deployment.authentication.apiPort);
			infraData = infraData.replace(/%protocol%/g, body.deployment.authentication.protocol);
			infraData = infraData.replace(/%network%/g, body.deployment.docker.networkName);
			infraData = infraData.replace(/%technology%/g, 'docker');
			if (body.deployment.deployDriver.split('.')[2] === 'local') {
				infraData = infraData.replace(/%label%/g, 'Docker Local');
			}
			else {
				if (body.deployment.remoteProvider) {
					infraData = infraData.replace(/%label%/g, `Docker ${body.deployment.remoteProvider.name}`);
				}
				else {
					infraData = infraData.replace(/%label%/g, 'Docker Remote');
				}
				
			}
		}
		else if (body.deployment.deployDriver.split('.')[1] === 'kubernetes') {
			infraData = infraData.replace(/"%port%"/g, body.deployment.kubernetes.containerPort);
			infraData = infraData.replace(/%network%/g, body.deployment.namespaces.default);
			infraData = infraData.replace(/%protocol%/g, 'https');
			infraData = infraData.replace(/%technology%/g, 'kubernetes');
			if (body.deployment.deployDriver.split('.')[2] === 'local') {
				infraData = infraData.replace(/%label%/g, 'Kubernetes Local');
			}
			else {
				if (body.deployment.remoteProvider) {
					infraData = infraData.replace(/%label%/g, `Kubernetes ${body.deployment.remoteProvider.name}`);
				}
				else {
					infraData = infraData.replace(/%label%/g, 'Kubernetes Remote');
				}
			}
		}
		fs.writeFileSync(folder + "infra/infra.js", infraData, "utf8");
	},
	
	"unifyData": function (def, over) {
		if (over.gi) {
			for (var i in def.gi) {
				if (over.gi[i] && over.gi[i] !== "") {
					def.gi[i] = over.gi[i];
				}
			}
		}
		
		if (over.security) {
			for (var i in def.security) {
				if (over.security[i] && over.security[i] !== "") {
					def.security[i] = over.security[i];
				}
			}
		}
		
		if (over.deployment) {
			for (var i in def.deployment) {
				if (over.deployment[i]) {
					def.deployment[i] = over.deployment[i];
				}
			}
			
			for (var j in over.deployment) {
				def.deployment[j] = over.deployment[j];
			}
		}
		
		if (over.clusters) {
			for (var j in over.clusters) {
				def.clusters[j] = over.clusters[j];
			}
		}
		return def;
	},
	
	"verifyMongoIP": function (req, res, cb) {
		var tempData = req.soajs.inputmaskData.clusters;
		if (tempData.mongoExt) {
			for (var i = 0; i < tempData.servers.length; i++) {
				if (!tempData.servers[i].host)
					return cb("noIP");
				
				if (req.soajs.inputmaskData.deployment.deployType === 'container' && ["localhost", "127.0.0.1"].indexOf(tempData.servers[i].host) !== -1)
					return cb(tempData.servers[i].host)
			}
		}
		else {
			req.soajs.inputmaskData.clusters.servers = [{"host": "127.0.0.1", "port": 27017}];
			delete req.soajs.inputmaskData.clusters.isReplica;
			delete req.soajs.inputmaskData.clusters.replicaSet;
			req.soajs.inputmaskData.clusters.credentials = null;
		}
		return cb(null, true);
	},
	
	"deployContainer": function (body, driver, loc, cb) {
		whereis('node', function (err, nodePath) {
			if (err) {
				return cb(err);
			}
			
			if (driver === 'docker') {
				var filename = path.normalize(__dirname + "/../scripts/swarm-deploy.sh");
				var output = "#!/bin/bash" + os.EOL + os.EOL;
				
				var envs = {
					"SOAJS_DEPLOY_HA": driver,
					"SOAJS_GIT_DASHBOARD_BRANCH": process.env.SOAJS_GIT_DASHBOARD_BRANCH || "master",
					"SOAJS_GIT_BRANCH": process.env.SOAJS_GIT_BRANCH || "master",
					"SOAJS_PROFILE": path.normalize(dataDir + "startup/profile.js"),
					"NODE_PATH": nodePath,
					
					"SOAJS_EXTKEY": body.security.guestExtKey,
					"API_PREFIX": body.gi.api,
					"SITE_PREFIX": body.gi.site,
					"MASTER_DOMAIN": body.gi.domain,
					
					"MONGO_EXT": body.clusters.mongoExt,
					
					"SOAJS_DATA_FOLDER": path.normalize(dataDir + "startup/"),
					
					"SOAJS_IMAGE_PREFIX": body.deployment.soajsImagePrefix,
					"SOAJS_IMAGE_TAG": body.deployment.soajsImageTag,
					
					"SOAJS_NX_IMAGE_PREFIX": body.deployment.nginxImagePrefix,
					"SOAJS_NX_IMAGE_TAG": body.deployment.nginxImageTag,
					
					"NGINX_HTTP_PORT": 30000 + body.deployment.nginxPort,
					"NGINX_HTTPS_PORT": 30000 + body.deployment.nginxSecurePort,
					"SOAJS_NX_SSL": body.deployment.nginxSsl,
					
					
					"SWARM_INTERNAL_PORT": body.deployment.docker.dockerInternalPort,
					"SOAJS_DOCKER_SOCKET": body.deployment.docker.dockerSocket,
					"DOCKER_NETWORK": body.deployment.docker.networkName,
					"CONTAINER_HOST": body.deployment.containerHost,
					"CONTAINER_PORT": body.deployment.docker.containerPort,
					"SOAJS_DOCKER_REPLICA": body.deployment.dockerReplica
				};
				
				if (body.deployment.nginxDeployType === 'LoadBalancer') {
					delete envs['NGINX_HTTP_PORT'];
					delete envs['NGINX_HTTPS_PORT'];
				}
				
				if (!body.clusters.mongoExt) {
					envs["MONGO_PORT"] = body.deployment.mongoExposedPort;
				}
				
				if (body.deployment.gitSource && body.deployment.gitSource !== 'github') {
					envs["SOAJS_GIT_SOURCE"] = body.deployment.gitSource;
					envs["SOAJS_GIT_PROVIDER"] = body.deployment.gitProvider;
				}
				
				if (body.clusters.replicaSet) {
					envs['SOAJS_MONGO_RSNAME'] = body.clusters.replicaSet;
				}
				
				if (body.deployment.authentication && body.deployment.authentication.accessToken) {
					envs['SWARM_AUTH_TOKEN'] = body.deployment.authentication.accessToken;
				}
				
				//add readiness probes environment variables
				if (body.deployment.readinessProbe) {
					envs["KUBE_INITIAL_DELAY"] = body.deployment.readinessProbe.initialDelaySeconds;
					envs["KUBE_PROBE_TIMEOUT"] = body.deployment.readinessProbe.timeoutSeconds;
					envs["KUBE_PROBE_PERIOD"] = body.deployment.readinessProbe.periodSeconds;
					envs["KUBE_PROBE_SUCCESS"] = body.deployment.readinessProbe.successThreshold;
					envs["KUBE_PROBE_FAILURE"] = body.deployment.readinessProbe.failureThreshold;
				}
				
				//add namespace configuration
				if (body.deployment.namespaces) {
					envs["SOAJS_NAMESPACES_DEFAULT"] = body.deployment.namespaces.default;
					envs["SOAJS_NAMESPACES_PER_SERVICE"] = body.deployment.namespaces.perService;
				}
				
				for (var e in envs) {
					if (envs[e] !== null) {
						output += "export " + e + "=" + envs[e] + os.EOL;
					}
				}
				
				output += os.EOL + nodePath + " " + path.normalize(__dirname + "/../scripts/docker.js") + os.EOL;
				fs.writeFile(filename, output, function (err) {
					if (err) {
						return cb(err);
					}
					fs.chmod(path.normalize(__dirname + "/../scripts/swarm-deploy.sh"), "0755", function (chmodErr) {
						if (chmodErr) {
							return cb(chmodErr);
						}
						lib.generateResponse("swarm", body, cb);
					});
				});
			}
			else if (driver === 'kubernetes') {
				
				var filename = path.normalize(__dirname + "/../scripts/kubernetes-deploy.sh");
				var output = "#!/bin/bash" + os.EOL + os.EOL;
				
				var envs = {
					"SOAJS_DEPLOY_HA": driver,
					"SOAJS_GIT_DASHBOARD_BRANCH": process.env.SOAJS_GIT_DASHBOARD_BRANCH || "master",
					"SOAJS_GIT_BRANCH": process.env.SOAJS_GIT_BRANCH || "master",
					"SOAJS_PROFILE": path.normalize(dataDir + "startup/profile.js"),
					"NODE_PATH": nodePath,
					
					"SOAJS_EXTKEY": body.security.guestExtKey,
					"API_PREFIX": body.gi.api,
					"SITE_PREFIX": body.gi.site,
					"MASTER_DOMAIN": body.gi.domain,
					
					"MONGO_EXT": body.clusters.mongoExt,
					
					"SOAJS_DATA_FOLDER": path.normalize(dataDir + "startup/"),
					
					"SOAJS_IMAGE_PREFIX": body.deployment.soajsImagePrefix,
					"SOAJS_IMAGE_TAG": body.deployment.soajsImageTag,
					
					"SOAJS_NX_IMAGE_PREFIX": body.deployment.nginxImagePrefix,
					"SOAJS_NX_IMAGE_TAG": body.deployment.nginxImageTag,
					
					"NGINX_HTTP_PORT": 30000 + body.deployment.nginxPort,
					"NGINX_HTTPS_PORT": 30000 + body.deployment.nginxSecurePort,
					"SOAJS_NX_SSL": body.deployment.nginxSsl,
					
					"CONTAINER_HOST": body.deployment.containerHost,
					"CONTAINER_PORT": body.deployment.kubernetes.containerPort,
					"SOAJS_DOCKER_REPLICA": body.deployment.dockerReplica,
					
					"KUBE_AUTH_TOKEN": body.deployment.authentication.accessToken,
					
					"NGINX_DEPLOY_TYPE": body.deployment.nginxDeployType
				};
				
				if (body.deployment.nginxDeployType === 'LoadBalancer') {
					delete envs['NGINX_HTTP_PORT'];
					delete envs['NGINX_HTTPS_PORT'];
				}
				
				if (!body.clusters.mongoExt) {
					envs["MONGO_PORT"] = body.deployment.mongoExposedPort;
				}
				
				if (body.deployment.nginxSsl && !body.deployment.generateSsc && body.deployment.nginxKubeSecret) {
					envs["SOAJS_NX_SSL_SECRET"] = body.deployment.nginxKubeSecret;
				}
				
				if (body.deployment.gitSource && body.deployment.gitSource !== 'github') {
					envs["SOAJS_GIT_SOURCE"] = body.deployment.gitSource;
					envs["SOAJS_GIT_PROVIDER"] = body.deployment.gitProvider;
				}
				
				if (body.clusters.replicaSet) {
					envs['SOAJS_MONGO_RSNAME'] = body.clusters.replicaSet;
				}
				//add readiness probes environment variables
				if (body.deployment.readinessProbe) {
					envs["KUBE_INITIAL_DELAY"] = body.deployment.readinessProbe.initialDelaySeconds;
					envs["KUBE_PROBE_TIMEOUT"] = body.deployment.readinessProbe.timeoutSeconds;
					envs["KUBE_PROBE_PERIOD"] = body.deployment.readinessProbe.periodSeconds;
					envs["KUBE_PROBE_SUCCESS"] = body.deployment.readinessProbe.successThreshold;
					envs["KUBE_PROBE_FAILURE"] = body.deployment.readinessProbe.failureThreshold;
				}
				
				//add namespace configuration
				if (body.deployment.namespaces) {
					envs["SOAJS_NAMESPACES_DEFAULT"] = body.deployment.namespaces.default;
					envs["SOAJS_NAMESPACES_PER_SERVICE"] = body.deployment.namespaces.perService;
				}
				
				for (var e in envs) {
					if (envs[e] !== null) {
						output += "export " + e + "=" + envs[e] + os.EOL;
					}
				}
				
				output += os.EOL + nodePath + " " + path.normalize(__dirname + "/../scripts/kubernetes.js") + os.EOL;
				
				fs.writeFile(filename, output, function (err) {
					if (err) {
						return cb(err);
					}
					fs.chmod(path.normalize(__dirname + "/../scripts/kubernetes-deploy.sh"), "0755", function (chmodErr) {
						if (chmodErr) {
							return cb(chmodErr);
						}
						lib.generateResponse("kubernetes", body, cb);
					});
				});
			}
			else {
				return cb(new Error("Invalid Deployment Strategy Requested: " + driver));
			}
		});
	},
	
	"regenerateInfo": function (type, body, cb) {
		lib.generateResponse(type, body, cb);
	},
	
	"generateResponse": function (type, body, cb) {
		fs.chmodSync(path.normalize(__dirname + "/../scripts/" + type + "-deploy.sh"), "0755");
		var protocol = body.deployment.nginxSsl ? "https" : "http";
		var port = body.deployment.nginxSsl ? body.deployment.nginxSecurePort : body.deployment.nginxPort;
		
		if (body.deployment.nginxDeployType === 'NodePort') {
			port += 30000;
		}
		
		var obj = {
			"hosts": {
				"api": body.deployment.containerHost + " " + body.gi.api + "." + body.gi.domain,
				"site": body.deployment.containerHost + " " + body.gi.site + "." + body.gi.domain
			},
			"ui": protocol + "://" + body.gi.site + "." + body.gi.domain,
			"cmd": "sudo " + path.normalize(__dirname + "/../scripts/" + type + "-deploy.sh")
		};
		
		if (port !== 80) {
			obj["ui"] = protocol + "://" + body.gi.site + "." + body.gi.domain + ":" + port;
		}
		
		if (type === 'kubernetes') {
			obj = {
				"hosts": {
					"api": body.deployment.containerHost + " " + body.gi.api + "." + body.gi.domain,
					"site": body.deployment.containerHost + " " + body.gi.site + "." + body.gi.domain
				},
				"ui": protocol + "://" + body.gi.site + "." + body.gi.domain + ":" + port,
				"cmd": "sudo " + path.normalize(__dirname + "/../scripts/" + type + "-deploy.sh")
			};
		}
		
		if (!body.clusters || !body.clusters.mongoExt) {
			if (type === 'kubernetes') {
				var namespace = body.deployment.namespaces.default;
				if (body.deployment.namespaces.perService) {
					namespace += '-dashboard-soajsdata';
				}
				obj['hosts'].mongo = body.deployment.containerHost + " dashboard-soajsdata." + namespace;
			}
			else {
				obj['hosts'].mongo = body.deployment.containerHost + " dashboard-soajsdata";
			}
		}
		else {
			obj['hosts'].mongo = body.clusters.servers[0].host + " dashboard-soajsdata";
		}
		return cb(null, obj);
	},
	
	"returnInstallProgress": function (body, cb) {
		/*
		 1- call api and check if all services have containers
		 */
		if (body.deployment.deployDriver.indexOf("docker") !== -1) {
			// docker
			var services = ["dashboard_soajs_oauth", "dashboard_soajs_urac", "dashboard_soajs_dashboard", "dashboard-controller", "dashboard_nginx"];
			if (!body.clusters.mongoExt) {
				services.push("dashboard-soajsdata");
			}
			
			var Docker = require('dockerode');
			var deployerConfig = {
				"host": body.deployment.containerHost,
				"port": body.deployment.docker.containerPort,
				'protocol': 'https',
				'headers': {
					'token': body.deployment.authentication.accessToken
				}
			};
			var deployer = new Docker(deployerConfig);
			deployer.listContainers({}, function (error, containers) {
				if (error) return cb(error);
				
				deployer.listServices({}, function (error, dockerServices) {
					if (error) return cb(error);
					
					async.map(dockerServices, function (oneService, mcb) {
						if ((services.indexOf(oneService.Spec.Name) === -1)) {
							return mcb(null, false);
						}
						
						var count = 0;
						containers.forEach(function (oneContainer) {
							if (oneContainer.Labels['com.docker.swarm.service.name'] === oneService.Spec.Name) {
								count++;
							}
						});
						return mcb(null, (count === body.deployment.dockerReplica));
					}, function (error, response) {
						if (error) return cb(error);
						
						var bar = 0;
						for (var i = response.length - 1; i >= 0; i--) {
							if (response[i]) {
								bar++;
							}
						}
						
						return cb(null, {
							deployType: 'docker',
							download: {
								count: bar,
								total: services.length
							}
						});
					});
				});
			});
		}
		else {
			// kubernetes
			var services = ["dashboard-oauth-v1", "dashboard-urac-v2", "dashboard-dashboard-v1", "dashboard-controller-v1", "dashboard-nginx"];
			if (!body.clusters.mongoExt) {
				services.push("dashboard-soajsdata");
			}
			
			var K8Api = require('kubernetes-client');
			
			if (!body.deployment.authentication || !body.deployment.authentication.accessToken) {
				return cb(new Error('No access token found.'));
			}
			
			try {
				var deployerConfig = {
					"url": 'https://' + (body.deployment.containerHost || "127.0.0.1") + ':' + (parseInt(body.deployment.kubernetes.containerPort) || 8443),
					"auth": {
						"bearer": body.deployment.authentication.accessToken
					},
					"request": {
						"strictSSL": false
					},
					"version": "v1beta1"
				};
				var deployer = new K8Api.Extensions(deployerConfig);
			}
			catch (e) {
				return cb(null, {
					deployType: 'kubernetes',
					download: {
						count: 0,
						total: services.length
					}
				});
			}
			
			var defaultNamespace = body.deployment.namespaces.default;
			
			//get all services regardless of their namespace value
			async.parallel({
				deployments: function (callback) {
					deployer.deployments.get({}, callback);
				},
				daemonsets: function (callback) {
					deployer.daemonsets.get({}, callback);
				}
			}, function (err, results) {
				if (err) {
					return cb(err);
				}
				if (!results || !results.deployments || !results.deployments.items || results.deployments.items.length === 0) {
					return cb(null, {
						deployType: 'kubernetes',
						download: {
							count: 0,
							total: 0
						}
					});
				}
				var items = results.deployments.items;
				if (results.daemonsets.items && results.daemonsets.items.length > 0) {
					items = results.deployments.items.concat(results.daemonsets.items);
				}
				async.map(items, function (oneService, mcb) {
					var serviceName = oneService.metadata.name, namespace;
					
					if (body.deployment.namespaces.perService) {
						namespace = defaultNamespace + '-' + oneService.metadata.labels['soajs.service.label'];
					}
					else {
						namespace = defaultNamespace;
					}
					
					if (services.indexOf(serviceName) !== -1 && oneService.metadata.namespace === namespace) {
						if (oneService.metadata.labels["soajs.service.mode"] === "daemonset") {
							return mcb(null, (oneService.status.numberReady === 1));
						}
						else {
							return mcb(null, (oneService.status.availableReplicas === body.deployment.dockerReplica));
						}
					}
					else return mcb(null, null);
				}, function (error, response) {
					if (error) return cb(error);
					
					var bar = 0;
					for (var i = response.length - 1; i >= 0; i--) {
						if (response[i]) {
							bar++;
						}
					}
					
					//the only thing remaining now in the array are 1s and 0s which represent the repos installed
					return cb(null, {
						deployType: 'kubernetes',
						download: {
							count: bar,
							total: services.length
						}
					});
				});
			});
		}
		
		function checkHosts(ha, download) {
			/*
			 1- load profile
			 2- create new mongo connector
			 3- query hosts collection
			 */
			var profile = require(path.normalize(dataDir + "startup/profile.js"));
			var myMongo = new soajs.mongo(profile);
			
			myMongo.find("hosts", {"env": "dashboard"}, function (error, hosts) {
				if (error) {
					return cb(error);
				}
				
				var data = {
					download: download.download
				};
				
				var list = ["controller", "urac", "dashboard"];
				if (ha) {
					var replica = body.deployment.dockerReplica;
					data.install = {
						count: hosts.length,
						total: list.length * replica
					};
				}
				else {
					list.pop();
					data.install = {
						count: hosts.length,
						total: list.length
					};
				}
				
				myMongo.closeDb();
				return cb(null, data);
			});
		}
	},
	
	"versions": function (config, req, cb) {
		
		let myUrl = config.docker.url;
		let prefix = req.soajs.inputmaskData.prefix;
		let name = req.soajs.inputmaskData.name;
		myUrl = myUrl.replace("%organization%", prefix).replace("%imagename%", name);
		
		let options = {
			method: 'GET',
			url: myUrl,
			headers: {'cache-control': 'no-cache'},
			json: true
		};
		req.soajs.log.debug(options);
		request.get(options, function (error, response, body) {
			if (error) {
				return cb(error);
			}
			
			let tag = req.soajs.inputmaskData.tag;
			let output = [];
			if (body && body.results) {
				if (tag) {
					body.results.forEach((oneTag) => {
						if (oneTag.name === tag) {
							output.push(oneTag);
						}
					});
				}
				else {
					let count = 1;
					body.results.forEach((oneTag) => {
						if (count <= 5) {
							output.push(oneTag);
							count++;
						}
					});
				}
			}
			
			return cb(null, output);
		});
	}
};
module.exports = lib;