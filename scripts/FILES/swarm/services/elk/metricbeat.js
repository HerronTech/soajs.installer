'use strict';
var gConfig = require("../../config.js");
var config = {
    servName: 'soajs-metricbeat',
    servReplica: 1,
    servNetwork: [{Target: gConfig.docker.network}],

    image: {
	    prefix: gConfig.imagePrefix,
        name: 'metricbeat'
    },
    env: [
	    'ELASTICSEARCH_URL=soajs-analytics-elasticsearch:9200',
    ],
    labels: {
	    "soajs.content": "true",
	    "soajs.service.group": "soajs-analytics",
	    "soajs.service.type": "system",
	    "soajs.service.subtype": "merticbeat",
	    "soajs.service.name": "soajs-metricbeat",
	    "soajs.service.label": "soajs-metricbeat",
	    "soajs.service.mode": "global"
    },
    command: [],
	mounts: [
		{
			"Type": "bind",
			"Source": '/var/run/docker.sock',
			"Target": '/var/run/docker.sock',
		}
	]
};

module.exports = {
    "Name": config.servName,
    "TaskTemplate": {
        "ContainerSpec": {
            "Image": config.image.prefix + '/' + config.image.name,
            "Env": config.env,
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
