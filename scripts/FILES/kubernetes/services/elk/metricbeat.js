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
		"kind": "Deployment",
		"metadata": {
			"name": "metricbeat-docker",
			"labels": {
				"soajs.content": "true",
				"soajs.env.code": "dashboard",
				"soajs.service.type": "elk",
				"soajs.service.name": "dashboard-metricbeat",
				"soajs.service.group": "elk",
				"soajs.service.label": "dashboard-metricbeat",
				"soajs.service.mode": "deployment"
			}
		},
		"spec": {
			"replicas": 1,
			"selector": {
				"matchLabels": {
					"soajs.service.label": "dashboard-metricbeat"
				}
			},
			"template": {
				"metadata": {
					"name": "dashboard-metricbeat",
					"labels": {
						"soajs.content": "true",
						"soajs.env.code": "dashboard",
						"soajs.service.type": "elk",
						"soajs.service.name": "dashboard-metricbeat",
						"soajs.service.group": "elk",
						"soajs.service.label": "dashboard-metricbeat"
					}
				},
				"spec": {
					"containers": [
						{
							"name": "dashboard-metricbeat",
							"image": "metricbeat-docker",
							"imagePullPolicy": "IfNotPresent",
							"env": [
								{
									"name": "SOAJS_ENV",
									"value": "dashboard"
								},
								{
									"name": "ELASTICSEARCH_URL",
									"value": "soajs-analytics-elasticsearch-service." + namespace + ":9200" //add namespace
								}
							],
							"volumeMounts": [
								{
									"mountPath":"/var/run/docker.sock",
									"name": "docker-sock"
								},
								// {
								// 	"mountPath":"/proc",
								// 	"name": "proc"
								// },
								// {
								// 	"mountPath":"/sys/fs/cgroup",
								// 	"name": "cgroups"
								// }
							]
						}
					],
					//source
					"volumes": [
						{
							"name": "docker-sock",
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
						// {
						// 	"name": "cgroups",
						// 	"hostPath": {
						// 		"path": "/hostfs/sys/fs/cgroup"
						// 	}
						// }
					]
				}
			}
		}
	}
};

module.exports = components;
