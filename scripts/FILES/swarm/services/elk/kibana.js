'use strict';
var gConfig = require("../../config.js");
var config = {
    servName: 'kibana',
    servReplica: 1,
    servNetwork: [{Target: gConfig.docker.network}],
    image: {
	    prefix: 'soajsorg',
        name: 'kibana'
    },
    env: [
	    'ELASTICSEARCH_URL=http://soajs-analytics-elasticsearch:9200'
    ],
    labels: {
	    "soajs.content": "true",
	    "soajs.service.name": "kibana",
	    "soajs.service.group": "soajs-analytics",
	    "soajs.service.type": "system",
	    "soajs.service.subtype": "kibana",
	    "soajs.service.label": "kibana",
	    "soajs.service.mode": "replicated"
    },
    exposedPorts: [
        {
            "Protocol": "tcp",
            "PublishedPort": 32601, //exposed
            "TargetPort": 5601
        }
    ]
};

module.exports = {
    "Name": config.servName,
    "TaskTemplate": {
        "ContainerSpec": {
            "Image": config.image.prefix + '/' + config.image.name,
            "Env": config.env
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
