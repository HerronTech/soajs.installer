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
                "soajs.service.group": "nginx",
				"soajs.service.type": "nginx",
				"soajs.service.label": "dashboard-nginx",
				"soajs.service.mode": "deployment"
			}
		},
		"spec": {
			"type": "NodePort",
			"selector": {
				"soajs.service.label": "dashboard-nginx"
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
				"soajs.content": "true",
				"soajs.env.code": "dashboard",

                "soajs.service.name": "nginx",
                "soajs.service.group": "nginx",
				"soajs.service.type": "nginx",
				"soajs.service.label": "dashboard-nginx",
				"soajs.service.mode": "deployment"
			}
		},
		"spec": {
			"replicas": gConfig.kubernetes.replicas,
			"selector": {
				"matchLabels": {
					"soajs.service.label": "dashboard-nginx"
				}
			},
			"template": {
				"metadata": {
					"name": "dashboard-nginx",
					"labels": {
						"soajs.content": "true",
						"soajs.env.code": "dashboard",

		                "soajs.service.name": "nginx",
		                "soajs.service.group": "nginx",
						"soajs.service.type": "nginx",
						"soajs.service.label": "dashboard-nginx",
						"soajs.service.mode": "deployment"
					}
				},
				"spec": {
					"containers": [
						{
							"name": "dashboard-nginx",
							"image": gConfig.imagePrefix + "/nginx",
							"imagePullPolicy": gConfig.imagePullPolicy,
							"workingDir": "/opt/soajs/FILES/deployer/",
							"command": ["./soajsDeployer.sh"],
							"args": ["-T", "nginx", "-X", "deploy"],
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
									"name": "SOAJS_GIT_DASHBOARD_BRANCH",
									"value": gConfig.git.branch
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

if (gConfig.customUISrc.repo && gConfig.customUISrc.owner) {
	components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_GIT_REPO", "value": gConfig.customUISrc.repo});
	components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_GIT_OWNER", "value": gConfig.customUISrc.owner});

	if(gConfig.customUISrc.branch){
		components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_GIT_BRANCH", "value": gConfig.customUISrc.branch});
	}
}

if(process.env.SOAJS_GIT_PROVIDER){
	components.deployment.spec.template.spec.containers[0].args.push("-G");
	components.deployment.spec.template.spec.containers[0].args.push(process.env.SOAJS_GIT_PROVIDER);
}

if(process.env.SOAJS_GIT_SOURCE){
	components.deployment.spec.template.spec.containers[0].args.push("-g");
	components.deployment.spec.template.spec.containers[0].args.push(process.env.SOAJS_GIT_SOURCE);
}

if (gConfig.customUISrc.token) {
	components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_GIT_TOKEN", "value": gConfig.customUISrc.token});
}

if () { //TODO: set condition if nginx SSL is activated
	components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_NX_API_HTTPS", "value": "1"});
	components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_NX_API_HTTP_REDIRECT", "value": "1"});
	components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_NX_SITE_HTTPS", "value": "1"});
	components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_NX_SITE_HTTP_REDIRECT", "value": "1"});

	if () { //TODO: set condition if custom nginx SSL certificates is activated
		components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_NX_CUSTOM_SSL", "value": "1"});
		components.deployment.spec.template.spec.containers[0].env.push({"name": "SOAJS_NX_SSL_CERTS_LOCATION", "value": "/etc/ssl"});

		components.deployment.spec.volumes.push({
			name: 'ssl',
			secret: {
				secretName: '' //TODO: set secret name here
			}
		});

		components.deployment.spec.template.spec.containers[0].volumeMounts.push({
			name: 'ssl',
			mountPath: '/etc/ssl',
			readOnly: true
		});
	}
}

module.exports = components;
