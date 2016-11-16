'use strict';

var src = {
	owner: 'soajs',
	repo: 'soajs.prx',
	branch: process.env.SOAJS_GIT_BRANCH || 'develop'
};

var config = {
	servName: 'dashboard_soajs_prx',
	servReplica: 1,
	servNetwork: [
		{
			Target: process.env.DOCKER_NETWORK || 'soajsnet'
		}
	],
	
	image: {
		prefix: process.env.SOAJS_IMAGE_PREFIX || 'soajsorg',
		name: 'soajs'
	},
	env: [
		'NODE_ENV=production',
		'SOAJS_ENV=dashboard',
		
		'SOAJS_DEPLOY_HA=true',
		
		'SOAJS_PROFILE=/opt/soajs/FILES/profiles/profile.js',
		'SOAJS_SRV_AUTOREGISTERHOST=true',
		
		'SOAJS_GIT_OWNER=' + src.owner,
		'SOAJS_GIT_REPO=' + src.repo,
		'SOAJS_GIT_BRANCH=' + src.branch
	],
	mounts: [
		{
			"Type": "bind",
			"ReadOnly": true,
			"Source": process.env.SOAJS_DOCKER_SOCKET || '/var/run/docker.sock',
			"Target": process.env.SOAJS_DOCKER_SOCKET || '/var/run/docker.sock',
		}
	],
	labels: {
		"soajs.env": "dashboard",
		"soajs.service": "proxy",
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
			},
			"Reservations": {}
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
