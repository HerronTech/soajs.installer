'use strict';
var gConfig = require("../../config.js");

var src = {
    owner: 'soajs',
    repo: 'soajs.urac',
	branch: gConfig.git.branch
};

var config = {
    servName: 'dashboard_soajs_urac',
    servReplica: parseInt(gConfig.docker.replicas),
    servNetwork: [
    	{
		    Target: gConfig.docker.network
    	}
    ],
	
	image: {
		prefix: gConfig.images.soajs.prefix,
		name: 'soajs',
		tag: gConfig.images.soajs.tag
	},
    env: [
        'NODE_ENV=production',
        'SOAJS_ENV=dashboard',

        'SOAJS_DEPLOY_HA=swarm',
        'SOAJS_HA_NAME={{.Task.Name}}',
	    'NODE_TLS_REJECT_UNAUTHORIZED=0',
        'SOAJS_PROFILE=/opt/soajs/FILES/profiles/profile.js',
        'SOAJS_SRV_AUTOREGISTERHOST=true',
	    'SOAJS_MONGO_PREFIX=' + gConfig.mongo.prefix,
	    'SOAJS_GIT_OWNER=' + src.owner,
	    'SOAJS_GIT_REPO=' + src.repo,
	    'SOAJS_GIT_BRANCH=' + src.branch,
	    'SOAJS_GIT_PROVIDER=' + gConfig.git.provider,
	    'SOAJS_GIT_DOMAIN=' + gConfig.git.domain,
        'SOAJS_DEPLOY_ACC=' + gConfig.deploy_acc
    ],
    mounts: [
		{
            "Type": "volume",
            "Source": gConfig.docker.volumes.log.label,
            "Target": gConfig.docker.volumes.log.path,
        }
    ],
    labels: {
	    "service.branch": gConfig.git.branch,
	    "service.owner": "soajs",
	    "service.repo": "soajs.urac",
        "soajs.content": "true",
		"soajs.env.code": "dashboard",
	    "soajs.service.type": "service",
	    "soajs.service.subtype": "soajs",
		"soajs.service.name": "urac",
		"soajs.service.group": "soajs-core-services",
		"soajs.service.version": "2",
		"soajs.service.label": "dashboard_soajs_urac",
        "soajs.service.mode": "replicated",
	    "soajs.service.repo.name": "soajs_urac"
    },
    workingDir: '/opt/soajs/deployer/',
    command: [
        'bash',
        '-c',
        '/etc/init.d/postfix start; node index.js -T service'
    ]
};



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
