"use strict";
var os = require("os");
var npm = require("npm");
var async = require("async");
var mkdirp = require("mkdirp");
var ncp = require("ncp");
var path = require("path");
var fs = require("fs");
var spawn = require("child_process").spawn;
var exec = require("child_process").exec;

var utilLog = require('util');

process.env.NODE_ENV = "production";
var LOC = (process.env.SOAJS_DEPLOY_DIR || "/opt") + "/";
var DEPLOY_FROM = process.env.DEPLOY_FROM || "GIT";
var GIT_BRANCH = process.env.SOAJS_GIT_BRANCH || "master";
var NODE = process.env.NODE_PATH || "node";
var NPM = process.env.NPM_PATH || "npm";
var WRK_DIR = LOC + 'soajs/node_modules';

process.env.SOAJS_ENV = process.env.SOAJS_ENV || "dashboard";
process.env.SOAJS_SRVIP = process.env.SOAJS_SRVIP || "127.0.0.1";

process.env.API_PREFIX = process.env.API_PREFIX || "dashboard-api";
process.env.SITE_PREFIX = process.env.SITE_PREFIX || "dashboard";
process.env.MASTER_DOMAIN = process.env.MASTER_DOMAIN || "soajs.org";

process.env.SOAJS_NX_API_DOMAIN = process.env.API_PREFIX + "." + process.env.MASTER_DOMAIN;
process.env.SOAJS_NX_SITE_DOMAIN = process.env.SITE_PREFIX + "." + process.env.MASTER_DOMAIN;
process.env.SOAJS_NX_CONTROLLER_NB = 1;
process.env.SOAJS_NX_CONTROLLER_IP_1 = process.env.SOAJS_SRVIP;
process.env.SOAJS_NX_SITE_PATH = WRK_DIR + "/soajs.dashboard/ui";
var NGINX_DEST = (process.platform === 'linux') ? "/etc/nginx/" : "/usr/local/etc/nginx/conf.d/";

function setupNginx(cb) {
	utilLog.log("\n=====================================");
	utilLog.log("CONFIGURING NGINX");
	utilLog.log("=====================================");
	mkdirp(path.normalize(WRK_DIR + "/../nginx"), function (err) {
		if (err) return cb(err);
		
		process.env.SOAJS_NX_LOC = path.normalize(WRK_DIR + "/../");
		process.env.SOAJS_NX_OS = "local";
		
		exec(NODE + " " + path.normalize(process.env.INSTALLER_DIR + "/FILES/deployer/nginx.js"), function (error) {
			if (error) {
				return cb(error);
			}
			
			if(process.platform === 'linux'){
				var files = [
					{
						's': path.normalize(WRK_DIR + "/../nginx/upstream.conf"),
						'd': NGINX_DEST + "conf.d/upstream.conf"
					},
					{
						's': path.normalize(WRK_DIR + "/../nginx/api.conf"),
						'd': NGINX_DEST + "sites-enabled/api.conf"
					},
					{
						's': path.normalize(WRK_DIR + "/../nginx/site.conf"),
						'd': NGINX_DEST + "sites-enabled/site.conf"
					}
				];
				async.each(files, copyConf, cb);
			}
			else if (process.platform === 'darwin'){
				var files = [
					{
						's': path.normalize(WRK_DIR + "/../nginx/upstream.conf"),
						'd': NGINX_DEST + "upstream.conf"
					},
					{
						's': path.normalize(WRK_DIR + "/../nginx/api.conf"),
						'd': NGINX_DEST + "api.conf"
					},
					{
						's': path.normalize(WRK_DIR + "/../nginx/site.conf"),
						'd': NGINX_DEST + "site.conf"
					}
				];
				async.each(files, copyConf, cb);
			}
			else{
				return cb(null, true);
			}
		});
	});
	
	function copyConf(opts, cb){
		utilLog.log(">>> copying", opts.s, "to", opts.d);
		ncp(opts.s, opts.d, cb);
	}
}

function startDashboard(cb) {
	utilLog.log("\n=====================================");
	utilLog.log("INSTALLING COMPONENTS");
	utilLog.log("=====================================");
	mkdirp(path.normalize(WRK_DIR + "/../logs/"), function (error) {
		if (error) {
			return cb(error);
		}
		async.series([
			function (mcb) {
				launchService('urac', mcb);
			},
			function (mcb) {
				launchService('dashboard', mcb);
			},
			function (mcb) {
				//wait 5 seconds, then start the controller
				setTimeout(function(){
					launchService('controller', mcb);
				}, 5000);
			},
			setupNginx
		], cb);
	});
	
	function launchService(serviceName, mcb) {
		utilLog.log('\nstarting', serviceName, '....');
		var out = fs.openSync(path.normalize(WRK_DIR + "/../logs/manual-" + serviceName + "-out.log"), "w");
		var err = fs.openSync(path.normalize(WRK_DIR + "/../logs/manual-" + serviceName + "-err.log"), "w");
		utilLog.log(NODE, WRK_DIR + "/soajs." + serviceName + "/index.js");
		var child = spawn(NODE, [WRK_DIR + "/soajs." + serviceName + "/index.js"], {
			"cwd": WRK_DIR + "/soajs." + serviceName,
			"env": process.env,
			"detached": true,
			"stdio": ['ignore', out, err]
		});
		child.unref();
		mcb();
	}
}

function loadDependencies(location, skip) {
	var jsonPackage = fs.readFileSync(location);
	jsonPackage = JSON.parse(jsonPackage);
	
	var modules = [];
	var pckgs = Object.keys(jsonPackage.dependencies);
	for (var i = 0; i < pckgs.length; i++) {
		if (pckgs[i] === 'soajs' && skip) {
			continue;
		}
		if (jsonPackage.dependencies[pckgs[i]] !== "*") {
			modules.push(pckgs[i] + "@" + jsonPackage.dependencies[pckgs[i]]);
		}
		else {
			modules.push(pckgs[i]);
		}
	}
	return modules;
}

function cloneInstallRepo(repoName, noCore, cb) {
	utilLog.log("\ninstalling", repoName, "...");
	exec("git clone  https://github.com/soajs/" + repoName + ".git --branch " + GIT_BRANCH, {
		"cwd": WRK_DIR,
		"env": process.env
	}, function (error, stdout, stderr) {
		if (error) {
			if (error.message.indexOf("destination path '" + repoName + "' already exists") === -1) {
				return cb(error);
			}
			else {
				utilLog.log(repoName, "already exists!");
			}
		}
		
		utilLog.log("installing dependencies ...");
		var modules = loadDependencies(WRK_DIR + "/" + repoName + "/package.json", noCore);
		if (modules.length === 0) {
			return cb();
		}
		utilLog.log(">>> ", NPM + " install " + modules.join(" "));
		exec(NPM + " install " + modules.join(" "), {
			"cwd": WRK_DIR + "/" + repoName,
			"env": process.env
		}, function (error) {
			if (error) {
				return cb(error);
			}
			return cb();
		});
	});
}

function install(cb) {
	utilLog.log("\n=====================================");
	utilLog.log("STARTING SERVICES");
	utilLog.log("=====================================");
	
	if (DEPLOY_FROM === "GIT") {
		utilLog.log("working in:", WRK_DIR);
		async.series([
			function (mcb) {
				cloneInstallRepo("soajs", false, mcb);
			},
			function (mcb) {
				cloneInstallRepo("soajs.controller", true, mcb);
			},
			function (mcb) {
				cloneInstallRepo("soajs.urac", true, mcb);
			},
			function (mcb) {
				cloneInstallRepo("soajs.dashboard", true, mcb);
			},
			function (mcb) {
				cloneInstallRepo("soajs.gcs", true, mcb);
			},
			startDashboard
		], cb);
	}
	else if (DEPLOY_FROM === "NPM") {
		utilLog.log("working in:", WRK_DIR + "/../");
		async.series([
			function (mcb) {
				utilLog.log("\ninstalling soajs.controller soajs.urac soajs.dashboard soajs.gcs ...");
				npm.load({prefix: WRK_DIR + "/../"}, function (err) {
					if (err) return mcb(err);
					npm.commands.install(["soajs.urac", "soajs.dashboard", "soajs.gcs"], function (error) {
						if (error) {
							utilLog.log('error', error);
						}
						npm.commands.install(["soajs.controller"], function(error){
							if (error) {
								utilLog.log('error', error);
							}
							return mcb();
						});
					});
				});
			},
			startDashboard
		], cb);
	}
	else {
		return cb(new Error("Invalid Deploy Source."));
	}
	
}

function importData(cb){
	
	mkdirp(LOC + "soajs/FILES/profiles/", function(error){
		if(error){
			return cb(error);
		}
		
		fs.createReadStream(process.env.SOAJS_PROFILE).pipe(fs.createWriteStream(LOC + "soajs/FILES/profiles/profile.js"));
		process.env.SOAJS_PROFILE = LOC + "soajs/FILES/profiles/profile.js";
		//execute import data.js
		var dataImportFile = __dirname + "/FILES/dataImport/index.js";
		var execString = process.env.NODE_PATH + " " + dataImportFile;
		exec(execString, cb);
	});
}

importData(function(error){
	if(error){
		throw error;
	}
	fs.exists(WRK_DIR, function (exists) {
		if (!exists) {
			mkdirp(WRK_DIR, function (error) {
				if (error) {
					throw error;
				}
				
				install(function (error) {
					if (error) {
						throw error;
					}
					
					utilLog.log("SOAJS has been deployed !");
				});
			});
		}
		else {
			install(function (error) {
				if (error) {
					throw error;
				}
				
				utilLog.log("SOAJS has been deployed !");
			});
		}
	});
});