'use strict';
var gConfig = require("../../config.js");

var components = {
	service: {
		"apiVersion": "v1",
		"kind": "Service",
		"metadata": {
			"name": "dashboard-nginx-service",
			"labels": {
				"type": "soajs-service"
			}
		},
		"spec": {
			"type": "NodePort",
			"selector": {
				"soajs-app": "dashboard-nginx"
			},
			"ports": [
				{
					"protocol": "TCP",
					"port": 80,
					"targetPort": 80,
					"nodePort": (30000 + gConfig.nginx.port.http)
				}
			]
		}
	},
	deployment: {
		"apiVersion": "extensions/v1beta1",
		"kind": "Deployment",
		"metadata": {
			"name": "dashboard-nginx",
			"labels": {
				"soajs.service.group": "nginx",
				"soajs.service": "nginx",
				"soajs.env": "dashboard"
			}
		},
		"spec": {
			"replicas": gConfig.kubernetes.replicas,
			"selector": {
				"matchLabels": {
					"soajs-app": "dashboard-nginx"
				}
			},
			"template": {
				"metadata": {
					"name": "dashboard-nginx",
					"labels": {
						"soajs-app": "dashboard-nginx"
					}
				},
				"spec": {
					"containers": [
						{
							"name": "dashboard-nginx",
							"image": gConfig.imagePrefix + "/nginx",
							"workingDir": "/opt/soajs/FILES/deployer/",
							"command": ["./soajsDeployer.sh"],
							"args": ["-T", "nginx", "-X", "deploy"],
							"ports": [
								{
									"containerPort": gConfig.nginx.port.http
								}
							],
							"env": [
								{
									"name": "SOAJS_ENV",
									"value": "dashboard"
								},
								{
									"name": "SOAJS_GIT_DASHBOARD_BRANCH",
									"value": gConfig.git.branch
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
									"value": "dashboard-controller-service"
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
							]
						}
					]
				}
			}
		}
	}
};

module.exports = components;
