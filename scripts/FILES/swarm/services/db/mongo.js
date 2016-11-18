'use strict';
var gConfig = require("../../config.js");

var config = {
    servName: 'dashboard_soajsData',
    servReplica: 1,
    servNetwork: [
    	{
		    Target: gConfig.docker.network
    	}
    ],

    image: {
        prefix: '',
        name: 'mongo'
    },
    labels: {
        "soajs.env": "dashboard"
    },
    command: [
        'mongod',
        '--smallfiles'
    ],
    mounts: [
        {
            "Type": "volume",
            "Source": "dashboard-soajsData",
            "Target": "/data/db/",
        }
    ],
    exposedPorts: [
        {
            "Protocol": "tcp",
            "PublishedPort": gConfig.mongo.port,
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