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

process.env.NODE_ENV = "production";
var LOC = (process.env.SOAJS_DEPLOY_DIR || "/opt") + "/";
var DEPLOY_FROM = process.env.DEPLOY_FROM || "GIT";
var GIT_BRANCH = process.env.SOAJS_GIT_BRANCH || "develop";
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
var NGINX_DEST = (process.platform === 'linux') ? "/etc/nginx/" : "/usr/local/etc/nginx/servers/";

function setupNginx(cb) {
	console.log("\n=====================================");
	console.log("CONFIGURING NGINX");
	console.log("=====================================");
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
		console.log(">>> copying", opts.s, "to", opts.d);
		ncp(opts.s, opts.d, cb);
	}
}

function startDashboard(cb) {
	console.log("\n=====================================");
	console.log("INSTALLING COMPONENTS");
	console.log("=====================================");
	mkdirp(path.normalize(WRK_DIR + "/../logs/"), function (error) {
		if (error) {
			return cb(error);
		}
		async.series([
			function (mcb) {
				launchService('controller', mcb);
			},
			function (mcb) {
				launchService('urac', mcb);
			},
			function (mcb) {
				launchService('dashboard', mcb);
			},
			setupNginx
		], cb);
	});
	
	function launchService(serviceName, mcb) {
		console.log('\nstarting', serviceName, '....');
		var out = fs.openSync(path.normalize(WRK_DIR + "/../logs/manual-" + serviceName + "-out.log"), "w");
		var err = fs.openSync(path.normalize(WRK_DIR + "/../logs/manual-" + serviceName + "-err.log"), "w");
		console.log(NODE, WRK_DIR + "/soajs." + serviceName + "/index.js");
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
	console.log("\ninstalling", repoName, "...");
	exec("git clone  git@github.com:soajs/" + repoName + ".git --branch " + GIT_BRANCH, {
		"cwd": WRK_DIR,
		"env": process.env
	}, function (error, stdout, stderr) {
		if (error) {
			if (error.message.indexOf("destination path '" + repoName + "' already exists") === -1) {
				return cb(error);
			}
			else {
				console.log(repoName, "already exists!");
			}
		}
		
		console.log("installing dependencies ...");
		var modules = loadDependencies(WRK_DIR + "/" + repoName + "/package.json", noCore);
		if (modules.length === 0) {
			return cb();
		}
		console.log(">>> ", NPM + " install " + modules.join(" "));
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
	console.log("\n=====================================");
	console.log("STARTING SERVICES");
	console.log("=====================================");
	
	if (DEPLOY_FROM === "GIT") {
		console.log("working in:", WRK_DIR);
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
		console.log("working in:", WRK_DIR + "/../");
		async.series([
			function (mcb) {
				console.log("\ninstalling soajs.controller soajs.urac soajs.dashboard soajs.gcs ...");
				npm.load({prefix: WRK_DIR + "/../"}, function (err) {
					if (err) return mcb(err);
					npm.commands.install(["soajs.controller", "soajs.urac", "soajs.dashboard", "soajs.gcs"], function (error, data) {
						if (error) {
							console.log('error', error);
						}
						return mcb();
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
	var folder = process.env.SOAJS_DATA_FOLDER;
	delete require.cache[process.env.SOAJS_PROFILE];
	var profile = require(process.env.SOAJS_PROFILE);
	
	//execute import data.js
	var execString = "cd " + folder + " && mongo --host " + profile.servers[0].host + ":" + profile.servers[0].port;
	if (profile.credentials && profile.credentials.username && profile.credentials.password && profile.URLParam && profile.URLParam.authSource) {
		execString += " -u " + profile.credentials.username + " -p " + profile.credentials.password + " --authenticationDatabase " + profile.URLParam.authSource;
	}
	execString += " data.js";
	exec(execString, cb);
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
					
					console.log("SOAJS has been deployed !");
				});
			});
		}
		else {
			install(function (error) {
				if (error) {
					throw error;
				}
				
				console.log("SOAJS has been deployed !");
			});
		}
	});
});