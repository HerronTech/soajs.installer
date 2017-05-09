'use strict';
var gConfig = require("../../config.js");
var config = {
    servName: 'soajs-analytics-elasticsearch',
    servReplica: 1,
    servNetwork: [{Target: gConfig.docker.network}],

    image: {
        prefix: '',
        name: 'elasticsearch:alpine'
    },
    env: [],
    labels: {
	    "soajs.content": "true",
	    "soajs.service.type": "elk",
	    "soajs.service.name": "soajs-analytics-elasticsearch",
	    "soajs.service.group": "elk",
	    "soajs.service.label": "soajs-analytics-elasticsearch",
	    "soajs.service.mode": "replicated"
    },
    exposedPorts: [
        {
            "Protocol": "tcp",
            "PublishedPort": 9200,
            "TargetPort": 9200
        }
    ],
	mounts: [
		{
			"Type": "volume",
			"Source": "elasticsearch-volume",
			"Target": '/usr/share/elasticsearch/data'
		}
	]
};

module.exports = {
    "Name": config.servName,
    "TaskTemplate": {
        "ContainerSpec": {
            "Image": config.image.name,
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
