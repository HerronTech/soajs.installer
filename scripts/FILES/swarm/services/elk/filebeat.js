
/**
 * Created by ragheb on 1/17/17.
 */
'use strict';
var gConfig = require("../../config.js");
var config = {
	servName: 'dashboard-filebeat',
	servReplica: 1,
	servNetwork: [{Target: gConfig.docker.network}],
	
	image: {
		prefix: gConfig.imagePrefix, //todo gConfig.imagePrefix,
		name: 'filebeat'
	},
	env: [
		'SOAJS_LOGSTASH_HOST=dashboard-logstash',
		'SOAJS_ENV=dashboard',
		'SOAJS_LOGSTASH_PORT=12201'
	],
	labels: {
		"soajs.content": "true",
		"soajs.env.code": "dashboard",
		"soajs.service.type": "elk",
		"soajs.service.name": "dashboard-filebeat",
		"soajs.service.group": "elk",
		"soajs.service.label": "dashboard-filebeat",
		"soajs.service.mode": "replicated"
	},
	 //todo: Do we really need this?
	command: [
		"/usr/share/filebeat/bin/filebeat",  "-e",  "-c", "/etc/filebeat/filebeat.yml"
	],
	exposedPorts: [],
	mounts: [
		{
			"Type": "volume",
			"Source": gConfig.docker.volumes.log.label,
			"Target": gConfig.docker.volumes.log.path
		},
		{
			"Type": "volume",
			"Source": "soajs-filebeat",
			"Target": "/usr/share/filebeat/bin/data"
		}
	]
};

module.exports = {
	"Name": config.servName,
	"TaskTemplate": {
		"ContainerSpec": {
			"Image": config.image.prefix + '/' + config.image.name,
			"Env": config.env,
			"Command": [config.command[0]],
			"Args": config.command.splice(1),
			"Mounts": config.mounts
		},
		"Placement": {},
		"Resources": {
			"Limits": {
				"MemoryBytes": 524288000.0
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
