"use strict";

var mongoHostname = process.env.MONGO_IP || "dashboard_soajsData";
module.exports = {
	"masterDomain": process.env.MASTER_DOMAIN || 'soajs.org',
	"apiPrefix": process.env.API_PREFIX || "dashboard-api",
	"sitePrefix": process.env.SITE_PREFIX || "dashboard",
	"folder": process.env.SOAJS_DATA_FOLDER,
	"profile": process.env.SOAJS_PROFILE,
	"git":{
		"branch": process.env.SOAJS_GIT_BRANCH || 'develop'
	},
	"dashUISrc": {
		"branch": process.env.SOAJS_GIT_DASHBOARD_BRANCH || 'develop'
	},
	"customUISrc":{
		"owner": process.env.SOAJS_GIT_OWNER || null,
		"repo": process.env.SOAJS_GIT_REPO || null,
		"branch": process.env.SOAJS_GIT_BRANCH || null,
		"token": process.env.SOAJS_GIT_TOKEN || null
	},
	"mongo":{
		"hostname": mongoHostname,
		"services": {
			"dashboard": {
				"name": mongoHostname,
				"ips": []
			}
		},
		"prefix": process.env.SOAJS_MONGO_PREFIX || "",
		"external": (process.env.MONGO_EXT === "true") || false,
		"port": process.env.MONGO_PORT || 27017
	},
	"nginx":{
		"port": {
			"http": process.env.NGINX_HTTP_PORT || 80,
			"https": process.env.NGINX_HTTPS_PORT || 443
		},
		"ssl": process.env.SOAJS_NX_SSL || false,
	},
	"imagePrefix": process.env.SOAJS_IMAGE_PREFIX || 'soajsorg',
	"docker":{
		"mongoCollection": 'docker',
		"replicas": process.env.SOAJS_DOCKER_REPLICA || 1,
		"machineIP": process.env.CONTAINER_HOST || "127.0.0.1",
		"machinePort": process.env.CONTAINER_PORT || 2376,
		"certsPath": process.env.SOAJS_DOCKER_CERTS_PATH || process.env.HOME + '/.docker',
		"socketPath": process.env.SOAJS_DOCKER_SOCKET || '/var/run/docker.sock',
		"network": process.env.DOCKER_NETWORK ||  'soajsnet',
		"options": {
			"ListenAddr": "0.0.0.0:" + (process.env.SWARM_INTERNAL_PORT || 2377),
			"AdvertiseAddr": (process.env.CONTAINER_HOST || "127.0.0.1") + ':' + (process.env.SWARM_INTERNAL_PORT || 2377),
			"ForceNewCluster": true,
			"Spec": {
				"Orchestration": {},
				"Raft": {},
				"Dispatcher": {},
				"CAConfig": {}
			}
		},
		"swarmConfig": {
			"tokens": {}
		},
	},
	
	"deployGroups": ['db', 'core', 'nginx'],
	"services":{
		"path": {
			"dir": __dirname + '/services/',
			"fileType": 'js'
		}
	}
	
};