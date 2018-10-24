'use strict';
const path = require("path");
const fs = require("fs");
let spawn = require("child_process").spawn;
let exec = require("child_process").exec;
let YAML = require("yamljs");

//mongo commands
let mongoModule = {
	/**
	 * build the soajs_mongo.conf file based on the operating system running the installer on
	 * @param args
	 * @param callback
	 */
	install: (args, callback) => {
		let config = {
			"systemLog": {
				"destination": "file",
				"logAppend": true
			},
			"storage": {
				"journal": {
					"enabled": true
				}
			},
			"processManagement": {
				"fork": true
			},
			"net": {
				"bindIp": "0.0.0.0",
				"port": 32017
			}
		};
		let logPath;
		if (process.env.PLATFORM === 'Darwin') {
			config.systemLog.path = "/usr/local/var/log/mongodb/mongo.log";
			config.storage.dbPath = "/usr/local/var/mongodb";
			logPath = '/usr/local/var/log/mongodb/';
		}
		else if (process.env.PLATFORM === 'Linux') {
			config.systemLog.path = "/var/log/mongodb/mongo.log";
			config.storage.dbPath = "/var/mongodb";
			logPath = '/var/log/';
		}
		//convert from json to yaml
		let yamlFile = YAML.stringify(config, 4);
		let mongoDbConf = path.normalize(process.env.PWD + "/../include/" + process.env.MONGO_LOCATION);
		
		//check if log path is found
		checkFile(logPath, () => {
			
			//check if db path is  found
			checkFile(config.storage.dbPath, () => {
				
				//write the path
				fs.writeFile(mongoDbConf + "/mongod.conf", yamlFile, (error) => {
					if (error) {
						return callback(error);
					}
					return callback(null, `MongoDB conf file has been created at ${mongoDbConf}/mongod.conf`);
				});
			});
		});
		
		//check if directory for mongo log files is found
		function checkFile(path, cb) {
			fs.stat(path, (error) => {
				if (error) {
					//if not found create the directories needed recursively
					fs.mkdir(path, {recursive: true}, cb);
				}
				cb();
			});
		}
	},
	
	start: (args, callback) => {
		let mongoDbConf = path.normalize(process.env.PWD + "/../include/" + process.env.MONGO_LOCATION + "/mongod.conf");
		
		//check ig mongo.conf is found
		fs.stat(mongoDbConf, (error) => {
			if (error) {
				return callback(null, `MongoDB configuration file not found. Run [soajs mongo install] to create one.`)
			}
			let mongoPath = process.env.PWD + "/../include/" + process.env.MONGO_LOCATION + "/bin/mongod";
			const startMongo = spawn(mongoPath, [`--config=${mongoDbConf}`],
				{
					detached: true,
					"stdio": ['ignore', 'ignore', 'ignore']
				});
			startMongo.unref();
			callback(null, "MongoDB Started ...");
		});
	},
	
	stop: (rgs, callback) => {
		let mongoDbConf = path.normalize(process.env.PWD + "/../include/" + process.env.MONGO_LOCATION);
		
		//check if there is a running process for the requested
		exec(`ps aux | grep ${mongoDbConf}`, (error, cmdOutput) => {
			if (error || !cmdOutput) {
				return callback();
			}
			
			//go through the returned output and find the process ID
			cmdOutput = cmdOutput.split("\n");
			
			if (Array.isArray(cmdOutput) && cmdOutput.length > 0) {
				let PID;
				cmdOutput.forEach((oneCMDLine) => {
					if (oneCMDLine.includes(`--config=${mongoDbConf}/mongod.conf`)) {
						let oneProcess = oneCMDLine.replace(/\s+/g, ' ').split(' ');
						PID = oneProcess[1];
					}
				});
				//if no PID return, nothing to do
				if (!PID) {
					return callback();
				}
				
				//stop the running process
				exec(`kill -9 ${PID}`, (error) => {
					if (error) {
						return callback(error);
					}
					else {
						return callback(null, `MongoDB Stoped ...`);
					}
				});
			}
			else {
				return callback();
			}
		});
	},
	
	restart: (args, callback) => {
		
		//stop mongodb
		mongoModule.stop(args, (err) => {
			if (err) {
				return callback(err);
			}
			
			//start mongodb
			mongoModule.start(args, callback);
		});
	},
	
	setPort: (args, callback) => {
		//todo check args
		let mongoDbConf = path.normalize(process.env.PWD + "/../include/" + process.env.MONGO_LOCATION + "/mongod.conf");
		
		//check if mongo.conf exists
		fs.stat(mongoDbConf, (error) => {
			if (error) {
				return callback(null, 'MongoDB configuration file not found. Run [soajs mongo install] to create one.');
			}
			let mongoConf;
			
			//
			fs.readFile(mongoDbConf, 'utf8', function read(err, data) {
				if (err) {
					return callback(null, 'MongoDB configuration file not found. Run [soajs mongo install] to create one.');
				}
				try {
					mongoConf = YAML.parse(data);
				}
				catch (e) {
					return callback(null, `Malformed ${mongoDbConf}!`);
				}
				if (mongoConf.net && mongoConf.net.port) {
					mongoConf.net.port = parseInt(args[0]);
				}
				let yamlFile = YAML.stringify(mongoConf, 4);
				fs.writeFile(mongoDbConf, yamlFile, (error) => {
					if (error) {
						return callback(error);
					}
					
					exec("soajs profile setPort " + args[0], callback);
				});
			});
			
		});
	},
	clean: () => {
	
	},
	patch: () => {
	
	}
};

module.exports = mongoModule;
