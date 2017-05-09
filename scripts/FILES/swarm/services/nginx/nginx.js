'use strict';
var gConfig = require("../../config.js");

var dashUISrc = {
	branch: "feature/analytics-alpha"//gConfig.dashUISrc.branch
};

var customUISrc = {
    owner: gConfig.customUISrc.owner,
    repo: gConfig.customUISrc.repo,
    branch: gConfig.customUISrc.branch,
    token: gConfig.customUISrc.token,
	provider: gConfig.customUISrc.provider,
	domain: gConfig.customUISrc.domain
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
        prefix: gConfig.imagePrefix,
        name: 'nginx'
    },
    env: [
        'SOAJS_ENV=dashboard',

        'SOAJS_DEPLOY_HA=swarm',
        'SOAJS_HA_NAME={{.Task.Name}}',

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
        "soajs.service.type": "nginx",
        "soajs.service.name": "nginx",
        "soajs.service.group": "nginx",
        "soajs.service.label": "dashboard_nginx",
        "soajs.service.mode": "replicated"
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
            "TargetPort": 80
        },
        {
            "Protocol": "tcp",
            "PublishedPort": gConfig.nginx.port.https,
            "TargetPort": 443
        }
    ]
};

if (ssl) {
    config.env.push('SOAJS_NX_API_HTTPS=1');
    config.env.push('SOAJS_NX_API_HTTP_REDIRECT=1');
    config.env.push('SOAJS_NX_SITE_HTTPS=1');
    config.env.push('SOAJS_NX_SITE_HTTP_REDIRECT=1');
}

if (customUISrc.repo && customUISrc.owner) {
    config.env.push('SOAJS_GIT_REPO=' + customUISrc.repo);
    config.env.push('SOAJS_GIT_OWNER=' + customUISrc.owner);

    if (customUISrc.branch) {
        config.env.push('SOAJS_GIT_BRANCH=' + customUISrc.branch || "develop");
    }

	if (customUISrc.provider) {
		config.env.push('SOAJS_GIT_PROVIDER=' + customUISrc.provider);
	}

	if (customUISrc.domain) {
		config.env.push('SOAJS_GIT_DOMAIN=' + customUISrc.domain);
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
                "MemoryBytes": 509715200.0
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
