'use strict';
var gConfig = require("../../config.js");

var dashUISrc = {
	branch: gConfig.dashUISrc.branch
};


var ssl = gConfig.nginx.ssl;

var masterDomain = gConfig.masterDomain;

var controllerServiceName = 'dashboard-controller';
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
        prefix: gConfig.images.nginx.prefix,
        name: 'nginx',
        tag: gConfig.images.nginx.tag
    },
    env: [
        'SOAJS_ENV=dashboard',

        'SOAJS_DEPLOY_HA=swarm',
        'SOAJS_HA_NAME={{.Task.Name}}',

	    'SOAJS_EXTKEY=' + gConfig.guestExtKey,

        'SOAJS_GIT_DASHBOARD_BRANCH=' + dashUISrc.branch,
        'SOAJS_NX_DOMAIN=' + masterDomain,
        'SOAJS_NX_API_DOMAIN=' + gConfig.apiPrefix + '.' + masterDomain,
        'SOAJS_NX_SITE_DOMAIN=' + gConfig.sitePrefix + '.' + masterDomain,

        'SOAJS_NX_CONTROLLER_NB=1',
        'SOAJS_NX_CONTROLLER_IP_1=' + controllerServiceName,
        'SOAJS_NX_CONTROLLER_PORT_1=' + controllerServicePort,

    ],
    mounts: [
        {
            "Type": "volume",
            "Source": gConfig.docker.volumes.log.label,
            "Target": gConfig.docker.volumes.log.path,
        }
    ],
    labels: {
        "soajs.content": "true",
        "soajs.env.code": "dashboard",
        "soajs.service.type": "server",
        "soajs.service.subtype": "nginx",
        "soajs.service.name": "nginx",
        "soajs.service.group": "soajs-nginx",
        "soajs.service.label": "dashboard_nginx",
        "soajs.service.mode": "global"
    },
    workingDir: '/opt/soajs/deployer/',
    command: [
        'bash',
        '-c',
        'node index.js -T nginx'
    ],
    exposedPorts: [
        {
            "Protocol": "tcp",
            "PublishedPort": gConfig.nginx.port.http,
            "TargetPort": 80,
			"PublishMode": "host"
        },
        {
            "Protocol": "tcp",
            "PublishedPort": gConfig.nginx.port.https,
            "TargetPort": 443,
			"PublishMode": "host"
        }
    ]
};

if (ssl) {
    config.env.push('SOAJS_NX_API_HTTPS=1');
    config.env.push('SOAJS_NX_API_HTTP_REDIRECT=1');
    config.env.push('SOAJS_NX_SITE_HTTPS=1');
    config.env.push('SOAJS_NX_SITE_HTTP_REDIRECT=1');
}

module.exports = {
    "Name": config.servName,
    "TaskTemplate": {
        "ContainerSpec": {
            "Image": config.image.prefix + '/' + config.image.name + ":" + config.image.tag,
            "Env": config.env,
            "Dir": config.workingDir,
            "Command": [config.command[0]],
            "Args": config.command.splice(1),
            "Mounts": config.mounts
        },
        "Placement": {},
        "RestartPolicy": {
            "Condition": "any",
            "MaxAttempts": 5
        }
    },
    "Mode": {
		"Global": {}
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
