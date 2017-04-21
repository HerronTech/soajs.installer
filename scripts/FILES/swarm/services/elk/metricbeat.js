'use strict';
var gConfig = require("../../config.js");
var config = {
    servName: 'metricbeat',
    servReplica: 1,
    servNetwork: [{Target: gConfig.docker.network}],

    image: {
        prefix: '',
        name: 'metricbeat-docker'
    },
    env: [
	    'ELASTICSEARCH_URL=elasticsearch:9200',
    ],
    labels: {
	    "ELASTICSEARCH_URL": "metricbeat",
	    "soajs.service.group": "elk",
	    "soajs.service.type": "elk",
	    "soajs.service.label": "metricbeat"
    },
    command: [],
	mounts: [
		{
			"Type": "bind",
			"Source": '/var/run/docker.sock',
			"Target": '/var/run/docker.sock',
		},
		{
			"Type": "bind",
			"Source": "/proc",
			"Target": "/hostfs/proc",
		},
		{
			"Type": "bind",
			"Source": "/sys/fs/cgroup",
			"Target": "/hostfs/sys/fs/cgroup",
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
            //"Args": config.command.splice(1),
	        "Mounts": config.mounts
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
