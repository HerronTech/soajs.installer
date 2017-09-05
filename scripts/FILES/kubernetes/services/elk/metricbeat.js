/**
 * Created by ragheb on 4/27/17.
 */
'use strict';
var gConfig = require("../../config.js");

var namespace = gConfig.kubernetes.config.namespaces.default;
if (gConfig.kubernetes.config.namespaces.perService) {
	namespace += '-soajs-analytics-elasticsearch-service';
}

var components = {
	deployment: {
		"apiVersion": "extensions/v1beta1",
		"kind": "DaemonSet",
		"metadata": {
			"name": "soajs-metricbeat",
			"labels": {
				"soajs.content": "true",
				"soajs.service.group": "elk",
				"soajs.service.type": "system",
				"soajs.service.subtype": "metricbeat",
				"soajs.service.name": "soajs-metricbeat",
				"soajs.service.label": "soajs-metricbeat",
				"soajs.service.mode": "daemonset"
			}
		},
		"spec": {
			"selector": {
				"matchLabels": {
					"soajs.service.label": "soajs-metricbeat"
				}
			},
			"template": {
				"metadata": {
					"name": "soajs-metricbeat",
					"labels": {
						"soajs.content": "true",
						"soajs.service.group": "elk",
						"soajs.service.type": "system",
						"soajs.service.subtype": "metricbeat",
						"soajs.service.name": "soajs-metricbeat",
						"soajs.service.label": "soajs-metricbeat",
						"soajs.service.mode": "daemonset"
					}
				},
				"spec": {
					"containers": [
						{
							"name": "soajs-metricbeat",
							"image":  gConfig.imagePrefix + "/metricbeat",
							"imagePullPolicy": gConfig.imagePullPolicy,
							"env": [
								{
									"name": "ELASTICSEARCH_URL",
									"value": "soajs-analytics-elasticsearch-service." + namespace + ":9200" //add namespace
								}
							],
							"volumeMounts": [
								{
									"mountPath":"/var/run/docker.sock",
									"name": "docker-sock"
								}
							]
						}
					],
					"volumes": [
						{
							"name": "docker-sock",
							"hostPath": {
								"path": "/var/run/docker.sock"
							}
						}
					]
				}
			}
		}
	}
};

module.exports = components;
