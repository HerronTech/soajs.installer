'use strict';

const path = require("path");
const fs = require("fs");

const mkdirp = require("mkdirp");
const async = require("async");
const npm = require("npm");
const rimraf = require("rimraf");

const installerConfig = require(path.normalize(process.env.PWD + "/../etc/config.js"));
const serviceModule = require("./service");
const mongoModule = require("./mongo");

//set the logger
const logger = require("../utils/utils.js").getLogger();

const SOAJS_RMS = {
	'gateway': "soajs.controller",
	'urac': 'soajs.urac',
	'oauth': 'soajs.oauth',
	'dashboard': 'soajs.dashboard',
	'ui': 'soajs.dashboard.ui'
};

function updateConfigFile(workingDirectory, cb) {
	installerConfig.workingDirectory = workingDirectory;
	let newData = "'use strict';\n\n";
	newData += "module.exports = " + JSON.stringify(installerConfig, null, 2) + ";\n";
	fs.writeFile(path.normalize(process.env.PWD + "/../etc/config.js"), newData, cb);
}

function installConsoleComponents(cb) {
	let myPath = installerConfig.workingDirectory + "/node_modules/";
	fs.stat(myPath, (error, stats) => {
		if (error) {
			if (error.code === 'ENOENT' && !stats) {
				//if not found create the directories needed recursively
				mkdirp(myPath, runNPM);
			}
			else {
				return cb(error);
			}
		}
		else {
			runNPM();
		}
	});
	
	//install repos in component
	function runNPM() {
		logger.debug("\nInstalling SOAJS Console Components ...");
		process.argv = [installerConfig.workingDirectory];
		npm.load({prefix: installerConfig.workingDirectory}, (err) => {
			if (err) {
				return cb(err);
			}
			
			async.eachOfSeries(SOAJS_RMS, (oneRepo, oneService, mCb) => {
				
				logger.debug(`Installing ${oneService} from NPM ${oneRepo} ...`);
				npm.commands.install([oneRepo], (error) => {
					if (error) {
						return mCb(error);
					}
					
					logger.debug(`${oneService} installed!`);
					setTimeout(() => {
						return mCb(null, true);
					}, 500);
				});
			}, (error) => {
				if (error) {
					return cb(error);
				}
				
				return cb(null, true);
			});
		});
	}
}

const consoleModule = {
	
	/**
	 * This function configures and starts mongodb server stand alone
	 * then it patches the provisioned data in mongdb server
	 * then it installs all of SOAJS Console components
	 * then it starts all the SOAJS Console components
	 * @param args
	 * @param callback
	 */
	'install': (args, callback) => {
		if (args.length === 0) {
			return callback("Please provide where you want to install the SOAJS Console. Ex: soajs console install %folder_path%");
		}
		
		//clean up the path ...
		if (args[0].includes("node_modules")) {
			let myPath = args[0].split(path.sep);
			if (myPath[myPath.length - 1] === 'node_modules') {
				myPath.pop();
				myPath = myPath.join(path.sep);
				args[0] = myPath;
			}
		}
		
		logger.debug(`Checking provided path: ${args[0]} ...`);
		fs.stat(args[0], (error, stats) => {
			if (error) {
				if (error.code === 'ENOENT' && !stats) {
					//create the working directory
					mkdirp(path.normalize(args[0] + "/node_modules/"), (error) => {
						if (error) {
							return callback("Unable to work in provided folder path (might be permissions): " + args[0]);
						}
						updateConfiguration();
					});
				}
				else {
					return callback(error);
				}
			}
			else {
				updateConfiguration();
			}
		});
		
		function updateConfiguration() {
			logger.debug(`Configuring installer ...`);
			
			//update the configuration file
			installerConfig.workingDirectory = args[0];
			updateConfigFile(args[0], (error) => {
				if (error) {
					return callback("Unable to update Installer configuration file, please try again!");
				}
				
				//install and start mongo
				launchMongo();
			});
		}
		
		function launchMongo() {
			logger.debug(`Configuring MongoDB Server ...`);
			mongoModule.install([], (error, response) => {
				if (error) {
					return callback(error);
				}
				
				logger.debug(response);
				setTimeout(() => {
					logger.debug(`Starting MongoDB Server ...`);
					mongoModule.start([], (error, response) => {
						if (error) {
							return callback(error);
						}
						
						logger.debug(response);
						setTimeout(() => {
							
							logger.debug(`Importing Data in MongoDB Server ...`);
							mongoModule.patch([], (error, response) => {
								if (error) {
									return callback(error);
								}
								
								logger.debug(response);
								installSOAJSConsole();
							});
						}, 1000);
					});
				}, 100);
			});
		}
		
		function installSOAJSConsole() {
			logger.debug(`Installing SOAJS Console ...`);
			//install all repository content
			installConsoleComponents((error) => {
				if (error) {
					return callback("Error while isntalling the SOAJS Console files!")
				}
				
				//start microservices
				consoleModule.start(args, (error) => {
					if (error) {
						return callback("Unable to Start the SOAJS Console!");
					}
					
					return callback(null, "SOAJS Console Started!");
				});
			});
		}
	},
	
	/**
	 * This function will stop all the services of SOAJS Console
	 * it will then run npm install in the working directory to update all the microservices repos related
	 * then it will start the services of SOAJS Console again
	 * @param args
	 * @param callback
	 */
	'update': (args, callback) => {
		logger.info("Updating SOAJS Console ...\n\n");
		setTimeout(() => {
			//stop microservices
			consoleModule.stop(args, (error) => {
				if (error) {
					return callback("Unable to Stop the SOAJS Console!");
				}
				
				//update all repository content
				installConsoleComponents((error) => {
					if (error) {
						return callback("Error while updating the SOAJS Console files!")
					}
					
					//start microservices
					consoleModule.start(args, (error) => {
						if (error) {
							return callback("Unable to Restart the SOAJS Console!");
						}
						
						return callback(null, "SOAJS Console Updated!");
					});
				});
			});
		}, 2000);
	},
	
	/**
	 * This function will stop all services of SOAJS Console
	 * it will also stop mongodb and clean up all SOAJS data from the database
	 * Then it will remove all the installed files and folders of SOAJS Console (PURGE Everything)
	 * @param args
	 * @param callback
	 */
	'remove': (args, callback) => {
		logger.info("Removing SOAJS Console ...\n\n");
		setTimeout(() => {
			//stop microservices
			consoleModule.stop(args, (error) => {
				if (error) {
					return callback("Unable to Stop the SOAJS Console!");
				}
				
				const mongoModule = require("./mongo.js");
				logger.info("Cleaning up Mongo and stopping it ...");
				setTimeout(() => {
					//remove data from mongodb
					mongoModule.clean([], (error) => {
						if (error && !error.message.includes("failed to connect to server")) {
							return callback("Error while Cleaning provisioned data from mongo!");
						}
						//stop mongodb
						mongoModule.stop([], (error) => {
							if (error) {
								return callback("Error while Stopping MongoDB Server!");
							}
							
							logger.info("Cleaning up downloaded SOAJS Console ...");
							setTimeout(() => {
								//remove folders of microservices
								async.eachOfSeries(SOAJS_RMS, (oneRepo, oneService, mCb) => {
									logger.debug(`Removing ${oneService} files ...`);
									logger.debug(path.normalize(installerConfig.workingDirectory + "/node_modules/" + SOAJS_RMS[oneService]) + "\n");
									rimraf(path.normalize(installerConfig.workingDirectory + "/node_modules/" + SOAJS_RMS[oneService]), (error) => {
										if (error) {
											return mCb(error);
										}
										logger.debug(`${oneService} --> ${oneRepo}: Removed!`);
										return mCb();
									});
								}, (error) => {
									if (error) {
										return callback("Error Cleaning up SOAJS Console ...");
									}
									
									//remove working directory
									rimraf(path.normalize(installerConfig.workingDirectory), () => {
										
										//clean up the configuration file
										updateConfigFile('', (error) => {
											logger.info("=========================\nSOAJS Console Removed!\n=========================\n\n");
											setTimeout(() => {
												return callback();
											}, 1000);
										});
									});
								});
								
							}, 2000);
						});
					});
				}, 2000);
			});
			
		}, 2000);
	},
	
	/**
	 * This function restarts all the services of the SOAJS Console
	 * @param args
	 * @param callback
	 */
	'restart': (args, callback) => {
		logger.info("Restarting SOAJS Console ...\n\n");
		setTimeout(() => {
			consoleModule.stop(args, (error) => {
				if (error) {
					return callback("Unable to Stop the SOAJS Console!");
				}
				
				consoleModule.start(args, (error) => {
					if (error) {
						return callback("Unable to Restart the SOAJS Console!");
					}
					
					return callback(null, "SOAJS Console Restarted!");
				});
			});
		}, 2000);
	},
	
	/**
	 * This command will calculate the needed env variables and
	 * start all the microservices in dashboard environment that the soajs console requires
	 * @param args {Array}
	 * @param callback {Function}
	 */
	'start': (args, callback) => {
		let requestedEnvironment = 'dashboard';
		
		//check if service is installed and downloaded
		if (!installerConfig.workingDirectory || installerConfig.workingDirectory === '') {
			return callback(`SOAJS Console is not installed!`);
		}
		
		logger.debug("Checking MongoDB Server ....");
		mongoModule.start([], (error, response) => {
			if (error) {
				return callback(error);
			}
			
			logger.info("Starting Microservices for SOAJS Console in Dashboard Environment ... \n");
			setTimeout(() => {
				async.eachOfSeries(SOAJS_RMS, (oneRepo, oneService, mCb) => {
					launchMyService(oneService, (error, response) => {
						if (error) {
							return mCb(error);
						}
						
						if (response && response !== '') {
							logger.debug(response + "\n");
						}
						return mCb(null, true);
					});
				}, (error) => {
					if (error) {
						return callback("Error starting the SOAJS Console");
					}
					
					logger.info("=========================\nSOAJS Console started!\n=========================\n\n");
					setTimeout(() => {
						return callback();
					}, 1000);
				});
			}, 1000);
		});
		
		function launchMyService(oneService, mCb) {
			serviceModule.start([oneService, "--env=" + requestedEnvironment], mCb)
		}
	},
	
	/**
	 * This command will find the process id of all microservices that the soajs console is using and kill them
	 * @param args
	 * @param callback
	 * @returns {*}
	 */
	'stop': (args, callback) => {
		let requestedEnvironment = 'dashboard';
		
		//check if service is installed and downloaded
		if (!installerConfig.workingDirectory || installerConfig.workingDirectory === '') {
			return callback(`SOAJS Console is not installed!`);
		}
		
		logger.info("Stopping Microservices for SOAJS Console in Dashboard Environment ... \n");
		setTimeout(() => {
			async.eachOfSeries(SOAJS_RMS, (oneRepo, oneService, mCb) => {
				launchMyService(oneService, (error, response) => {
					if (error) {
						return mCb(error);
					}
					
					if (response && response !== '') {
						logger.debug(response + "\n");
					}
					
					return mCb(null, true);
				});
			}, (error) => {
				if (error) {
					return callback("Error stop the SOAJS Console");
				}
				
				logger.info("=========================\nSOAJS Console Stopped!\n=========================\n\n");
				setTimeout(() => {
					return callback();
				}, 1000);
			});
			
		}, 1000);
		
		function launchMyService(oneService, mCb) {
			serviceModule.stop([oneService, "--env=" + requestedEnvironment], mCb)
		}
	}
};

module.exports = consoleModule;