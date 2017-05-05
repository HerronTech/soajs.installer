
/**
 * Created by ragheb on 1/17/17.
 */
'use strict';
var gConfig = require("../../config.js");
var config = {
	servName: 'dashboard-logstash',
	servReplica: 1,
	servNetwork: [{Target: gConfig.docker.network}],
	
	image: {
		prefix: gConfig.imagePrefix, //todo  gConfig.imagePrefix,
		name: 'logstash'
	},
	env: [
		'ELASTICSEARCH_URL=soajs-analytics-elasticsearch:9200'
	],
	labels: {
		"soajs.content": "true",
		"soajs.env.code": "dashboard",
		"soajs.service.type": "elk",
		"soajs.service.name": "dashboard-logstash",
		"soajs.service.group": "elk",
		"soajs.service.label": "dashboard-logstash",
		"soajs.service.mode": "global"
	},
	command: [
		"bash",
		"-c",
		"logstash -f /usr/share/logstash/config/logstash.conf"
	],
	exposedPorts: []
};


module.exports = {
	"Name": config.servName,
	"TaskTemplate": {
		"ContainerSpec": {
			"Image": config.image.prefix + '/' + config.image.name,
			"Env": config.env,
			"Command": [config.command[0]],
			"Args": config.command.splice(1)
		},
		"Placement": {},
		"Resources": {
			"Limits": {
				"MemoryBytes": 1000000000.0 //approx 1gb
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
