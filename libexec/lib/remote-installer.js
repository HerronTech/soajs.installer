'use strict';

const path = require("path");
const fs = require("fs");
const spawn = require("child_process").spawn;
const exec = require("child_process").exec;

const serviceModule = {
	
	/**
	 * This command will start the soajs remote cloud installer
	 * @param args {Array}
	 * @param callback {Function}
	 */
	'start': (args, callback) => {
		let logLoc = "/usr/local/var/log/soajs/";
		let outLog = path.normalize(logLoc + `/remote-installer-out.log`);
		let serviceOutLog = fs.openSync(outLog, "w");
		
		let errLog = path.normalize(logLoc + `/remote-installer-err.log`);
		let serviceErrLog = fs.openSync(errLog, "w");
		
		let serviceInstance = spawn(process.env.NODE_BIN, [ path.normalize(process.env.PWD + `/../include/soajs-remote/index.js`)], {
			"env": process.env,
			"stdio": ['ignore', serviceOutLog, serviceErrLog],
			"detached": true,
		});
		serviceInstance.unref();
		
		//generate out message for service
		let output = `SOAJS Remote Cloud Installer started ...\n`;
		output += `Open this link in your browser [ http://localhost:1337/ ]\n`;
		output += "Logs:\n";
		output += `[ out ] -> ${outLog}\n`;
		output += `[ err ] -> ${errLog}\n`;
		return callback(null, output);
	},
	
	/**
	 * This command will find the process id of the soajs remote installed and kill it
	 * @param args
	 * @param callback
	 * @returns {*}
	 */
	'stop': (args, callback) => {
		
		//check if there is a running process for the requested
		exec(`ps aux | grep soajs-remote`, (error, cmdOutput) => {
			if(error || !cmdOutput){
				return callback();
			}
			
			//go through the returned output and find the process ID
			cmdOutput = cmdOutput.split("\n");
			if(Array.isArray(cmdOutput) && cmdOutput.length > 0){
				let PID;
				cmdOutput.forEach((oneCMDLine) => {
					
					if(!oneCMDLine.includes("grep")){
						if(oneCMDLine.includes("soajs-remote")){
							let oneProcess = oneCMDLine.replace(/\s+/g, ' ').split(' ');
							PID = oneProcess[1];
						}
					}
				});
				
				//if no PID return, nothing to do
				if(!PID){
					return callback();
				}
				
				//stop the running process
				exec(`kill -9 ${PID}`, (error) => {
					if(error){
						return callback(error);
					}
					else{
						return callback(null, `SOAJS Remote Cloud Installer Terminated ...`);
					}
				});
			}
			else {
				return callback();
			}
		});
	},

    /**
     * Migrate soajs provision data
     * @param args
     * @param callback
     */
    migrate: (args, callback) => {
        //todo check args
        if (!Array.isArray(args) || args.length === 0) {
            return callback(null, "Missing migration strategy!");
        }
        let strategies = require("../migrate/config.js");

        if (args.length > 1) {
            args.shift();
            return callback(null, `Unidentified input ${args.join(" ")}. Please use soajs remote-installer migrate %strategy%.`);
        }

        // check if strategy is available
        let strategy = args[0];
        if (strategies.indexOf(strategy) === -1) {
            return callback(null, `Select one of the following strategies: ${strategies.join(" ")}.`);
        }
        let strategyFunction = require("../migrate/" + strategy + ".js");
        let profilePath = path.normalize(process.env.PWD + "/../include/soajs-remote/data/startup/profile.js");
        let dataPath = path.normalize(process.env.PWD + "/../include/soajs-remote/data/startup/");

        if (!fs.existsSync(profilePath))
            return callback(null, `Unable to find profile to connect to remote-installer mongo at: ${profilePath}.`);
        if (!fs.existsSync(dataPath))
            return callback(null, `Unable to find custom data path to connect to remote-installer mongo at: ${dataPath}.`);

        return strategyFunction(profilePath, dataPath, callback);
    }
};

module.exports = serviceModule;