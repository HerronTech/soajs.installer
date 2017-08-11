"use strict";

var profile = require(process.env.SOAJS_PROFILE);
var mongoHostname = profile.servers[0].host;
var lib  = {
	"extKey1": process.env.EXTKEY1,
	"analytics": process.env.SOAJS_DEPLOY_ANALYTICS,
	"masterDomain": process.env.MASTER_DOMAIN || 'soajs.org',
	"apiPrefix": process.env.API_PREFIX || "dashboard-api",
	"sitePrefix": process.env.SITE_PREFIX || "dashboard",
	"folder": process.env.SOAJS_DATA_FOLDER || "/opt/soajs/node_modules/soajs.installer/data/startup/",
	"profile": process.env.SOAJS_PROFILE || "/opt/soajs/node_modules/soajs.installer/data/startup/profile.js",
    "deploy_acc": process.env.SOAJS_DEPLOY_ACC || "true",
    "git":{
        "branch": process.env.SOAJS_GIT_BRANCH || 'develop',
        "domain": process.env.SOAJS_GIT_DOMAIN || 'github.com',
        "provider": process.env.SOAJS_GIT_PROVIDER || 'github'
    },
	"dashUISrc": {
		"branch": process.env.SOAJS_GIT_DASHBOARD_BRANCH || 'develop'
	},
	"customUISrc":{
		"owner": process.env.SOAJS_GIT_OWNER || null,
		"repo": process.env.SOAJS_GIT_REPO || null,
		"branch": process.env.SOAJS_GIT_CUSTOM_UI_BRANCH || null,
		"token": process.env.SOAJS_GIT_TOKEN || null,
		"provider": process.env.SOAJS_GIT_SOURCE || null,
		"domain": process.env.SOAJS_GIT_PROVIDER || null,
		"path": process.env.SOAJS_GIT_PATH || null
	},
	"mongo":{
		"prefix": profile.prefix,
		"hostname": mongoHostname,
		"services": {
			"dashboard": {
				"name": mongoHostname,
				"ips": []
			}
		},
		"rsName": process.env.SOAJS_MONGO_RSNAME || null,
		"external": (process.env.MONGO_EXT === "true") || false,
		"port": parseInt(profile.servers[0].port) || 31000
	},
	"nginx":{
		"deployType": process.env.NGINX_DEPLOY_TYPE || null,
		"port": {
			"http": parseInt(process.env.NGINX_HTTP_PORT) || 80,
			"https": parseInt(process.env.NGINX_HTTPS_PORT) || 443
		},
		"ssl": (process.env.SOAJS_NX_SSL === "true") || false,
		"sslSecret": process.env.SOAJS_NX_SSL_SECRET || null
	},
	"imagePrefix": process.env.SOAJS_IMAGE_PREFIX || 'soajsorg',
	"imagePullPolicy": process.env.SOAJS_IMAGE_PULL_POLICY || 'IfNotPresent',
	"kubernetes": {
		"config":{
			"url": 'https://' + (process.env.CONTAINER_HOST || "127.0.0.1") + ':' + (parseInt(process.env.CONTAINER_PORT) || 8443),
			"namespaces": {
				"default": process.env.SOAJS_NAMESPACES_DEFAULT || 'default',
				"perService": (process.env.SOAJS_NAMESPACES_PER_SERVICE === "true") || false
			},
            "auth": {
                "bearer": process.env.KUBE_AUTH_TOKEN || ""
            }
		},
		"mongoCollection": 'docker',
		"replicas": parseInt(process.env.SOAJS_DOCKER_REPLICA) || 1,
		"machineIP": process.env.CONTAINER_HOST || "127.0.0.1",
		"machinePort": parseInt(process.env.CONTAINER_PORT) || 8443,
		"certsPath": process.env.SOAJS_DOCKER_CERTS_PATH || process.env.HOME + '/.minikube',
		"network": process.env.DOCKER_NETWORK ||  'soajsnet',
		"swarmConfig": {
			"tokens": {}
		},
		"volumes": {
			"log": {
				"label": "soajs-log-volume",
				"path": "/var/log/soajs/"
			}
		},
		"readinessProbe": {
			"initialDelaySeconds": parseInt(process.env.KUBE_INITIAL_DELAY) || 15,
			"timeoutSeconds": parseInt(process.env.KUBE_PROBE_TIMEOUT) || 1,
			"periodSeconds": parseInt(process.env.KUBE_PROBE_PERIOD) || 10,
            "successThreshold": parseInt(process.env.KUBE_PROBE_SUCCESS) || 1,
            "failureThreshold": parseInt(process.env.KUBE_PROBE_FAILURE) || 3,
		}
	},

	"deployGroups": ['db', 'elk', 'core', 'nginx'],
	"services":{
		"path": {
			"dir": __dirname + '/services/',
			"fileType": 'js'
		}
	}
};
module.exports = lib;
