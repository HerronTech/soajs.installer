"use strict";
var os = require("os");
var fs = require("fs");
var path = require("path");
var exec = require("child_process").exec;

var soajs = require("soajs");
var whereis = require('whereis');

//external libs
var ncp = require("ncp");
var rimraf = require("rimraf");

var dataDir = __dirname + "/../data/";

module.exports = {
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
				delete require.cache[require.resolve(dataDir + "custom.js")];
				var customData = require(dataDir + "custom.js");
				if (section) {
					return cb(customData[section]);
				}
				else {
					return cb(customData);
				}
			}
		});
	},
	
	"generateExtKeys": function (opts, cb) {
		//soajs encryption engine
		var module = require("soajs/modules/soajs.core").key;
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
		delete clusters.prefix;
		
		//fix clusters credentials
		if (clusters.credentials.username === "") {
			clusters.credentials = {};
			delete clusters.URLParam.authSource;
		}
		
		//modify users file
		var userData = fs.readFileSync(folder + "urac/users/owner.js", "utf8");
		userData = userData.replace(/%username%/g, body.gi.username);
		userData = userData.replace(/%email%/g, body.gi.email);
		
		var Hasher = soajs.hasher;
		Hasher.init({
			"hashIterations": 1024,
			"seedLength": 32,
		});
		var hashedPwd = Hasher.hash(body.gi.password);
		userData = userData.replace(/%password%/g, hashedPwd);
		fs.writeFile(folder + "urac/users/owner.js", userData, "utf8");
		
		//modify environments file
		var envData = fs.readFileSync(folder + "environments/dashboard.js", "utf8");
		envData = envData.replace(/%domain%/g, body.gi.domain);
		envData = envData.replace(/%site%/g, body.gi.site);
		envData = envData.replace(/%api%/g, body.gi.api);
		envData = envData.replace(/%wrkDir%/g, body.gi.wrkDir);
		envData = envData.replace(/%deployType%/g, body.deployment.deployType);
		envData = envData.replace(/%deployDriver%/g, body.deployment.deployDriver);
		envData = envData.replace(/%deployDockerNodes%/g, body.deployment.deployDockerNodes);
		envData = envData.replace(/%clusterPrefix%/g, body.clusters.prefix);
		envData = envData.replace(/"%clusters%"/g, JSON.stringify(clusters, null, 2));
		envData = envData.replace(/%keySecret%/g, body.security.key);
		envData = envData.replace(/%sessionSecret%/g, body.security.session);
		envData = envData.replace(/%cookieSecret%/g, body.security.cookie);
		fs.writeFile(folder + "environments/dashboard.js", envData, "utf8");
		
		//modify tenants file
		var tntData = fs.readFileSync(folder + "tenants/owner.js", "utf8");
		tntData = tntData.replace(/%email%/g, body.gi.email);
		tntData = tntData.replace(/%site%/g, body.gi.site);
		tntData = tntData.replace(/%domain%/g, body.gi.domain);
		tntData = tntData.replace(/%wrkDir%/g, body.gi.wrkDir);
		tntData = tntData.replace(/%extKey1%/g, body.security.extKey1);
		tntData = tntData.replace(/%extKey2%/g, body.security.extKey2);
		fs.writeFile(folder + "tenants/owner.js", tntData, "utf8");
		
		//modify dashboard extKey file
		var tntData = fs.readFileSync(folder + "extKeys/keys.js", "utf8");
		tntData = tntData.replace(/%extKey2%/g, body.security.extKey2);
		fs.writeFile(folder + "extKeys/keys.js", tntData, "utf8");
		
		//generate profile
		var profileData = '"use strict;"' + os.EOL;
		clusters.name = "core_provision";
		clusters.prefix = body.clusters.prefix || "";
		profileData += 'module.exports = ' + JSON.stringify(clusters, null, 2) + ';';
		fs.writeFileSync(folder + "profile.js", profileData, "utf8");
		
		//remove unneeded file
		fs.unlinkSync(folder + "tenants/info.js");
	},
	
	"importMongo": function (folder, body, cb) {
		//copy data.js to startup
		//add prefix while copying
		fs.readFile(dataDir + "data.js", "utf8", function (error, readData) {
			if (error) {
				return res.json(req.soajs.buildResponse({"code": 400, "msg": error.message}));
			}
			
			var writeStream = fs.createWriteStream(folder + "data.js");
			writeStream.write("var dbPrefix = '" + body.clusters.prefix + "';" + os.EOL);
			writeStream.write(readData);
			writeStream.end();
			
			//execute import data.js
			var execString = "cd " + folder + " && mongo --host " + body.clusters.servers[0].host + ":" + body.clusters.servers[0].port;
			if (body.clusters.credentials && body.clusters.credentials.username && body.clusters.credentials.password && body.clusters.URLParam && body.clusters.URLParam.authSource) {
				execString += " -u " + body.clusters.credentials.username + " -p " + body.clusters.credentials.password + " --authenticationDatabase " + body.clusters.URLParam.authSource;
			}
			execString += " data.js";
			exec(execString, cb);
		});
	},
	
	"unifyData": function (def, over) {
		for (var i in def.gi) {
			if (over.gi[i] && over.gi[i] !== "") {
				def.gi[i] = over.gi[i];
			}
		}
		for (var i in def.security) {
			if (over.security[i] && over.security[i] !== "") {
				def.security[i] = over.security[i];
			}
		}
		
		for (var i in def.deployment) {
			if (over.deployment[i] && over.deployment[i] !== "") {
				def.deployment[i] = over.deployment[i];
			}
		}
		
		for (var j in over.clusters) {
			def.clusters[j] = over.clusters[j];
		}
		
		return def;
	},
	
	"deployManual": function (body, cb) {
		body.gi.wrkDir = path.normalize(body.gi.wrkDir);
		//launch deployer
		whereis('node', function(err, nodePath) {
			if(err){
				return cb(err);
			}
			whereis("npm", function(err, npmPath){
				if(err){
					return cb(err);
				}
				
				var runner = fs.createWriteStream(path.normalize(__dirname + "/../scripts/manual-deploy.sh"));
				runner.write("#!/bin/bash" + os.EOL + os.EOL);
				var envs = {
					"NODE_PATH": nodePath,
					"NPM_PATH": npmPath,
					"DEPLOY_FROM": process.env.DEPLOY_FROM || "NPM",
					"DEPLOY_BRANCH": process.env.DEPLOY_BRANCH || "master",
					"SOAJS_PROFILE": path.normalize(dataDir + "startup/profile.js"),
					"INSTALLER_DIR": path.normalize(__dirname + "/../scripts/"),
					"SOAJS_DEPLOY_DIR": body.gi.wrkDir,
					"API_PREFIX": body.gi.api,
					"SITE_PREFIX": body.gi.site,
					"MASTER_DOMAIN": body.gi.domain
				};
				for(var e in envs){
					runner.write("export " + e + "=" + envs[e] + os.EOL);
				}
				
				runner.write(os.EOL + nodePath + " " + __dirname + "/../scripts/manual.js" + os.EOL);
				runner.write("ps aux | grep node" + os.EOL);
				runner.end();
				
				fs.chmodSync(path.normalize(__dirname + "/../scripts/manual-deploy.sh"), "0755");
				
				return cb(null, {
					"hosts": {
						"api": "127.0.0.1 " + body.gi.api + "." + body.gi.domain,
						"site": "127.0.0.1 " + body.gi.site + "." + body.gi.domain
					},
					"ui": "http://" + body.gi.site + "." + body.gi.domain,
					"cmd": path.normalize(__dirname + "/../scripts/manual-deploy.sh")
				});
			});
		});
	},
	
	"deployContainer": function (body, driver, loc, cb) {
		return cb(null, true);
	}
};