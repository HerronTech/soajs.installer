'use strict';
var config = require("../../config.js");

var dashUISrc = {
	branch: config.dashUISrc.branch
};

var customUISrc = {
	owner: config.customUISrc.owner,
	repo: config.customUISrc.repo,
	branch: config.customUISrc.branch,
	token: config.customUISrc.token
};

var ssl = config.nginx.ssl;
var deployerExtra = (ssl) ? ' -s' : '';

var masterDomain = config.masterDomain;

var controllerServiceName = 'dashboard_soajs_controller';
var controllerServicePort = '4000';

var config = {
	servName: 'dashboard_nginx',
	servReplica: 1,
	servNetwork: [
		{
			Target: config.docker.network
		}
	],
	
	image: {
		prefix: config.imagePrefix,
		name: 'nginx'
	},
	env: [
		'SOAJS_ENV=dashboard',
		
		'SOAJS_GIT_DASHBOARD_BRANCH=' + dashUISrc.branch,
		'SOAJS_NX_API_DOMAIN=' + config.apiPrefix + '.' + masterDomain,
		'SOAJS_NX_SITE_DOMAIN=' + config.sitePrefix + '.' + masterDomain,
		
		'SOAJS_NX_CONTROLLER_NB=1',
		'SOAJS_NX_CONTROLLER_IP_1=' + controllerServiceName,
		'SOAJS_NX_CONTROLLER_PORT_1=' + controllerServicePort
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
			"PublishedPort": config.nginx.port.http,
			"TargetPort": 80
		},
		{
			"Protocol": "tcp",
			"PublishedPort": config.nginx.port.https,
			"TargetPort": 443
		}
	]
};

if (customUISrc.repo && customUISrc.owner) {
	config.env.push('SOAJS_GIT_REPO=' + customUISrc.repo);
	config.env.push('SOAJS_GIT_OWNER=' + customUISrc.owner);
	
	if (customUISrc.branch) {
		config.env.push('SOAJS_GIT_DASHBOARD_BRANCH=' + config.git.branch || "develop");
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
