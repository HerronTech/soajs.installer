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
				"soajs.service.type": "elk",
				"soajs.service.name": "soajs-metricbeat",
				"soajs.service.group": "elk",
				"soajs.service.label": "soajs-metricbeat",
				"soajs.service.mode": "daemonset"
			}
		},
		"spec": {
			"replicas": 1,
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
						"soajs.service.type": "elk",
						"soajs.service.name": "soajs-metricbeat",
						"soajs.service.group": "elk",
						"soajs.service.label": "soajs-metricbeat"
					}
				},
				"spec": {
					"containers": [
						{
							"name": "soajs-metricbeat",
							"image":  gConfig.imagePrefix + "/metricbeat",
							"imagePullPolicy": "IfNotPresent",
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
