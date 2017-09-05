'use strict';
var gConfig = require("../../config.js");

var namespace = gConfig.kubernetes.config.namespaces.default;
if (gConfig.kubernetes.config.namespaces.perService) {
	namespace += '-soajs-analytics-elasticsearch-service';
}
var components = {
	service: {
		"apiVersion": "v1",
		"kind": "Service",
		"metadata": {
			"name": "kibana-service",
			"labels": {
				"soajs.content": "true",
				"soajs.service.name": "kibana",
				"soajs.service.group": "elk",
				"soajs.service.type": "system",
				"soajs.service.subtype": "kibana",
				"soajs.service.label": "kibana",
				"soajs.service.mode": "deployment"
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
				"soajs.content": "true",
				"soajs.service.name": "kibana",
				"soajs.service.group": "elk",
				"soajs.service.type": "system",
				"soajs.service.subtype": "kibana",
				"soajs.service.label": "kibana",
				"soajs.service.mode": "deployment"
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
						"soajs.content": "true",
						"soajs.service.name": "kibana",
						"soajs.service.group": "elk",
						"soajs.service.type": "system",
						"soajs.service.subtype": "kibana",
						"soajs.service.label": "kibana",
						"soajs.service.mode": "deployment"
					}
				},
				"spec": {
					"containers": [
						{
							"name": "kibana",
							"image": gConfig.imagePrefix + "/kibana",
							"imagePullPolicy": gConfig.imagePullPolicy,
							"ports": [
								{
									"containerPort": 5601
								}
							],
							"env": [
								{
									"name": "ELASTICSEARCH_URL",
									"value": "http://soajs-analytics-elasticsearch-service." + namespace + ":9200"
								}
							]
						}
					]
				}
			}
		}
	}
};

// if (process.SOAJS_ELASTIC_EXTERNAL) {
// 	if (config.elasticsearch && config.elasticsearch.servers && config.elasticsearch.servers[0].host && config.elasticsearch.servers[0].port) {
// 		components.deployment.spec.template.spec.containers[0].env.push(
// 			{
// 				"name": "ELASTICSEARCH_URL",
// 				"value": "http://" + config.elasticsearch.servers[0].host + ":" + config.elasticsearch.servers[0].port
// 			}
// 		);
// 	}
// 	if (config.elasticsearch && config.elasticsearch.credentials && config.elasticsearch.credentials.username) {
// 		components.deployment.spec.template.spec.containers[0].env.push(
// 			{
// 				"name": "ELASTICSEARCH_USERNAME",
// 				"value": config.elasticsearch.credentials.username
// 			}
// 		);
// 	}
// 	if (config.elasticsearch && config.credentials.servers && config.elasticsearch.credentials.password ) {
// 		components.deployment.spec.template.spec.containers[0].env.push(
// 			{
// 				"name": "ELASTICSEARCH_PASSWORD",
// 				"value": config.elasticsearch.credentials.password
// 			}
// 		);
// 	}
// 	if (config.elasticsearch && config.extraParam.servers && config.elasticsearch.extraParam.requestTimeout ) {
// 		components.deployment.spec.template.spec.containers[0].env.push(
// 			{
// 				"name": "ELASTICSEARCH_REQUESTTIMEOUT",
// 				"value": config.elasticsearch.extraParam.requestTimeout
// 			}
// 		);
// 	}
// }


module.exports = components;
