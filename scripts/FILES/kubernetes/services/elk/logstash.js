'use strict';
var gConfig = require("../../config.js");

var components = {
	service: {
		"apiVersion": "v1",
		"kind": "Service",
		"metadata": {
			"name": "dashboard-logstash",
			"labels": {
				"soajs.content": "true",
				"soajs.env.code": "dashboard",
				"soajs.service.name": "dashboard-logstash",
				"soajs.service.group": "elk",
				"soajs.service.label": "dashboard-logstash"
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
				"soajs.service.type": "elk",
				"soajs.service.name": "dashboard-logstash",
				"soajs.service.group": "elk",
				"soajs.service.label": "dashboard-logstash"
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
						"soajs.service.type": "elk",
						"soajs.service.name": "dashboard-logstash",
						"soajs.service.group": "elk",
						"soajs.service.label": "dashboard-logstash"
					}
				},
				"spec": {
					"containers": [
						{
							"name": "dashboard-logstash",
							"image": gConfig.imagePrefix + "/logstash",
							"imagePullPolicy": "IfNotPresent",
							"command": [
								"bash",
								"-c",
								"chown logstash:logstash /conf/logstash.conf; logstash -f /conf/logstash.conf"
							],
							"ports": []
						}
					]
				}
			}
		}
	}
};

module.exports = components;
