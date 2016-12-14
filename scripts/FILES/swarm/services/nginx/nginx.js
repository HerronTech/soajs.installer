'use strict';
var gConfig = require("../../config.js");

var dashUISrc = {
	branch: gConfig.dashUISrc.branch
};

var customUISrc = {
	owner: gConfig.customUISrc.owner,
	repo: gConfig.customUISrc.repo,
	branch: gConfig.customUISrc.branch,
	token: gConfig.customUISrc.token
};

var ssl = gConfig.nginx.ssl;
var deployerExtra = (ssl) ? ' -s' : '';

var masterDomain = gConfig.masterDomain;

var controllerServiceName = 'dashboard_soajs_controller';
var controllerServicePort = '4000';

var config = {
	servName: 'dashboard_nginx',
	servReplica: parseInt(gConfig.docker.replicas),
	servNetwork: [
		{
			Target: gConfig.docker.network
		}
	],

	image: {
		prefix: gConfig.imagePrefix,
		name: 'nginx'
	},
	env: [
		'SOAJS_ENV=dashboard',

		'SOAJS_DEPLOY_HA=swarm',

		'SOAJS_GIT_DASHBOARD_BRANCH=' + dashUISrc.branch,
		'SOAJS_NX_API_DOMAIN=' + gConfig.apiPrefix + '.' + masterDomain,
		'SOAJS_NX_SITE_DOMAIN=' + gConfig.sitePrefix + '.' + masterDomain,

		'SOAJS_NX_CONTROLLER_NB=1',
		'SOAJS_NX_CONTROLLER_IP_1=' + controllerServiceName,
		'SOAJS_NX_CONTROLLER_PORT_1=' + controllerServicePort
	],
	mounts: [
        {
            "Type": "bind",
            "ReadOnly": true,
            "Source": gConfig.docker.socketPath,
            "Target": gConfig.docker.socketPath
        }
    ],
	labels: {
		"soajs.env": "dashboard",
		"soajs.service": "nginx",
		"soajs.service.group": "nginx"
	},
	workingDir: '/opt/soajs/FILES/deployer/',
	command: [
		'bash',
		'-c',
		// '/etc/init.d/filebeat start; /etc/init.d/topbeat start; ./soajsDeployer.sh -T nginx -X deploy' + deployerExtra
		'./soajsDeployer.sh -T nginx -X deploy' + deployerExtra
	],
	exposedPorts: [
		{
			"Protocol": "tcp",
			"PublishedPort": gConfig.nginx.port.http,
			"TargetPort": 80
		},
		{
			"Protocol": "tcp",
			"PublishedPort": gConfig.nginx.port.https,
			"TargetPort": 443
		}
	]
};

if (customUISrc.repo && customUISrc.owner) {
	config.env.push('SOAJS_GIT_REPO=' + customUISrc.repo);
	config.env.push('SOAJS_GIT_OWNER=' + customUISrc.owner);

	if (customUISrc.branch) {
		config.env.push('SOAJS_GIT_DASHBOARD_BRANCH=' + gConfig.git.branch || "develop");
	}
	if (customUISrc.token) {
		config.env.push('SOAJS_GIT_TOKEN=' + customUISrc.token);
	}
}

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
	"EndpointSpec": {
		"Mode": "vip",
		"Ports": config.exposedPorts
	},
	"Labels": config.labels
};
