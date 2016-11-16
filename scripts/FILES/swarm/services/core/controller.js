'use strict';
var gConfig = require("../../config.js");

var src = {
	owner: 'soajs',
	repo: 'soajs.controller',
	branch: gConfig.git.branch
};

var config = {
	servName: 'dashboard_soajs_controller',
	servReplica: 1,
	servNetwork: [
		{
			Target: gConfig.docker.network
		}
	],
	
	image: {
		prefix: gConfig.imagePrefix,
		name: 'soajs'
	},
	env: [
		'NODE_ENV=production',
		'SOAJS_ENV=dashboard',
		
		'SOAJS_DEPLOY_HA=true',
		
		'SOAJS_PROFILE=/opt/soajs/FILES/profiles/'+gConfig.profile,
		'SOAJS_SRV_AUTOREGISTERHOST=true',
		
		'SOAJS_GIT_OWNER=' + src.owner,
		'SOAJS_GIT_REPO=' + src.repo,
		'SOAJS_GIT_BRANCH=' + src.branch
	],
	mounts: [
		{
			"Type": "bind",
			"ReadOnly": true,
			"Source": gConfig.docker.socket,
			"Target": gConfig.docker.socket,
		}
	],
	labels: {
		"soajs.env": "dashboard",
		"soajs.service": "controller",
		"soajs.service.group": "core"
	},
	workingDir: '/opt/soajs/FILES/deployer/',
	command: [
		'bash',
		'-c',
		'./soajsDeployer.sh -T service -X deploy -L'
	]
};

module.exports = {
	"Name": config.servName,
	"TaskTemplate": {
		"ContainerSpec": {
			"Image": config.image.prefix + '/' + config.image.name,
			"Env": config.env,
			"Dir": config.workingDir,
			"Command": [config.command[0]],
			"Args": config.command.splice(1),
			"Mounts": config.mounts
		},
		"Placement": {},
		"Resources": {
			"Limits": {
				"MemoryBytes": 209715200.0
			}
		},
		"RestartPolicy": {
			"Condition": "any",
			"MaxAttempts": 5
		}
	},
	"Mode": {
		"Replicated": {
			"Replicas": config.servReplica
		}
	},
	"UpdateConfig": {
		"Delay": 500.0,
		"Parallelism": 2,
		"FailureAction": "pause"
	},
	"Networks": config.servNetwork,
	"Labels": config.labels
};
