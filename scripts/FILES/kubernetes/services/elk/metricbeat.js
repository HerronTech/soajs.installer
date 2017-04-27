/**
 * Created by ragheb on 4/27/17.
 */
'use strict';
var gConfig = require("../../config.js");

var components = {
	deployment: {
		"apiVersion": "extensions/v1beta1",
		"kind": "Deployment",
		"metadata": {
			"name": "metricbeat",
			"labels": {
				"soajs.content": "true",
				"soajs.env.code": "dashboard",
				"soajs.service.type": "elk",
				"soajs.service.name": "metricbeat",
				"soajs.service.group": "elk",
				"soajs.service.label": "metricbeat"
			}
		},
		"spec": {
			"replicas": 1,
			"selector": {
				"matchLabels": {
					"soajs.service.label": "metricbeat"
				}
			},
			"template": {
				"metadata": {
					"name": "metricbeat",
					"labels": {
						"soajs.content": "true",
						"soajs.env.code": "dashboard",
						"soajs.service.type": "elk",
						"soajs.service.name": "metricbeat",
						"soajs.service.group": "elk",
						"soajs.service.label": "metricbeat"
					}
				},
				"spec": {
					"containers": [
						{
							"name": "metricbeat",
							"image": "metricbeat-docker",
							"imagePullPolicy": "IfNotPresent",
							"env": [
								{
									"name": "SOAJS_ENV",
									"value": "dashboard"
								},
								{
									"name": "ELASTICSEARCH_URL",
									"value": "elasticsearch:9200"
								}
							],
							"volumeMounts": [
								{
									"mountPath":"/var/run/docker.sock",
									"name": "docker-dock"
								},
								// {
								// 	"mountPath":"/proc",
								// 	"name": "proc"
								// },
								{
									"mountPath":"/sys/fs/cgroup",
									"name": "cgroups"
								}
							]
						}
					],
					//source
					"volumes": [
						{
							"name": "docker-dock",
							"hostPath": {
								"path": "/var/run/docker.sock"
							}
						},
						// {
						// 	"name": "proc",
						// 	"hostPath": {
						// 		"path": "/hostfs/proc"
						// 	}
						// },
						{
							"name": "cgroups",
							"hostPath": {
								"path": "/hostfs/sys/fs/cgroup"
							}
						}
					]
				}
			}
		}
	}
};

module.exports = components;
