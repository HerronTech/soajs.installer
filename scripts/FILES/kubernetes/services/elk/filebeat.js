/**
 * Created by ragheb on 1/17/17.
 */
'use strict';
'use strict';
var gConfig = require("../../config.js");

var components = {
	deployment: {
		"apiVersion": "extensions/v1beta1",
		"kind": "Deployment",
		"metadata": {
			"name": "filebeat",
			"labels": {
				"soajs.content": "true",
				"soajs.env.code": "dashboard",
				"soajs.service.type": "elk",
				"soajs.service.name": "dashboard-filebeat",
				"soajs.service.group": "elk",
				"soajs.service.label": "dashboard-filebeat",
				"soajs.service.mode": "daemonset"
			}
		},
		"spec": {
			"replicas": 1,
			"selector": {
				"matchLabels": {
					"soajs.service.label": "dashboard-filebeat"
				}
			},
			"template": {
				"metadata": {
					"name": "filebeat",
					"labels": {
						"soajs.content": "true",
						"soajs.env.code": "dashboard",
						"soajs.service.type": "elk",
						"soajs.service.name": "dashboard-filebeat",
						"soajs.service.group": "elk",
						"soajs.service.label": "dashboard-filebeat"
					}
				},
				"spec": {
					"containers": [
						{
							"name": "filebeat",
							"image": gConfig.imagePrefix + "/filebeat",
							"imagePullPolicy": "IfNotPresent",
							"command": [
								"/usr/share/filebeat/bin/filebeat",  "-e",  "-c", "/etc/filebeat/filebeat.yml"
							],
							"ports": [
								{
									
									"containerPort": 12201
								}
							],
							"env": [
								{
									"name": "SOAJS_ENV",
									"value": "dashboard"
								},
								{
									"name":"SOAJS_LOGSTASH_PORT" ,
									"value": "12201"
								},
								{
									"name":"SOAJS_LOGSTASH_HOST" ,
									"value": "dashboard-logstash-service"
								}
							],
							"volumeMounts": [
								{
									"mountPath": gConfig.kubernetes.volumes.log.path,
									"name": gConfig.kubernetes.volumes.log.label
								},
								{
									"mountPath": "/usr/share/filebeat/bin/data",
									"name": "soajs-filebeat"
								}
							]
						}
					],
					"volumes": [
						{
							"name": gConfig.kubernetes.volumes.log.label,
							"hostPath": {
								"path": gConfig.kubernetes.volumes.log.path
							}
						},
						{
							"name": "soajs-filebeat",
							"hostPath": {
								"path": "/usr/share/filebeat/bin/data"
							}
						}
					]
				}
			}
		}
	}
};

module.exports = components;
