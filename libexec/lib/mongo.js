'use strict';
const path = require("path");
const fs = require("fs");
const spawn = require("child_process").spawn;
const exec = require("child_process").exec;
const YAML = require("yamljs");
let Mongo = require("soajs.core.modules").mongo;
const async = require('async');

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
		if (!Array.isArray(args) || args.length === 0) {
			return callback(null, "Missing port value!");
		}
		if (args.length > 1) {
			args.shift();
			return callback(null, `Unidentified input ${args.join(" ")}. Please use soajs mongo setPort %number%.`);
		}
		let portNumber;
		
		// check if port is number
		try {
			portNumber = parseInt(args[0]);
			if (typeof portNumber !== "number" || isNaN(portNumber)) {
				return callback(null, `Port value should be of type number...`);
			}
		}
		catch (e) {
			return callback(null, `Port value should be of type number...`);
		}
		let mongoDbConf = path.normalize(process.env.PWD + "/../include/" + process.env.MONGO_LOCATION + "/mongod.conf");
		
		//check if mongo.conf exists
		fs.stat(mongoDbConf, (error) => {
			if (error) {
				return callback(null, 'MongoDB configuration file not found. Run [soajs mongo install] to create one.');
			}
			let mongoConf;
			
			//read mongo.conf file
			fs.readFile(mongoDbConf, 'utf8', function read(err, data) {
				if (err) {
					return callback(null, 'MongoDB configuration file not found. Run [soajs mongo install] to create one.');
				}
				try {
					//transform yaml file to json
					mongoConf = YAML.parse(data);
				}
				catch (e) {
					return callback(null, `Malformed ${mongoDbConf}!`);
				}
				//change port value
				if (mongoConf.net && mongoConf.net.port) {
					mongoConf.net.port = portNumber;
				}
				//change data back yaml
				let yamlFile = YAML.stringify(mongoConf, 4);
				
				//write the file back
				fs.writeFile(mongoDbConf, yamlFile, (error) => {
					if (error) {
						return callback(error);
					}
					//call command to change the port
					let profileModule = require("./profile");
					profileModule.setPort(args, callback);
				});
			});
		});
	},
	clean: (args, callback) => {
		let profilePath = path.normalize(process.env.PWD + "/../data/soajs_profile.js");
		fs.stat(profilePath, (error) => {
			if (error) {
				return callback(null, 'Profile not found!');
			}
			
			//read  mongo profile file
			let profile = require(profilePath);
			let mongoConnection = new Mongo(profile);
			mongoConnection.dropDatabase((err) => {
				if (err) {
					return callback(err);
				}
				else {
					mongoConnection.closeDb();
					profile.name = "DBTN_urac";
					mongoConnection = new Mongo(profile);
					mongoConnection.dropDatabase((err) => {
						if (err) {
							return callback(err);
						}
						else {
							mongoConnection.closeDb();
							return callback(null, "MongoDB SOAJS data has been removed...")
						}
					});
				}
			});
		});
	},
	patch: (args, callback) => {
		let profilePath = path.normalize(process.env.PWD + "/../data/soajs_profile.js");
		fs.stat(profilePath, (error) => {
			if (error) {
				return callback(null, 'Profile not found!');
			}
			
			//read  mongo profile file
			let profile = require(profilePath);
			let mongoConnection = new Mongo(profile);
			let dataPath = path.normalize(process.env.PWD + "/../data/provision/");
			mongoConnection.dropDatabase((error) => {
				if (error) {
					return callback(error);
				}
				
				lib.provision(dataPath, mongoConnection, (error) => {
					if (error) {
						return callback(error);
					}
					mongoConnection.closeDb();
					profile.name = "DBTN_urac";
					mongoConnection = new Mongo(profile);
					mongoConnection.dropDatabase((error) => {
						if (error) {
							return callback(error);
						}
						lib.urac(dataPath, mongoConnection, (error) => {
							if (error) {
								return callback(error);
							}
							mongoConnection.closeDb();
							return callback(null, "MongoDb Soajs Data Patched!")
						});
					});
				});
			});
		});
		
		const lib = {
			"provision": function (dataFolder, mongo, cb) {
				async.series({
					"env": function (mCb) {
						let record = require(dataFolder + "environments/dashboard.js");
						record._id = mongo.ObjectId(record._id);
						mongo.insert("environment", record, mCb);
					},
					
					"mongo": function (mCb) {
						let record = require(dataFolder + "resources/mongo.js");
						record._id = mongo.ObjectId(record._id);
						mongo.insert("resources", record, mCb);
					},
					
					"templates": function (mCb) {
						let templates = require(dataFolder + "environments/templates.js");
						mongo.insert("templates", templates, mCb);
					},
					
					"addProducts": function (mCb) {
						let record = require(dataFolder + "products/dsbrd.js");
						record._id = mongo.ObjectId(record._id);
						mongo.insert("products", record, mCb);
					},
					
					"addServices": function (mCb) {
						let record = require(dataFolder + "services/index.js");
						mongo.insert("services", record, mCb);
					},
					
					"addTenants": function (mCb) {
						async.series([
							function (mCb) {
								let record = require(dataFolder + "tenants/owner.js");
								
								record._id = mongo.ObjectId(record._id);
								record.applications.forEach(function (oneApp) {
									oneApp.appId = mongo.ObjectId(oneApp.appId);
								});
								
								mongo.insert("tenants", record, mCb);
							},
							function (mCb) {
								let record = require(dataFolder + "tenants/techop.js");
								
								record._id = mongo.ObjectId(record._id);
								record.applications.forEach(function (oneApp) {
									oneApp.appId = mongo.ObjectId(oneApp.appId);
								});
								
								mongo.insert("tenants", record, mCb);
							},
						], mCb);
					},
					
					"addGitAccounts": function (mCb) {
						let record = require(dataFolder + "gitAccounts/soajsRepos.js");
						record._id = mongo.ObjectId(record._id);
						mongo.insert("git_accounts", record, mCb);
					},
					
					"addCatalogs": function (mCb) {
						let options =
							{
								col: 'catalogs',
								index: {name: 1},
								options: {unique: true}
							};
						
						mongo.createIndex(options.col, options.index, options.options, function (error) {
							;
							let records = require(dataFolder + "catalogs/index.js");
							mongo.insert("catalogs", records, mCb);
						});
						
					},
				}, cb);
			},
			
			"urac": function (dataFolder, mongo, mCb) {
				async.series({
					"addUsers": function (cb) {
						let record = require(dataFolder + "urac/users/owner.js");
						mongo.insert("users", record, cb);
					},
					
					"addGroups": function (cb) {
						let record = require(dataFolder + "urac/groups/owner.js");
						mongo.insert("groups", record, cb);
					},
					
					"uracIndex": function (cb) {
						let indexes = [
							{
								col: 'users',
								index: {username: 1},
								options: {unique: true}
							},
							{
								col: 'users',
								index: {email: 1},
								options: {unique: true}
							},
							{
								col: 'users',
								index: {username: 1, status: 1},
								options: null
							},
							{
								col: 'users',
								index: {email: 1, status: 1},
								options: null
							},
							{
								col: 'users',
								index: {groups: 1, 'tenant.id': 1},
								options: null
							},
							{
								col: 'users',
								index: {username: 1, 'tenant.id': 1},
								options: null
							},
							{
								col: 'users',
								index: {status: 1},
								options: null
							},
							{
								col: 'users',
								index: {locked: 1},
								options: null
							},
							{
								col: 'users',
								index: {'tenant.id': 1},
								options: null
							},
							{
								col: 'groups',
								index: {code: 1, 'tenant.id': 1},
								options: null
							},
							{
								col: 'groups',
								index: {code: 1},
								options: null
							},
							{
								col: 'groups',
								index: {'tenant.id': 1},
								options: null
							},
							{
								col: 'groups',
								index: {locked: 1},
								options: null
							},
							{
								col: 'tokens',
								index: {token: 1},
								options: {unique: true}
							},
							{
								col: 'tokens',
								index: {userId: 1, service: 1, status: 1},
								options: null
							},
							{
								col: 'tokens',
								index: {token: 1, service: 1, status: 1},
								options: null
							}
						];
						
						async.each(indexes, function (oneIndex, callback) {
							mongo.createIndex(oneIndex.col, oneIndex.index, oneIndex.options, callback);
						}, cb);
					}
				}, mCb);
			}
		};
	}
};

module.exports = mongoModule;
