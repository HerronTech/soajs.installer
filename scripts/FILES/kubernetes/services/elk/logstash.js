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
			"name": "dashboard-logstash-service",
			"labels": {
				"soajs.content": "true",
				"soajs.env.code": "dashboard",
				"soajs.service.name": "dashboard-logstash",
				"soajs.service.group": "soajs-analytics",
				"soajs.service.type": "system",
				"soajs.service.subtype": "logstash",
				"soajs.service.label": "dashboard-logstash",
				"soajs.service.mode": "deployment"
			}
		},
		"spec": {
			"selector": {
				"soajs.service.label": "dashboard-logstash"
			},
			"ports": [
				{
					"port": 12201,
					"targetPort": 12201
				}
			]
		}
	},
	deployment: {
		"apiVersion": "extensions/v1beta1",
		"kind": "Deployment",
		"metadata": {
			"name": "dashboard-logstash",
			"labels": {
				"soajs.content": "true",
				"soajs.env.code": "dashboard",
				"soajs.service.type": "system",
				"soajs.service.subtype": "logstash",
				"soajs.service.name": "dashboard-logstash",
				"soajs.service.group": "soajs-analytics",
				"soajs.service.label": "dashboard-logstash",
				"soajs.service.mode": "deployment"
			}
		},
		"spec": {
			"replicas": gConfig.kubernetes.replicas,
			"selector": {
				"matchLabels": {
					"soajs.service.label": "dashboard-logstash"
				}
			},
			"template": {
				"metadata": {
					"name": "dashboard-logstash",
					"labels": {
						"soajs.content": "true",
						"soajs.env.code": "dashboard",
						"soajs.service.type": "system",
						"soajs.service.subtype": "logstash",
						"soajs.service.name": "dashboard-logstash",
						"soajs.service.group": "soajs-analytics",
						"soajs.service.label": "dashboard-logstash",
						"soajs.service.mode": "deployment"
					}
				},
				"spec": {
					"containers": [
						{
							"name": "dashboard-logstash",
							"image": gConfig.imagePrefix + "/logstash",
							"imagePullPolicy": gConfig.imagePullPolicy,
							"command": [
								"bash",
								"-c",
								"logstash -f /usr/share/logstash/config/logstash.conf"
							],
							"ports": [],
							"env": [
								{
									"name": "ELASTICSEARCH_URL",
									"value": "soajs-analytics-elasticsearch-service." + namespace + ":9200"
								}
							]
						}
					]
				}
			}
		}
	}
};

module.exports = components;
