"use strict";

const path = require("path");
const bunyan = require("bunyan");
const exec = require("child_process").exec;
const spawn = require("child_process").spawn;

//set the process arguments and remove the first 2, they are not needed
let processArguments = process.argv;
processArguments.shift();
processArguments.shift();

//find the correct module to load
let soajsModule;
switch(processArguments[0]){
	case 'mongo':
		soajsModule = "mongo.js";
		break;
	case 'profile':
		soajsModule = "profile.js";
		break;
	case 'service':
		soajsModule = "service.js";
		break;
	case 'console':
		soajsModule = "console.js";
		break;
	case 'docker':
		soajsModule = "docker.js";
		break;
	case 'kubernetes':
		soajsModule = "kubernetes.js";
		break;
	case 'remote-installer':
		soajsModule = "remote-installer.js";
		break;
}

//set the logger
const logger = bunyan.createLogger({
	name: "SOAJS Installer",
	"src": true,
	"level": "debug",
	"stream": process.stdout,
	"formatter": {
		"levelInString": true,
		"outputMode": 'short'
	}
});

//requested module is not supported
if(!soajsModule){
	logger.error(`The command you have requested is not supported by the soajs installer: '${processArguments[0]}'`);
	process.exit();
}

console.log("environment variables:")
console.log(JSON.stringify(process.env, null, 2));

let soajsModulesDirectory = path.normalize(process.env.PWD + `/../libexec/lib/`);
exec(` ${soajsModule}`, {
	"cwd": soajsModulesDirectory,
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
	if (!modules || modules.length === 0) {
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

console.log("Arguments:")
console.log(JSON.stringify(processArguments, null, 2));


