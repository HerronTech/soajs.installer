'use strict';
var gConfig = require("../../config.js");
var config = {
    servName: 'kibana',
    servReplica: 1,
    servNetwork: [{Target: gConfig.docker.network}],
    image: {
        prefix: '',
        name: 'kibana-time-plugin'
    },
    env: [
	    'ELASTICSEARCH_URL=http://soajs-analytics-elasticsearch:9200'
    ],
    labels: {
	    "soajs.service.name": "kibana",
	    "soajs.service.group": "elk",
	    "soajs.service.type": "elk",
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
            "Image": config.image.name,
            "Env": config.env,
           //"Command": [config.command[0]],
            //"Args": config.command.splice(1)
        },
        "Placement": {},
        "Resources": {
            "Limits": {
                "MemoryBytes": 1000000000.0
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
