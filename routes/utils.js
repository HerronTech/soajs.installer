"use strict";
var os = require("os");
var fs = require("fs");
var path = require("path");
var soajs = require("soajs");
var request = require("request");

var whereis = require('whereis');

//external libs
var ncp = require("ncp");
var rimraf = require("rimraf");
var async = require("async");

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
                try {
                    delete require.cache[require.resolve(dataDir + "custom.js")];
                    var customData = require(dataDir + "custom.js");
                    if (section) {
                        return cb(customData[section]);
                    }
                    else {
                        return cb(customData);
                    }
                }
                catch (e){
                    console.log(e);
                    return cb(null);
                }
            }
        });
    },

    "generateExtKeys": function (opts, cb) {
        //soajs encryption engine
        var module = require("soajs").core.key;
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
        var deployment = JSON.parse(JSON.stringify (body.deployment));
	    delete clusters.prefix;
	    
        //fix clusters credentials
        if (clusters.credentials.username === "") {
            clusters.credentials = {};
            delete clusters.URLParam.authSource;
        }

        if (clusters.servers[0].host.indexOf("https") !== -1) {
            clusters.URLParam.ssl = true;
            body.clusters.URLParam.ssl = true;
        }

        if (clusters.replicaSet) {
            clusters.URLParam.replicaSet = clusters.replicaSet;
            clusters.URLParam.readPreference = "secondaryPreferred";
            clusters.URLParam.w = "majority";
            clusters.URLParam.ha = true;

            if (!clusters.extraParam.replSet) {
                clusters.extraParam.replSet = {};
            }
            clusters.extraParam.replSet.ha = true;
        }

        //generate profile
        var profileData = '"use strict";' + os.EOL;
        clusters.name = "core_provision";
        clusters.prefix = body.clusters.prefix || "";
        var mongoExt = clusters.mongoExt;
        if (!mongoExt) {
            if (body.deployment.deployDriver.indexOf("container.docker") !== -1) {
                clusters.servers = [
                    {
                        host: "dashboard-soajsdata",
                        port: 27017
                    }
                ];
            }
            if (body.deployment.deployDriver.indexOf("container.kubernetes") !== -1) {
                //build mongo service with based on namespace
                var namespace = (deployment && deployment.namespaces && deployment.namespaces.default) ? deployment.namespaces.default : 'default';
                if (deployment && deployment.namespaces && deployment.namespaces.perService) {
                    namespace += '-dashboard-soajsdata';
                }
                clusters.servers = [
                    {
                        host: "dashboard-soajsdata." + namespace,
                        port: 5000 + 27017
                    }
                ];
            }
        }
        delete clusters.replicaSet;
        delete clusters.mongoExt;
        profileData += 'module.exports = ' + JSON.stringify(clusters, null, 2) + ';';
        fs.writeFileSync(folder + "profile.js", profileData, "utf8");

        if (body.deployment.deployDriver.indexOf("kubernetes") !== -1 && !mongoExt) {
            clusters.servers[0].port = 27017;
        }

        delete clusters.name;
        delete clusters.prefix;

        //modify users file
        var userData = fs.readFileSync(folder + "urac/users/owner.js", "utf8");
        userData = userData.replace(/%username%/g, body.gi.username);
        userData = userData.replace(/%email%/g, body.gi.email);

        var Hasher = soajs.hasher;
        Hasher.init({
            "hashIterations": 1024,
            "seedLength": 32
        });
        var hashedPwd = Hasher.hash(body.gi.password);
        userData = userData.replace(/%password%/g, hashedPwd);
        fs.writeFile(folder + "urac/users/owner.js", userData, "utf8");

        if (body.deployment.deployType === 'manual' || body.deployment.deployDriver.indexOf("local") !== -1) {
            body.deployment.deployDockerNodes = [];
        }
        
        if(body.deployment.deployType === 'container'){
        	body.gi.wrkDir = "/opt";
        }

        //modify environments file
        var envData = fs.readFileSync(folder + "environments/dashboard.js", "utf8");
	    
        envData = envData.replace(/%domain%/g, body.gi.domain);
        envData = envData.replace(/%site%/g, body.gi.site);
        envData = envData.replace(/%api%/g, body.gi.api);
        if(body.deployment.deployType === 'manual'){
            envData = envData.replace(/%wrkDir%/g, body.gi.wrkDir);
	        envData = envData.replace(/"apiPort": "%dockerLocalPort%",/g,'');
	        envData = envData.replace(/"apiPort": "%dockerRemotePort%",/g,'');
	        envData = envData.replace(/"apiPort": "%kubernetesLocalPort%",/g,'');
	        envData = envData.replace(/"apiPort": "%kubernetesRemotePort%",/g,'');
        }
        else{
            envData = envData.replace(/%wrkDir%/g, "/opt");
        }
        envData = envData.replace(/%deployType%/g, body.deployment.deployType);
        envData = envData.replace(/%deployDriver%/g, body.deployment.deployDriver);
        envData = envData.replace(/%deployDockerNodes%/g, body.deployment.deployDockerNodes);
        envData = envData.replace(/%clusterPrefix%/g, body.clusters.prefix);
        
        var mongoCluster = fs.readFileSync(folder + "resources/mongo.js", "utf8");
	    mongoCluster = mongoCluster.replace(/"%clusters%"/g, JSON.stringify(clusters, null, 2));
		fs.writeFile(folder + "resources/mongo.js", mongoCluster, "utf8");
	    
        envData = envData.replace(/%keySecret%/g, body.security.key);
        envData = envData.replace(/%sessionSecret%/g, body.security.session);
        envData = envData.replace(/%cookieSecret%/g, body.security.cookie);
        if (body.deployment.deployDriver.split('.')[1] === 'kubernetes') {
            envData = envData.replace(/%nginxDeployType%/g, body.deployment.nginxDeployType);
            envData = envData.replace(/"%namespace%"/g, JSON.stringify (body.deployment.namespaces, null, 2));
            envData = envData.replace(/%token%/g, body.deployment.authentication.accessToken);
	        if (body.deployment.deployDriver.split('.')[2] === 'local'){
		        envData = envData.replace(/"apiPort": "%dockerLocalPort%",/g, '');
		        envData = envData.replace(/"apiPort": "%dockerRemotePort%",/g,'');
		        envData = envData.replace(/"%kubernetesLocalPort%"/g, body.deployment.kubernetes.containerPort);
		        envData = envData.replace(/"apiPort": "%kubernetesRemotePort%",/g,'');
	        }
	        else {
		        envData = envData.replace(/"apiPort": "%dockerLocalPort%",/g, '');
		        envData = envData.replace(/"apiPort": "%dockerRemotePort%",/g,'');
		        envData = envData.replace(/"apiPort": "%kubernetesLocalPort%",/g, '');
		        envData = envData.replace(/"%kubernetesRemotePort%"/g, body.deployment.kubernetes.containerPort);
	        }
        }
        else {
            envData = envData.replace(/%nginxDeployType%/g, '');
            envData = envData.replace(/"%namespace%"/g, JSON.stringify ({}, null, 2));
            envData = envData.replace(/%token%/g, '');
	       
	        if (body.deployment.deployDriver.split('.')[2] === 'local'){
		        envData = envData.replace(/"%dockerLocalPort%"/g, body.deployment.docker.containerPort);
		        envData = envData.replace(/"apiPort": "%dockerRemotePort%",/g,'');
		        envData = envData.replace(/"apiPort": "%kubernetesLocalPort%",/g,'');
		        envData = envData.replace(/"apiPort": "%kubernetesRemotePort%",/g,'');
	        }
	        else {
		        envData = envData.replace(/"apiPort": "%dockerLocalPort%",/g, '');
		        envData = envData.replace(/"%dockerRemotePort%"/g, body.deployment.docker.containerPort);
		        envData = envData.replace(/"apiPort": "%kubernetesLocalPort%",/g,'');
		        envData = envData.replace(/"apiPort": "%kubernetesRemotePort%",/g,'');
	        }
        }
        fs.writeFile(folder + "environments/dashboard.js", envData, "utf8");

        //modify tenants file
	    let protocol = "http";
	    let port = body.deployment.nginxPort;
	    
	    if(body.deployment.nginxSsl){
	    	protocol = "https";
	    	port = body.deployment.nginxSecurePort;
	    }
	    
        var tntData = fs.readFileSync(folder + "tenants/owner.js", "utf8");
        tntData = tntData.replace(/%protocol%/g, protocol);
        tntData = tntData.replace(/%port%/g, port);
        tntData = tntData.replace(/%email%/g, body.gi.email);
        tntData = tntData.replace(/%site%/g, body.gi.site);
        tntData = tntData.replace(/%domain%/g, body.gi.domain);
        tntData = tntData.replace(/%wrkDir%/g, body.gi.wrkDir);
        tntData = tntData.replace(/%extKey1%/g, body.security.extKey1);
        tntData = tntData.replace(/%extKey2%/g, body.security.extKey2);
        fs.writeFile(folder + "tenants/owner.js", tntData, "utf8");
	
	    var tntData = fs.readFileSync(folder + "tenants/techop.js", "utf8");
	    tntData = tntData.replace(/%protocol%/g, protocol);
	    tntData = tntData.replace(/%port%/g, port);
	    tntData = tntData.replace(/%email%/g, body.gi.email);
	    tntData = tntData.replace(/%site%/g, body.gi.site);
	    tntData = tntData.replace(/%domain%/g, body.gi.domain);
	    tntData = tntData.replace(/%wrkDir%/g, body.gi.wrkDir);
	    tntData = tntData.replace(/%extKey3%/g, body.security.extKey3);
	    fs.writeFile(folder + "tenants/techop.js", tntData, "utf8");

        //remove unneeded file
        fs.unlinkSync(folder + "tenants/info.js");
    },

    "unifyData": function (def, over) {
        if (over.gi) {
            for (var i in def.gi) {
                if (over.gi[i] && over.gi[i] !== "") {
                    def.gi[i] = over.gi[i];
                }
            }
        }

        if (over.security) {
            for (var i in def.security) {
                if (over.security[i] && over.security[i] !== "") {
                    def.security[i] = over.security[i];
                }
            }
        }

        if (over.deployment) {
            for (var i in def.deployment) {
                if (over.deployment[i]) {
                    def.deployment[i] = over.deployment[i];
                }
            }

            for (var j in over.deployment) {
                def.deployment[j] = over.deployment[j];
            }
        }

        if (over.clusters) {
            for (var j in over.clusters) {
                def.clusters[j] = over.clusters[j];
            }
        }
        return def;
    },

    "deployManual": function (body, cb) {
        body.gi.wrkDir = path.normalize(body.gi.wrkDir);
        //launch deployer
        whereis('node', function (err, nodePath) {
            if (err) {
                return cb(err);
            }
            whereis("npm", function (err, npmPath) {
                if (err) {
                    return cb(err);
                }

                var filename = path.normalize(__dirname + "/../scripts/manual-deploy.sh");
                var output = "#!/bin/bash" + os.EOL + os.EOL;
                var envs = {
                    "NODE_PATH": nodePath,
                    "NPM_PATH": npmPath,
                    "DEPLOY_FROM": process.env.DEPLOY_FROM || "NPM",
                    "SOAJS_GIT_DASHBOARD_BRANCH": process.env.SOAJS_GIT_DASHBOARD_BRANCH || "master",
                    "SOAJS_GIT_BRANCH": process.env.SOAJS_GIT_BRANCH || "master",
                    "SOAJS_DATA_FOLDER": path.normalize(dataDir + "startup/"),
                    "SOAJS_PROFILE": path.normalize(dataDir + "startup/profile.js"),
                    "INSTALLER_DIR": path.normalize(__dirname + "/../scripts/"),
                    "SOAJS_DEPLOY_DIR": body.gi.wrkDir,
                    "API_PREFIX": body.gi.api,
	                "SOAJS_EXTKEY" : body.security.extKey1,
                    "SITE_PREFIX": body.gi.site,
                    "MASTER_DOMAIN": body.gi.domain
                };
                if (body.clusters.replicaSet) {
                    envs['SOAJS_MONGO_RSNAME'] = body.clusters.replicaSet;
                }

                for (var e in envs) {
                    output += "export " + e + "=" + envs[e] + os.EOL;
                }

                output += os.EOL + "#Run Deployment Script ..." + os.EOL;
                output += nodePath + " " + path.normalize(__dirname + "/../scripts/manual.js") + os.EOL;
                output += os.EOL + "#Start Nginx ..." + os.EOL;

                if (process.platform === 'darwin') {
                    output += "nginx -s stop" + os.EOL;
                    output += "nginx" + os.EOL;
                }
                else {
                    output += "sudo service nginx start" + os.EOL;
                }

                output += os.EOL + "ps aux | grep soajs" + os.EOL;
                output += "ps aux | grep nginx" + os.EOL;

                fs.writeFile(filename, output, function(err){
                    if(err) {
                        return cb(err);
                    }
                    fs.chmod(path.normalize(__dirname + "/../scripts/manual-deploy.sh"), "0755", function(errChmod){
                        if(errChmod) {
                            return cb(errChmod);
                        }
                        return cb(null, {
                            "hosts": {
                                "api": "127.0.0.1 " + body.gi.api + "." + body.gi.domain,
                                "site": "127.0.0.1 " + body.gi.site + "." + body.gi.domain
                            },
                            "ui": "http://" + body.gi.site + "." + body.gi.domain,
                            "cmd": "sudo " + path.normalize(__dirname + "/../scripts/manual-deploy.sh")
                        });
                    });
                });
            });
        });
    },

    "verifyMongoIP": function(req, res, cb){
        var tempData = req.soajs.inputmaskData.clusters;
        if(tempData.mongoExt){
            for(var i = 0; i < tempData.servers.length; i++){
                if(!tempData.servers[i].host)
                    return cb("noIP");
                if(tempData.servers[i].host === "127.0.0.1")
                    return cb(tempData.servers[i].host)
            }
        }
        else{
            req.soajs.inputmaskData.clusters.servers = [{"host": "127.0.0.1", "port":27017}];
            delete req.soajs.inputmaskData.clusters.isReplica;
            delete req.soajs.inputmaskData.clusters.replicaSet;
            req.soajs.inputmaskData.clusters.credentials = null;
        }
        return cb(null, true);
    },

    "deployContainer": function (body, driver, loc, cb) {
        whereis('node', function (err, nodePath) {
            if (err) {
                return cb(err);
            }

            if (driver === 'docker') {
                var filename = path.normalize(__dirname + "/../scripts/swarm-deploy.sh");
                var output = "#!/bin/bash" + os.EOL + os.EOL;

                var envs = {
                    "SOAJS_DEPLOY_HA": driver,
                    "SOAJS_GIT_DASHBOARD_BRANCH": process.env.SOAJS_GIT_DASHBOARD_BRANCH || "master",
                    "SOAJS_GIT_BRANCH": process.env.SOAJS_GIT_BRANCH || "master",
                    "SOAJS_PROFILE": path.normalize(dataDir + "startup/profile.js"),
                    "NODE_PATH": nodePath,
	
	                "SOAJS_EXTKEY" : body.security.extKey1,
                    "API_PREFIX": body.gi.api,
                    "SITE_PREFIX": body.gi.site,
                    "MASTER_DOMAIN": body.gi.domain,

                    "MONGO_EXT": body.clusters.mongoExt,
	                
                    "SOAJS_DATA_FOLDER": path.normalize(dataDir + "startup/"),

                    "SOAJS_IMAGE_PREFIX": body.deployment.soajsImagePrefix,
                    "SOAJS_IMAGE_TAG": body.deployment.soajsImageTag,
	
	                "SOAJS_NX_IMAGE_PREFIX": body.deployment.nginxImagePrefix,
	                "SOAJS_NX_IMAGE_TAG": body.deployment.nginxImageTag,
	                
                    "NGINX_HTTP_PORT": body.deployment.nginxPort,
                    "NGINX_HTTPS_PORT": body.deployment.nginxSecurePort,
                    "SOAJS_NX_SSL": body.deployment.nginxSsl,


                    "SWARM_INTERNAL_PORT": body.deployment.docker.dockerInternalPort,
                    "SOAJS_DOCKER_SOCKET": body.deployment.docker.dockerSocket,
                    "DOCKER_NETWORK": body.deployment.docker.networkName,
                    "CONTAINER_HOST": body.deployment.containerHost,
                    "CONTAINER_PORT": body.deployment.docker.containerPort,
                    "SOAJS_DOCKER_REPLICA": body.deployment.dockerReplica
                };
                
                if(!body.clusters.mongoExt){
                	envs["MONGO_PORT"] = body.deployment.mongoExposedPort;
                }

                if(body.deployment.gitSource && body.deployment.gitSource !== 'github'){
                    envs["SOAJS_GIT_SOURCE"] = body.deployment.gitSource;
                    envs["SOAJS_GIT_PROVIDER"] = body.deployment.gitProvider;
                }

                if (body.clusters.replicaSet) {
                    envs['SOAJS_MONGO_RSNAME'] = body.clusters.replicaSet;
                }
                
                if (body.deployment.certificates && body.deployment.certificates.caCertificate
	                && body.deployment.certificates.certCertificate && body.deployment.certificates.keyCertificate) {
                	
                	body.deployment.docker.caCertificate = body.deployment.certificates.caCertificate;
                	body.deployment.docker.certCertificate = body.deployment.certificates.certCertificate;
                	body.deployment.docker.keyCertificate = body.deployment.certificates.keyCertificate;
                    envs["SOAJS_DOCKER_CA_CERTS_PATH"] = body.deployment.docker.caCertificate;
                    envs["SOAJS_DOCKER_CERT_CERTS_PATH"] = body.deployment.docker.certCertificate;
                    envs["SOAJS_DOCKER_KEY_CERTS_PATH"] = body.deployment.docker.keyCertificate;
                }
	            
                //add readiness probes environment variables
               if(body.deployment.readinessProbe){
                   envs["KUBE_INITIAL_DELAY"] = body.deployment.readinessProbe.initialDelaySeconds;
                   envs["KUBE_PROBE_TIMEOUT"] = body.deployment.readinessProbe.timeoutSeconds;
                   envs["KUBE_PROBE_PERIOD"] = body.deployment.readinessProbe.periodSeconds;
                   envs["KUBE_PROBE_SUCCESS"] = body.deployment.readinessProbe.successThreshold;
                   envs["KUBE_PROBE_FAILURE"] = body.deployment.readinessProbe.failureThreshold;
               }

               //add namespace configuration
               if (body.deployment.namespaces) {
                   envs["SOAJS_NAMESPACES_DEFAULT"] = body.deployment.namespaces.default;
                   envs["SOAJS_NAMESPACES_PER_SERVICE"] = body.deployment.namespaces.perService;
               }

                for (var e in envs) {
                    if (envs[e] !== null) {
                        output += "export " + e + "=" + envs[e] + os.EOL;
                    }
                }

                output += os.EOL + nodePath + " " + path.normalize(__dirname + "/../scripts/docker.js") + os.EOL;
                fs.writeFile(filename, output, function(err){
                    if(err){
                        return cb(err);
                    }
                    fs.chmod(path.normalize(__dirname + "/../scripts/swarm-deploy.sh"), "0755", function(chmodErr){
                        if(chmodErr){
                            return cb(chmodErr);
                        }
                        generateResponse("swarm");
                    });
                });
            }
            else if (driver === 'kubernetes') {

                var filename = path.normalize(__dirname + "/../scripts/kubernetes-deploy.sh");
                var output = "#!/bin/bash" + os.EOL + os.EOL;

                var envs = {
                    "SOAJS_DEPLOY_HA": driver,
                    "SOAJS_GIT_DASHBOARD_BRANCH": process.env.SOAJS_GIT_DASHBOARD_BRANCH || "master",
                    "SOAJS_GIT_BRANCH": process.env.SOAJS_GIT_BRANCH || "master",
                    "SOAJS_PROFILE": path.normalize(dataDir + "startup/profile.js"),
                    "NODE_PATH": nodePath,
	
	                "SOAJS_EXTKEY" : body.security.extKey1,
                    "API_PREFIX": body.gi.api,
                    "SITE_PREFIX": body.gi.site,
                    "MASTER_DOMAIN": body.gi.domain,

                    "MONGO_EXT": body.clusters.mongoExt,

                    "SOAJS_DATA_FOLDER": path.normalize(dataDir + "startup/"),
	
	                "SOAJS_IMAGE_PREFIX": body.deployment.soajsImagePrefix,
	                "SOAJS_IMAGE_TAG": body.deployment.soajsImageTag,
	
	                "SOAJS_NX_IMAGE_PREFIX": body.deployment.nginxImagePrefix,
	                "SOAJS_NX_IMAGE_TAG": body.deployment.nginxImageTag,
	                
                    "NGINX_HTTP_PORT": body.deployment.nginxPort,
                    "NGINX_HTTPS_PORT": body.deployment.nginxSecurePort,
                    "SOAJS_NX_SSL": body.deployment.nginxSsl,

                    "CONTAINER_HOST": body.deployment.containerHost,
                    "CONTAINER_PORT": body.deployment.kubernetes.containerPort,
                    "SOAJS_DOCKER_REPLICA": body.deployment.dockerReplica,

                    "KUBE_AUTH_TOKEN": body.deployment.authentication.accessToken,

                    "NGINX_DEPLOY_TYPE": body.deployment.nginxDeployType
                };
	
	            if(!body.clusters.mongoExt){
		            envs["MONGO_PORT"] = body.deployment.mongoExposedPort;
	            }

                if(body.deployment.nginxSsl && !body.deployment.generateSsc && body.deployment.nginxKubeSecret){
                    envs["SOAJS_NX_SSL_SECRET"] = body.deployment.nginxKubeSecret;
                }

                if(body.deployment.gitSource && body.deployment.gitSource !== 'github'){
                    envs["SOAJS_GIT_SOURCE"] = body.deployment.gitSource;
                    envs["SOAJS_GIT_PROVIDER"] = body.deployment.gitProvider;
                }

                if (body.clusters.replicaSet) {
                    envs['SOAJS_MONGO_RSNAME'] = body.clusters.replicaSet;
                }
                //add readiness probes environment variables
               if(body.deployment.readinessProbe){
                   envs["KUBE_INITIAL_DELAY"] = body.deployment.readinessProbe.initialDelaySeconds;
                   envs["KUBE_PROBE_TIMEOUT"] = body.deployment.readinessProbe.timeoutSeconds;
                   envs["KUBE_PROBE_PERIOD"] = body.deployment.readinessProbe.periodSeconds;
                   envs["KUBE_PROBE_SUCCESS"] = body.deployment.readinessProbe.successThreshold;
                   envs["KUBE_PROBE_FAILURE"] = body.deployment.readinessProbe.failureThreshold;
               }

               //add namespace configuration
               if (body.deployment.namespaces) {
                   envs["SOAJS_NAMESPACES_DEFAULT"] = body.deployment.namespaces.default;
                   envs["SOAJS_NAMESPACES_PER_SERVICE"] = body.deployment.namespaces.perService;
               }

                for (var e in envs) {
                    if (envs[e] !== null) {
                        output += "export " + e + "=" + envs[e] + os.EOL;
                    }
                }

                output += os.EOL + nodePath + " " + path.normalize(__dirname + "/../scripts/kubernetes.js") + os.EOL;

                fs.writeFile(filename, output, function(err){
                    if(err){
                        return cb(err);
                    }
                    fs.chmod(path.normalize(__dirname + "/../scripts/kubernetes-deploy.sh"), "0755", function(chmodErr){
                        if(chmodErr){
                            return cb(chmodErr);
                        }
                        generateResponse("kubernetes");
                    });
                });
            }
            else {
                return cb(new Error("Invalid Deployment Strategy Requested: " + driver));
            }
        });

        function generateResponse(type) {
            var obj = {
                "hosts": {
                    "api": body.deployment.containerHost + " " + body.gi.api + "." + body.gi.domain,
                    "site": body.deployment.containerHost + " " + body.gi.site + "." + body.gi.domain
                },
                "ui": "http://" + body.gi.site + "." + body.gi.domain,
                "cmd": "sudo " + path.normalize(__dirname + "/../scripts/" + type + "-deploy.sh")
            };

            if (!body.clusters.mongoExt) {
                obj['hosts'].mongo = body.deployment.containerHost + " dashboard-soajsdata";
            }
            else {
                obj['hosts'].mongo = body.clusters.servers[0].host + " dashboard-soajsdata";
            }

            return cb(null, obj);
        }
    },

    "regenerateInfo": function(type, body, cb){
        if(type === 'manual'){
            return cb(null, {
                "hosts": {
                    "api": "127.0.0.1 " + body.gi.api + "." + body.gi.domain,
                    "site": "127.0.0.1 " + body.gi.site + "." + body.gi.domain
                },
                "ui": "http://" + body.gi.site + "." + body.gi.domain,
                "cmd": path.normalize(__dirname + "/../scripts/manual-deploy.sh")
            });
        }
        else{
            generateResponse(type);
        }

        function generateResponse(type) {
            fs.chmodSync(path.normalize(__dirname + "/../scripts/" + type + "-deploy.sh"), "0755");
	        var protocol = body.deployment.nginxSsl ? "https" : "http";
	        var port = body.deployment.nginxSsl ? body.deployment.nginxSecurePort : body.deployment.nginxPort;
	        
            var obj = {
                "hosts": {
                    "api": body.deployment.containerHost + " " + body.gi.api + "." + body.gi.domain,
                    "site": body.deployment.containerHost + " " + body.gi.site + "." + body.gi.domain
                },
                "ui": protocol + "://" + body.gi.site + "." + body.gi.domain,
                "cmd": path.normalize(__dirname + "/../scripts/" + type + "-deploy.sh")
            };

            if(port !== 80){
	        	obj["ui"] = protocol + "://" + body.gi.site + "." + body.gi.domain + ":" + port;
	        }

            if(type === 'kubernetes'){
                obj = {
                    "hosts": {
                        "api": body.deployment.containerHost + " " + body.gi.api + "." + body.gi.domain,
                        "site": body.deployment.containerHost + " " + body.gi.site + "." + body.gi.domain
                    },
                    "ui": protocol + "://" + body.gi.site + "." + body.gi.domain + ":" + port,
                    "cmd": path.normalize(__dirname + "/../scripts/" + type + "-deploy.sh")
                };
            }

            if (!body.clusters || !body.clusters.mongoExt) {
                if(type === 'kubernetes'){
                    var namespace = body.deployment.namespaces.default;
                    if (body.deployment.namespaces.perService) {
                        namespace += '-dashboard-soajsdata';
                    }
                    obj['hosts'].mongo = body.deployment.containerHost + " dashboard-soajsdata." + namespace;
                }
                else{
                    obj['hosts'].mongo = body.deployment.containerHost + " dashboard-soajsdata";
                }
            }
            else {
                obj['hosts'].mongo = body.clusters.servers[0].host + " dashboard-soajsdata";
            }
            return cb(null, obj);
        }
    },

    "returnInstallProgress": function (body, cb) {
        if (body.deployment.deployType === 'manual') {
            var repos = ["soajs.controller", "soajs.urac", "soajs.dashboard", "soajs.gcs", "soajs.oauth", "soajs"];

            /*
             1- check if all files in wrkDir exists
             2- check if all dependencies in repos are installed
             */
            var dest = path.normalize(body.gi.wrkDir + "/soajs/node_modules/");
            fs.exists(dest, function (exists) {
                if (!exists) {
                    return cb(null, false);
                }

                fs.readdir(dest, function (err, files) {
                    if (err) {
                        return cb(err);
                    }

                    if(!files || files.length === 0){
                        return cb(null, {
                            deployType: 'manual',
                            download: {
                                count: 0,
                                total: repos.length
                            }
                        });
                    }

                    async.map(files, function (oneFile, mcb) {
                        fs.exists(dest + oneFile, function (exists) {
                            if (!exists) {
                                return mcb(null, 0);
                            }
                            var done = (repos.indexOf(oneFile) !== -1);
                            if (!done) {
                                return mcb(null, null);
                            }

                            fs.readdir(dest + oneFile, function (error, content) {
                                if (error) {
                                    return mcb(error);
                                }
                                if(!content || content.length === 0){
                                    return mcb(null, 0);
                                }

                                if (content.indexOf('node_modules') !== -1) {
                                    fs.readdir(dest + oneFile + "/node_modules/", function (error, dependencies) {
                                        if (error) {
                                            return mcb(error);
                                        }
                                        if (dependencies.length > 0) {
                                            return mcb(null, 1);
                                        }
                                        return mcb(null, 0);
                                    });
                                }
                                else {
                                    return mcb(null, 1);
                                }
                            });
                        });
                    }, function (error, response) {
                        if (error) {
                            return cb(error);
                        }

                        var bar = 0;
                        for (var i = response.length - 1; i >= 0; i--) {
                            if (response[i] !== 0 && response[i] !== 1) {
                                response.splice(i, 1);
                            }
                            else if (response[i] === 1) {
                                bar++;
                            }
                        }

                        //the only thing remaining now in the array are 1s and 0s which represent the repos installed
                        if (bar < repos.length) {
                            return cb(null, {
                                deployType: 'manual',
                                download: {
                                    count: bar,
                                    total: repos.length
                                }
                            });
                        }

                        checkHosts(false, {
                            deployType: 'manual',
                            download: {
                                count: bar,
                                total: repos.length
                            }
                        });
                    });
                });
            })
        }
        else {
            /*
             1- call api and check if all services have containers
             */
            if (body.deployment.deployDriver.indexOf("docker") !== -1) {
                // docker
	            var services = ["dashboard_soajs_oauth", "dashboard_soajs_urac", "dashboard_soajs_dashboard", "dashboard-controller", "dashboard_nginx"];
	            if(body.clusters.mongoExt){
		            services.push("dashboard-soajsdata");
	            }

                var Docker = require('dockerode');
                var deployerConfig = {
                    "host": body.deployment.containerHost,
                    "port": body.deployment.docker.containerPort
                };
                if (typeof (deployerConfig.host) === 'string' && deployerConfig.host === '127.0.0.1') {
                    deployerConfig = {
                        socketPath: body.deployment.docker.dockerSocket
                    };
                }
                else {
                    if (!body.deployment.certificates.caCertificate || !body.deployment.certificates.keyCertificate || !body.deployment.certificates.certCertificate ){
                        return cb(new Error('No certificates found for remote machine.'));
                    }
                    deployerConfig.ca = fs.readFileSync(body.deployment.certificates.caCertificate);
                    deployerConfig.cert = fs.readFileSync(body.deployment.certificates.certCertificate);
                    deployerConfig.key = fs.readFileSync(body.deployment.certificates.keyCertificate);
                }
                var deployer = new Docker(deployerConfig);
                deployer.listContainers({}, function (error, containers) {
                    if (error) return cb(error);

                    deployer.listServices({}, function (error, dockerServices) {
                        if (error) return cb(error);

                        async.map(dockerServices, function (oneService, mcb) {
                            if ((services.indexOf(oneService.Spec.Name) === -1)) {
                                return mcb(null, false);
                            }

                            var count = 0;
                            containers.forEach(function(oneContainer){
                                if(oneContainer.Labels['com.docker.swarm.service.name'] === oneService.Spec.Name){
                                    count++;
                                }
                            });
                            return mcb(null, (count === body.deployment.dockerReplica));
                        }, function (error, response) {
                            if (error) return cb(error);

                            var bar = 0;
                            for (var i = response.length - 1; i >= 0; i--) {
                                if (response[i]) {
                                    bar++;
                                }
                            }

                            return cb(null, {
                                deployType: 'docker',
                                download: {
                                    count: bar,
                                    total: services.length
                                }
                            });
                        });
                    });
                });
            }
            else {
                // kubernetes
	            var services = ["dashboard-oauth-v1", "dashboard-urac-v2", "dashboard-dashboard-v1", "dashboard-controller-v1", "dashboard-nginx"];
	            if(body.clusters.mongoExt){
		            services.push("dashboard-soajsdata");
	            }

                var K8Api = require('kubernetes-client');

                if (!body.deployment.authentication || !body.deployment.authentication.accessToken) {
                    return cb(new Error('No access token found.'));
                }

                try{
                    var deployerConfig = {
                        "url": 'https://' + (body.deployment.containerHost || "127.0.0.1") + ':' + (parseInt(body.deployment.kubernetes.containerPort) || 8443),
                        "auth": {
                            "bearer": body.deployment.authentication.accessToken
                        },
                        "request": {
                            "strictSSL": false
                        },
                        "version": "v1beta1"
                    };
                    var deployer = new K8Api.Extensions(deployerConfig);
                }
                catch(e){
                    return cb(null, {
                        deployType: 'kubernetes',
                        download: {
                            count: 0,
                            total: services.length
                        }
                    });
                }

	            var defaultNamespace = body.deployment.namespaces.default;

	            //get all services regardless of their namespace value
	            async.parallel({
		            deployments: function (callback) {
			            deployer.deployments.get({}, callback);
		            },
		            daemonsets: function (callback) {
			            deployer.daemonsets.get({}, callback);
		            }
	            }, function (err, results) {
		            var items = results.deployments.items.concat(results.daemonsets.items);
		            async.map(items, function (oneService, mcb) {
			            var serviceName = oneService.metadata.name, namespace;
			
			            if (body.deployment.namespaces.perService) {
				            namespace = defaultNamespace + '-' + oneService.metadata.labels['soajs.service.label'];
			            }
			            else {
				            namespace = defaultNamespace;
			            }
			           
			            if (services.indexOf(serviceName) !== -1 && oneService.metadata.namespace === namespace) {
				            if (oneService.metadata.labels["soajs.service.mode"] === "daemonset"){
					            return mcb(null, (oneService.status.numberReady === 1));
				            }
				            else {
					            return mcb(null, (oneService.status.availableReplicas === body.deployment.dockerReplica));
				            }
			            }
			            else return mcb(null, null);
		            }, function (error, response) {
			            if (error) return cb(error);
			
			            var bar = 0;
			            for (var i = response.length - 1; i >= 0; i--) {
				            if (response[i]) {
					            bar++;
				            }
			            }
			
			            //the only thing remaining now in the array are 1s and 0s which represent the repos installed
			            return cb(null, {
				            deployType: 'kubernetes',
				            download: {
					            count: bar,
					            total: services.length
				            }
			            });
		            });
	            });
            }
        }

        function checkHosts(ha, download) {
            /*
             1- load profile
             2- create new mongo connector
             3- query hosts collection
             */
            var profile = require(path.normalize(dataDir + "startup/profile.js"));
            var myMongo = new soajs.mongo(profile);

            myMongo.find("hosts", {"env": "dashboard"}, function (error, hosts) {
                if (error) {
                    return cb(error);
                }

                var data = {
                    download: download.download
                };

                var list = ["controller", "urac", "dashboard"];
                if (ha) {
                    var replica = body.deployment.dockerReplica;
                    data.install = {
                        count: hosts.length,
                        total: list.length * replica
                    };
                }
                else {
                    list.pop();
                    data.install = {
                        count: hosts.length,
                        total: list.length
                    };
                }

                myMongo.closeDb();
                return cb(null, data);
            });
        }
    },
	
	"versions": function(config, req, cb){
		
		let myUrl = config.docker.url;
		let prefix = req.soajs.inputmaskData.prefix;
		let name = req.soajs.inputmaskData.name;
		myUrl = myUrl.replace("%organization%", prefix).replace("%imagename%", name);
		
		let options = {
			method: 'GET',
			url: myUrl,
			headers: { 'cache-control': 'no-cache' },
			json: true
		};
		req.soajs.log.debug(options);
		request.get(options, function (error, response, body) {
			if (error) {
				return cb(error);
			}
			
			let tag = req.soajs.inputmaskData.tag;
			let output =[];
			if(body && body.results){
				if(tag){
					body.results.forEach((oneTag) =>{
						if(oneTag.name === tag){
							output.push(oneTag);
						}
					});
				}
				else{
					let count = 1;
					body.results.forEach((oneTag) =>{
						if(count <= 5){
							output.push(oneTag);
							count++;
						}
					});
				}
			}
			
			return cb(null, output);
		});
	}
};
