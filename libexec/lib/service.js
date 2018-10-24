'use strict';

const path = require("path");
const fs = require("fs");
const spawn = require("child_process").spawn;

const installerConfig = require(path.normalize(process.env.PWD + "/../etc/config.js"));

const SOAJS_RMS = {
	'gateway': "soajs.controller",
	'urac': 'soajs.urac',
	'oauth': 'soajs.oauth',
	'dashboard': 'soajs.dashboard',
	'ui': 'soajs.dashboard.ui'
};

const serviceModule = {
	
	/**
	 * This command will calculate the needed env variables and
	 * start the requested service if supported in the requested environment
	 * @param args {Array}
	 * @param callback {Function}
	 */
	'start': (args, callback) => {
		if (args.length < 2) {
			return callback();
		}
		
		//check if service is supported
		let requestedService = args[0];
		let serviceType = (requestedService === 'ui') ? 'SOAJS Console' : 'Service';
		if(!SOAJS_RMS[requestedService]){
			serviceType = (requestedService === 'ui') ? 'SOAJS Console' : 'Service';
			return callback(`${serviceType} ${requestedService} is not supported!`);
		}
			
			//check for environment
		let requestedEnvironment = args[1];
		if(!requestedEnvironment.includes("--env")){
			return callback(`Specify the environment where you want ${requestedService} to be deployed!`);
		}
		requestedEnvironment = requestedEnvironment.split("=");
		if(!requestedEnvironment[1] || requestedEnvironment[1] === ''){
			return callback(`Specify the environment where you want ${requestedService} to be deployed!`);
		}
		requestedEnvironment = requestedEnvironment[1].toLowerCase();
		
		//check if service is installed and downloaded
		if(!installerConfig.workingDirectory || installerConfig.workingDirectory === ''){
			return callback(`${serviceType} ${requestedService} is not installed!`);
		}
		
		//check if service folder exists
		fs.stat(installerConfig.workingDirectory + "/node_modules/" + SOAJS_RMS[requestedService], (error, stats) => {
			if(error || !stats){
				return callback(`${serviceType} ${requestedService} is not installed!`);
			}
			
			//set and ensure the log directory
			let logLoc;
			switch (process.env.PLATFORM){
				case 'Darwin':
					logLoc = "/usr/local/var/log/soajs/";
					break;
				case 'Linux':
				default:
					logLoc = "/var/log/soajs/";
					break;
			}
			
			//check log file
			fs.stat(logLoc, (error, stats) => {
				if(error){
					if(error.code === 'ENOENT' && !stats){
						//create log file
						fs.mkdir(logLoc, { 'recursive': true}, (error) => {
							if (error) {
								return callback(`Unable to create a Log File for ${serviceType} ${requestedService}!`);
							}
							
							if(requestedService === 'ui'){
								launchUI(logLoc);
							}
							else {
								launchService(logLoc);
							}
						});
					}
					else{
						return callback(`Unable to create a Log File for ${serviceType} ${requestedService}!`);
					}
				}
				else{
					if(requestedService === 'ui'){
						launchUI(logLoc);
					}
					else {
						launchService(logLoc);
					}
				}
			});
		});
		
		//function that sets the aggregated variables as environment variables and launches the service.
		function launchService(logLoc) {
			
			process.env.SOAJS_ENV = requestedEnvironment;
			process.env.SOAJS_SRVIP = '127.0.0.1';
			process.env.SOAJS_PROFILE = path.normalize(process.env.PWD + "/../data/soajs_profile.js" );
			
			//check for custom port
			if(args[2] && args[2].includes("--port")){
				let customServicePort = args[2].split("=");
				if(customServicePort[1] && customServicePort[1] !== ''){
					process.env.SOAJS_SRVPORT = customServicePort[1];
				}
			}
			
			let outLog = path.normalize(logLoc + `/${requestedEnvironment}-${requestedService}-out.log`);
			let serviceOutLog = fs.openSync(outLog, "w");
			
			let errLog = path.normalize(logLoc + `/${requestedEnvironment}-${requestedService}-err.log`);
			let serviceErrLog = fs.openSync(errLog, "w");
			
			let serviceInstance = spawn(process.env.NODE_BIN, [installerConfig.workingDirectory + "/node_modules/" + SOAJS_RMS[requestedService] + `/index.js`, `--env=${requestedEnvironment}`], {
				"env": process.env,
				"stdio": ['ignore', serviceOutLog, serviceErrLog],
				"detached": true,
			});
			serviceInstance.unref();
			
			//generate out message for service
			let output = `Service ${requestedService} started ...\n`;
			output += "Logs:\n";
			output += `[ out ] -> ${outLog}\n`;
			output += `[ err ] -> ${errLog}\n`;
			return callback(null, output);
		}
		
		//function that starts the ui express app which contains the soajs console ui.
		function launchUI(logLoc) {
			let outLog = path.normalize(logLoc + `/${requestedEnvironment}-${requestedService}-out.log`);
			let serviceOutLog = fs.openSync(outLog, "w");
			
			let errLog = path.normalize(logLoc + `/${requestedEnvironment}-${requestedService}-err.log`);
			let serviceErrLog = fs.openSync(errLog, "w");
			
			let serviceInstance = spawn(process.env.NODE_BIN, [installerConfig.workingDirectory + "/node_modules/" + SOAJS_RMS[requestedService] + "/app/index.js"], {
				"env": process.env,
				"stdio": ['ignore', serviceOutLog, serviceErrLog],
				"detached": true,
			});
			serviceInstance.unref();
			
			//require the ui config to learn the host and the port values
			let uiConfig = require(installerConfig.workingDirectory + "/node_modules/" + SOAJS_RMS[requestedService] + "/app/config.js");
			
			//generate output message for ui
			let output = `SOAJS Console UI started ...\n`;
			output += `In your Browser, open: http://${uiConfig.host}:${uiConfig.port}/ \n`;
			return callback(null, output);
		}
	},
	
	'stop': (args, callback) => {
	
	}
};

module.exports = serviceModule;