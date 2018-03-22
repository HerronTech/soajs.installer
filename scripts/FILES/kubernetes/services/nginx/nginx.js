'use strict';
var gConfig = require("../../config.js");

//setting controller domain name per namespace
var namespace = gConfig.kubernetes.config.namespaces.default;
if (gConfig.kubernetes.config.namespaces.perService) {
	namespace += '-dashboard-controller-v1';
}

var components = {
	service: {
		"apiVersion": "v1",
		"kind": "Service",
		"metadata": {
			"name": "dashboard-nginx-service",
			"labels": {
				"soajs.content": "true",
				"soajs.env.code": "dashboard",

                "soajs.service.name": "nginx",
                "soajs.service.group": "soajs-nginx",
				"soajs.service.type": "server",
				"soajs.service.subtype": "nginx",
				"soajs.service.label": "dashboard-nginx",
				"soajs.service.mode": "daemonset"
			}
		},
		"spec": {
			"type": "NodePort",
			"externalTrafficPolicy": "Local",
			"selector": {
				"soajs.service.label": "dashboard-nginx"
			},
			"ports": [
				{
					"name": "http",
					"protocol": "TCP",
					"port": 80,
					"targetPort": 80,
					"nodePort": gConfig.nginx.port.http
				},
				{
					"name": "https",
					"protocol": "TCP",
					"port": 443,
					"targetPort": 443,
					"nodePort": gConfig.nginx.port.https
				}
			]
		}
	},
	deployment: {
		"apiVersion": "extensions/v1beta1",
		"kind": "DaemonSet",
		"metadata": {
			"name": "dashboard-nginx",
			"labels": {
				"soajs.content": "true",
				"soajs.env.code": "dashboard",

                "soajs.service.name": "nginx",
				"soajs.service.group": "soajs-nginx",
				"soajs.service.type": "server",
				"soajs.service.subtype": "nginx",
				"soajs.service.label": "dashboard-nginx",
				"soajs.service.mode": "daemonset"
			}
		},
		"spec": {
			"revisionHistoryLimit": 2,
			"replicas": gConfig.kubernetes.replicas,
			"selector": {
				"matchLabels": {
					"soajs.service.label": "dashboard-nginx"
				}
			},
			"updateStrategy": {
				"type": "RollingUpdate"
			},
			"template": {
				"metadata": {
					"name": "dashboard-nginx",
					"labels": {
						"soajs.content": "true",
						"soajs.env.code": "dashboard",

		                "soajs.service.name": "nginx",
						"soajs.service.group": "soajs-nginx",
						"soajs.service.type": "server",
						"soajs.service.subtype": "nginx",
						"soajs.service.label": "dashboard-nginx",
						"soajs.service.mode": "daemonset"
					}
				},
				"spec": {
					"containers": [
						{
							"name": "dashboard-nginx",
							"image": gConfig.images.nginx.prefix + "/nginx:" + gConfig.images.nginx.tag,
							"imagePullPolicy": gConfig.imagePullPolicy,
							"workingDir": "/opt/soajs/deployer/",
							"command": ["node"],
							"args": ["index.js", "-T", "nginx"],
                            "ports": [
                                {
                                    "name": "http",
                                    "containerPort": 80
                                },
                                {
                                    "name": "https",
                                    "containerPort": 443
                                }
                            ],
                            "readinessProbe": {
                                "httpGet": {
                                    "path": "/",
                                    "port": "http"
                                },
                                "initialDelaySeconds": gConfig.kubernetes.readinessProbe.initialDelaySeconds,
                                "timeoutSeconds": gConfig.kubernetes.readinessProbe.timeoutSeconds,
                                "periodSeconds": gConfig.kubernetes.readinessProbe.periodSeconds,
                                "successThreshold": gConfig.kubernetes.readinessProbe.successThreshold,
                                "failureThreshold": gConfig.kubernetes.readinessProbe.failureThreshold
                            },
							"env": [
								{
									"name": "SOAJS_ENV",
									"value": "dashboard"
								},
								{
									"name": "SOAJS_EXTKEY",
									"value": gConfig.extKey1
								},
								{
									"name": "SOAJS_GIT_DASHBOARD_BRANCH",
									"value": gConfig.dashUISrc.branch
								},
								{
									"name": "SOAJS_NX_DOMAIN",
									"value": gConfig.masterDomain
								},
								{
									"name": "SOAJS_NX_API_DOMAIN",
									"value": gConfig.apiPrefix + "." + gConfig.masterDomain
								},
								{
									"name": "SOAJS_NX_SITE_DOMAIN",
									"value": gConfig.sitePrefix + "." + gConfig.masterDomain
								},
								{
									"name": "SOAJS_NX_CONTROLLER_NB",
									"value": "" + gConfig.kubernetes.replicas
								},
								{
									"name": "SOAJS_NX_CONTROLLER_IP_1",
									"value": "dashboard-controller-v1-service." + namespace
								},
								{
									"name": "SOAJS_NX_CONTROLLER_PORT_1",
									"value": "4000"
								},
								{
                                    "name": "SOAJS_DEPLOY_HA",
                                    "value": "kubernetes"
                                },
                                {
                                    "name": "SOAJS_HA_IP",
                                    "valueFrom": {
                                        "fieldRef": {
                                            "fieldPath": "status.podIP"
                                        }
                                    }
                                },
                                {
                                    "name": "SOAJS_HA_NAME",
                                    "valueFrom": {
                                        "fieldRef": {
                                            "fieldPath": "metadata.name"
                                        }
                                    }
                                }
							],
                            "volumeMounts": [
                                {
                                    "mountPath": gConfig.kubernetes.volumes.log.path,
                                    "name": gConfig.kubernetes.volumes.log.label
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
                        }
                    ]
				}
			}
		}
	}
};

if(gConfig.nginx.deployType === 'LoadBalancer'){
	components.service.spec.ports.forEach((onePort) => {
		delete onePort.nodePort;
	});
}

if (gConfig.nginx.ssl) {
	components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_NX_API_HTTPS", "value": "1"});
	components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_NX_API_HTTP_REDIRECT", "value": "1"});
	components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_NX_SITE_HTTPS", "value": "1"});
	components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_NX_SITE_HTTP_REDIRECT", "value": "1"});

	if (gConfig.nginx.sslSecret) {
		components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_NX_CUSTOM_SSL", "value": "1"});
		components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_NX_SSL_CERTS_LOCATION", "value": "/etc/soajs/ssl"});
		components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_NX_SSL_SECRET", "value": gConfig.nginx.sslSecret});

		components.deployment.spec.template.spec.volumes.push({
			name: 'ssl',
			secret: {
				secretName: gConfig.nginx.sslSecret
			}
		});

		components.deployment.spec.template.spec.containers[0].volumeMounts.push({
			name: 'ssl',
			mountPath: '/etc/soajs/ssl/',
			readOnly: true
		});
	}
}

module.exports = components;
