'use strict';

var dashUISrc = {
	branch: process.env.SOAJS_GIT_DASHBOARD_BRANCH || 'develop'
};

var customUISrc = {
	owner: process.env.SOAJS_GIT_OWNER || null,
	repo: process.env.SOAJS_GIT_REPO || null,
	branch: process.env.SOAJS_GIT_BRANCH || null,
	token: process.env.SOAJS_GIT_TOKEN || null
};

var ssl = process.env.SOAJS_NX_SSL || null;
var deployerExtra = (ssl) ? ' -s' : '';

var masterDomain = process.env.MASTER_DOMAIN || 'soajs.org';

var controllerServiceName = 'dashboard_soajs_controller';
var controllerServicePort = '4000';

var config = {
	servName: 'dashboard_nginx',
	servReplica: 1,
	servNetwork: [
		{
			Target: process.env.DOCKER_NETWORK || 'soajsnet'
		}
	],
	
	image: {
		prefix: process.env.SOAJS_IMAGE_PREFIX || 'soajsorg',
		name: 'nginx'
	},
	env: [
		'SOAJS_ENV=dashboard',
		
		'SOAJS_GIT_DASHBOARD_BRANCH=' + dashUISrc.branch,
		'SOAJS_NX_API_DOMAIN=' + process.env.API_PREFIX + '.' + masterDomain,
		'SOAJS_NX_SITE_DOMAIN=' + process.env.SITE_PREFIX + '.' + masterDomain,
		
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
			"PublishedPort": process.env.NGINX_HTTP_PORT || 80,
			"TargetPort": 80
		},
		{
			"Protocol": "tcp",
			"PublishedPort": process.env.NGINX_HTTPS_PORT || 443,
			"TargetPort": 443
		}
	]
};

if (customUISrc.repo && customUISrc.owner) {
	config.env.push('SOAJS_GIT_REPO=' + customUISrc.repo);
	config.env.push('SOAJS_GIT_OWNER=' + customUISrc.owner);
	
	if (customUISrc.branch) {
		config.env.push('SOAJS_GIT_DASHBOARD_BRANCH=' + process.env.GIT_BRANCH || "develop");
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
