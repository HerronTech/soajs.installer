'use strict';

var gConfig = require("../../config.js");

var annotation = [
	{
		"name": "sysctl",
		"image": "busybox",
		"imagePullPolicy": "IfNotPresent",
		"command": ["sysctl", "-w", "vm.max_map_count=262144"],
		"securityContext": {
			"privileged": true
		}
	}
];
var components = {
	service: {
		"apiVersion": "v1",
		"kind": "Service",
		"metadata": {
			"name": "soajs-analytics-elasticsearch-service",
			"labels": {
				"soajs.content": "true",
				"soajs.service.type": "cluster",
				"soajs.service.subtype": "elasticsearch",
				"soajs.service.name": "soajs-analytics-elasticsearch",
				"soajs.service.group": "elk",
				"soajs.service.label": "soajs-analytics-elasticsearch",
				"soajs.service.mode": "deployment"
				
			}
		},
		"spec": {
			"type": "NodePort",
			"selector": {
				"soajs.service.label": "soajs-analytics-elasticsearch"
			},
			"ports": [
				{
					"protocol": "TCP",
					"port": 9200,
					"targetPort": 9200,
					"nodePort": 30920
				}
			]
		}
	},
	deployment: {
		"apiVersion": "extensions/v1beta1",
		"kind": "Deployment",
		"metadata": {
			"name": "soajs-analytics-elasticsearch",
			"labels": {
				"soajs.content": "true",
				"soajs.service.type": "cluster",
				"soajs.service.subtype": "elasticsearch",
				"soajs.service.name": "soajs-analytics-elasticsearch",
				"soajs.service.group": "elk",
				"soajs.service.label": "soajs-analytics-elasticsearch",
				"soajs.service.mode": "deployment"
			}
		},
		"spec": {
			"replicas": 1,
			"selector": {
				"matchLabels": {
					"soajs.service.label": "soajs-analytics-elasticsearch"
				}
			},
			"template": {
				"metadata": {
					"name": "soajs-analytics-elasticsearch",
					"labels": {
						"soajs.content": "true",
						"soajs.service.type": "cluster",
						"soajs.service.subtype": "elasticsearch",
						"soajs.service.name": "soajs-analytics-elasticsearch",
						"soajs.service.group": "elk",
						"soajs.service.label": "soajs-analytics-elasticsearch",
						"soajs.service.mode": "deployment"
					},
					"annotations": {
						"pod.beta.kubernetes.io/init-containers": JSON.stringify(annotation)
					}
				},
				"spec": {
					"containers": [
						{
							"name": "soajs-analytics-elasticsearch",
							"image": "elasticsearch",
							"imagePullPolicy": gConfig.imagePullPolicy,
							 "ports": [
								{
									
									"containerPort": 9200
								}
							],
							"volumeMounts": [
								{
									"mountPath": '/usr/share/elasticsearch/data',
									"name": "elasticsearch-volume"
								}
							]
						}
					],
					"volumes": [
						{
							"name": "elasticsearch-volume",
							"hostPath": {
								"path":  '/usr/share/elasticsearch/data'
							}
						}
					]
				}
			}
		}
	}
};

module.exports = components;
