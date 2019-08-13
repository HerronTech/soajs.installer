'use strict';
const path = require("path");
const fs = require("fs");
const spawn = require("child_process").spawn;
const exec = require("child_process").exec;
const YAML = require("yamljs");
const mkdirp = require("mkdirp");
let Mongo = require("soajs").mongo;
const async = require('async');

function ifNotSudo(callback) {
    if (process.env.PLATFORM === 'Linux' && process.env.LOGNAME !== 'root') {
        let output = "This command requires you run it as Root!\n";
        return callback(output);
    }
    else if (process.env.PLATFORM === 'Darwin' && process.env.LOGNAME !== 'root') {
        let output = "This command requires you run it as: sudo soajs mongo " + process.env.SOAJS_INSTALLER_COMMAND;
        return callback(output);
    }
}

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

        //set mongo db data and log folder depending on platform
        if (process.env.PLATFORM === 'Darwin') {
            config.systemLog.path = "/usr/local/var/log/soajs/mongodb/mongo.log";
            config.storage.dbPath = "/usr/local/var/soajs/mongodb";
            logPath = '/usr/local/var/log/soajs/mongodb/';
        }
        else if (process.env.PLATFORM === 'Linux') {
            config.systemLog.path = "/var/log/soajs/mongodb/mongo.log";
            config.storage.dbPath = "/var/soajs/mongodb";
            logPath = '/var/log/soajs/mongodb';
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
                    mkdirp(path, cb);
                }
                else {
                    cb();
                }
            });
        }
    },

    /**
     * Start mongoDB server
     * @param args
     * @param callback
     */
    start: (args, callback) => {

        ifNotSudo(callback);

        let mongoDbConf = path.normalize(process.env.PWD + "/../include/" + process.env.MONGO_LOCATION + "/mongod.conf");

        //check ig mongo.conf is found
        fs.stat(mongoDbConf, (error) => {
            if (error) {
                return callback(null, `MongoDB configuration file not found. Run [soajs mongo install] to create one.`)
            }
            let mongoPath = process.env.PWD + "/../include/" + process.env.MONGO_LOCATION + "/bin/mongod";
            const startMongo = spawn("sudo", [mongoPath, `--config=${mongoDbConf}`],
                {
                    detached: true,
                    "stdio": ['ignore', 'ignore', 'ignore']
                });
            startMongo.unref();

            let mongoJSONConfig = YAML.load(mongoDbConf);
            callback(null, `MongoDB Started and is listening on ${mongoJSONConfig.net.bindIp}, port: ${mongoJSONConfig.net.port}`);
        });
    },

    /**
     * Stop mongoDB server
     * @param args
     * @param callback
     */
    stop: (args, callback) => {
        let mongoDbConf = path.normalize(process.env.PWD + "/../include/" + process.env.MONGO_LOCATION);

        //check if there is a running process for the requested
        exec(`ps aux | grep ${mongoDbConf}`, (error, cmdOutput) => {
            if (error || !cmdOutput) {
                return callback();
            }

            //go through the returned output and find the process ID
            cmdOutput = cmdOutput.split("\n");

            if (Array.isArray(cmdOutput) && cmdOutput.length > 0) {
                let PID = null;
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
                exec(`sudo kill -9 ${PID}`, (error) => {
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

    /**
     * Restart mongoDB server
     * @param args
     * @param callback
     */
    restart: (args, callback) => {

        //stop mongodb
        mongoModule.stop(args, (err) => {
            if (err) {
                return callback(err);
            }

            setTimeout(() => {
                //start mongodb
                mongoModule.start(args, callback);
            }, 1000);
        });
    },

    /**
     * Set port for mongoDB
     * change value in profile
     * change value in mongo.conf
     * @param args
     * @param callback
     * @returns {*}
     */
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

    /**
     * Clean all soajs data from mongo
     * core_provision && DBTN_urac are dropped
     * @param args
     * @param callback
     */
    clean: (args, callback) => {
        //get profile path
        let profilePath = path.normalize(process.env.PWD + "/../data/soajs_profile.js");

        //check if profile is found
        fs.stat(profilePath, (error) => {
            if (error) {
                return callback(null, 'Profile not found!');
            }

            //read  mongo profile file
            let profile = require(profilePath);

            //use soajs.core.modules to create a connection to core_provision database
            let mongoConnection = new Mongo(profile);

            //drop core_provision database
            mongoConnection.dropDatabase((err) => {
                if (err) {
                    return callback(err);
                }
                else {
                    //close mongo connection
                    mongoConnection.closeDb();

                    //switch profile DBTN_urac
                    profile.name = "DBTN_urac";

                    //use soajs.core.modules to create a connection to DBTN_urac database
                    mongoConnection = new Mongo(profile);

                    //drop DBTN_urac database
                    mongoConnection.dropDatabase((err) => {
                        if (err) {
                            return callback(err);
                        }
                        else {
                            //close mongo connection
                            mongoConnection.closeDb();
                            return callback(null, "MongoDB SOAJS data has been removed...")
                        }
                    });
                }
            });
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
            return callback(null, `Unidentified input ${args.join(" ")}. Please use soajs mongo migrate %strategy%.`);
        }

        // check if strategy is available
        let strategy = args[0];
        if (strategies.indexOf(strategy) === -1) {
            return callback(null, `Select one of the following strategies: ${strategies.join(" ")}.`);
        }
        let strategyFunction = require("../migrate/" + strategy + ".js");
        let profilePath = path.normalize(process.env.PWD + "/../data/soajs_profile.js");
        let dataPath = path.normalize(process.env.PWD + "/../data/provision/");
        return strategyFunction(profilePath, dataPath, callback);
    },

    custom: (args, callback) => {
        if (!Array.isArray(args) || args.length === 0) {
            return callback(null, "Missing custom folder!");
        }
        if (args.length > 2) {
            args.shift();
            return callback(null, `Unidentified input ${args.join(" ")}. Please use soajs mongo custom %folder% [--clean].`);
        }
        if (args[0].charAt(0) !== '/') {
            return callback("Invalid custom folder; please provide an absolute custom folder path. Ex: sudo soajs mongo custom /%folder% [--clean].");
        }
        let cleanDataBefore = false;
        if (args.length === 2) {
            if (args[1] === "--clean") {
                cleanDataBefore = true;
            }
            else{
                args.shift();
                return callback(null, `Unidentified input ${args.join(" ")}. Please use soajs mongo custom %folder% [--clean].`);
            }
        }

        let dataPath = args[0];
        if (dataPath.charAt(dataPath.length - 1) !== '/')
            dataPath = dataPath + '/';

        if (fs.existsSync(dataPath)) {
            let profilePath = path.normalize(process.env.PWD + "/../data/soajs_profile.js");
            let mongoCustom = require("../custom/index.js");
            return mongoCustom(profilePath, dataPath, cleanDataBefore, callback);
        }
        else {
            return callback(null, `Custom folder [folder] not found!`);
        }
    },

    /**
     * Replace soajs provision data with a fresh new copy
     * @param args
     * @param callback
     */
    patch: (args, callback) => {

        let installerConfig = path.normalize(process.env.PWD + "/../etc/config.js");
        let workingDirectory = installerConfig.workingDirectory;

        //get profile path
        let profilePath = path.normalize(process.env.PWD + "/../data/soajs_profile.js");
        let profile;

        //check if profile is found
        fs.stat(profilePath, (error) => {
            if (error) {
                return callback(null, 'Profile not found!');
            }

            //read  mongo profile file
            profile = require(profilePath);

            //use soajs.core.modules to create a connection to core_provision database
            let mongoConnection = new Mongo(profile);
            let dataPath = path.normalize(process.env.PWD + "/../data/provision/");

            //drop old core_provision database
            mongoConnection.dropDatabase((error) => {
                if (error) {
                    return callback(error);
                }

                //insert core provision data asynchronous in series
                lib.provision(dataPath, mongoConnection, (error) => {
                    if (error) {
                        return callback(error);
                    }
                    //close mongo connection
                    mongoConnection.closeDb();

                    //switch profile DBTN_urac
                    profile.name = "DBTN_urac";

                    //use soajs.core.modules to create a connection to DBTN_urac database
                    mongoConnection = new Mongo(profile);

                    //drop old DBTN_urac database
                    mongoConnection.dropDatabase((error) => {
                        if (error) {
                            return callback(error);
                        }
                        //insert urac data asynchronous in series
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

        //each function require the data file inside /data/provison
        //add mongo id and insert it to the database
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

                        //attach the profile as the dash_cluster record configuration
                        record.config = profile;
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
                        let record = require(dataFolder + "tenants/guest.js");
                        record._id = mongo.ObjectId(record._id);
                        record.applications.forEach(function (oneApp) {
                            oneApp.appId = mongo.ObjectId(oneApp.appId);
                            oneApp.keys.forEach((oneKey) => {
                                for (let operation in oneKey.config.dashboard.urac.mail) {
                                    oneKey.config.dashboard.urac.mail[operation].path = oneKey.config.dashboard.urac.mail[operation].path.replace("%wrkDir%", workingDirectory);
                                }
                            });
                        });
                        mongo.insert("tenants", record, mCb);
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
                                index: {username: 1, email: 1, status: 1},
                                options: null
                            },
                            {
                                col: 'users',
                                index: {username: 1, email: 1, firstName: 1, lastName: 1},
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
                                index: {'tenant.id': 1},
                                options: null
                            },
                            {
                                col: 'users',
                                index: {'tenant.code': 1},
                                options: null
                            },


                            {
                                col: 'users',
                                index: {
                                    'config.allowedTenants.tenant.id': 1,
                                    'config.allowedTenants.tenant.pin.code': 1
                                },
                                options: {unique: true, sparse: true}
                            },

                            {
                                col: 'users',
                                index: {status: 1},
                                options: null
                            },
                            {
                                col: 'users',
                                index: {_id: 1, status: 1},
                                options: null
                            },
                            {
                                col: 'users',
                                index: {locked: 1},
                                options: null
                            },

                            {
                                col: 'groups',
                                index: {code: 1, 'tenant.id': 1},
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
