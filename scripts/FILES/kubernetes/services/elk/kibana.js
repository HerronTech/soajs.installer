'use strict';
var config = require('../../config.js');
var components = {
	service: {
		"apiVersion": "v1",
		"kind": "Service",
		"metadata": {
			"name": "kibana",
			"labels": {
				"soajs.service.name": "kibana",
				"soajs.service.group": "elk",
				"soajs.service.type": "elk",
				"soajs.service.label": "kibana"
			}
		},
		"spec": {
			"type": "NodePort",
			"selector": {
				"soajs.service.label": "kibana"
			},
			"ports": [
				{
					"protocol": "TCP",
					"port": 32601,
					"targetPort": 5601,
					"nodePort": 32601
				}
			]
		}
	},
	deployment: {
		"apiVersion": "extensions/v1beta1",
		"kind": "Deployment",
		"metadata": {
			"name": "kibana",
			"labels": {
				"soajs.service.name": "kibana",
				"soajs.service.group": "elk",
				"soajs.service.type": "elk",
				"soajs.service.label": "kibana"
			}
		},
		"spec": {
			"replicas": 1,
			"selector": {
				"matchLabels": {
					"soajs.service.label": "kibana"
				}
			},
			"template": {
				"metadata": {
					"name": "kibana",
					"labels": {
						"soajs.service.name": "kibana",
						"soajs.service.group": "elk",
						"soajs.service.label": "kibana",
						"soajs.service.type": "elk"
					}
				},
				"spec": {
					"containers": [
						{
							"name": "kibana",
							"image": "kibana:4.6.4",
							"imagePullPolicy": "IfNotPresent",
							"command": ["kibana"],
							"ports": [
								{
									"containerPort": 5601
								}
							],
							"env": []
						}
					]
				}
			}
		}
	}
};

if (process.SOAJS_ELASTIC_EXTERNAL) {
	if (config.elasticsearch && config.elasticsearch.servers && config.elasticsearch.servers[0].host && config.elasticsearch.servers[0].port) {
		components.deployment.spec.template.spec.containers[0].env.push(
			{
				"name": "ELASTICSEARCH_URL",
				"value": "http://" + config.elasticsearch.servers[0].host + ":" + config.elasticsearch.servers[0].port
			}
		);
	}
	if (config.elasticsearch && config.elasticsearch.credentials && config.elasticsearch.credentials.username) {
		components.deployment.spec.template.spec.containers[0].env.push(
			{
				"name": "ELASTICSEARCH_USERNAME",
				"value": config.elasticsearch.credentials.username
			}
		);
	}
	if (config.elasticsearch && config.credentials.servers && config.elasticsearch.credentials.password ) {
		components.deployment.spec.template.spec.containers[0].env.push(
			{
				"name": "ELASTICSEARCH_PASSWORD",
				"value": config.elasticsearch.credentials.password
			}
		);
	}
	if (config.elasticsearch && config.extraParam.servers && config.elasticsearch.extraParam.requestTimeout ) {
		components.deployment.spec.template.spec.containers[0].env.push(
			{
				"name": "ELASTICSEARCH_REQUESTTIMEOUT",
				"value": config.elasticsearch.extraParam.requestTimeout
			}
		);
	}
}


module.exports = components;
