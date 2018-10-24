'use strict';
var gConfig = require("../../config.js");

var config = {
    servName: 'dashboard-soajsdata',
    servReplica: 1,
    servNetwork: [
    	{
		    Target: gConfig.docker.network
    	}
    ],

    image: {
        prefix: '',
        name: 'mongo:3.4.10'
    },
    labels: {
        "soajs.content": "true",
		"soajs.env.code": "dashboard",
	    "soajs.service.type": "cluster",
	    "soajs.service.subtype": "mongo",
        "soajs.service.name": "soajsdata",
        "soajs.service.group": "soajs-db",
        "soajs.service.label": "dashboard-soajsdata",
        "soajs.service.mode": "replicated"
    },
    command: [
        'mongod',
        '--smallfiles'
    ],
    mounts: [
        {
            "Type": "volume",
            "Source": "dashboard-soajsdata",
            "Target": "/data/db/"
        }
    ],
    exposedPorts: [
        {
            "Protocol": "tcp",
            "PublishedPort": parseInt(process.env.MONGO_PORT) || gConfig.mongo.port,
            "TargetPort": 27017
        }
    ]
};

module.exports = {
    "Name": config.servName,
    "TaskTemplate": {
        "ContainerSpec": {
            "Image": config.image.name,
            "Env": config.env,
            "Command": [config.command[0]],
            "Args": config.command.splice(1),
            "Mounts": config.mounts
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
