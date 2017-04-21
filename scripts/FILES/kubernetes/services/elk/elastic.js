'use strict';

var gConfig = require("../../config.js");
var components = {
	service: {
		"apiVersion": "v1",
		"kind": "Service",
		"metadata": {
			"name": "elasticsearch",
			"labels": {
				"soajs.service.type": "database",
				"soajs.service.name": "elasticsearch",
				"soajs.service.group": "elk",
				"soajs.service.label": "elasticsearch"
			}
		},
		"spec": {
			"type": "NodePort",
			"selector": {
				"soajs.service.label": "elasticsearch"
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
			"name": "elasticsearch",
			"labels": {
				"soajs.service.type": "database",
				"soajs.service.name": "elasticsearch",
				"soajs.service.group": "elk",
				"soajs.service.label": "elasticsearch"
			}
		},
		"spec": {
			"replicas": 1,
			"selector": {
				"matchLabels": {
					"soajs.service.label": "elasticsearch"
				}
			},
			"template": {
				"metadata": {
					"name": "elasticsearch",
					"labels": {
						"soajs.service.type": "database",
						"soajs.service.name": "elasticsearch",
						"soajs.service.group": "elk",
						"soajs.service.label": "elasticsearch"
					}
				},
				"spec": {
					"containers": [
						{
							"name": "elasticsearch",
							"image": "elasticsearch:5.3.0",
							"imagePullPolicy": "IfNotPresent",
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
