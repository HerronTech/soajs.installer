'use strict';

let dockerRestartPolicy = {
	"condition": "any", //none, on-failure, any
	"maxAttempts": 5
};
let dockerNetwork = 'soajsnet';

let recipeVolumes = [
	{
		docker: {
			volume: {
				"Type": "volume",
				"Source": "soajs_log_volume",
				"Target": "/var/log/soajs/"
			}
		},
		kubernetes: {
			volume: {
				"name": "soajs-log-volume",
				"hostPath": {
					"path": "/var/log/soajs/"
				}
			},
			volumeMount: {
				"mountPath": "/var/log/soajs/",
				"name": "soajs-log-volume"
			}
		}
	},
	{
		docker: {
			volume: {
				"Type": "bind",
				"ReadOnly": true,
				"Source": "/var/run/docker.sock",
				"Target": "/var/run/docker.sock"
			}
		}
	},
	{
		docker: {
			volume: {
				"Type": "volume",
				"Source": "soajs_certs_volume",
				"Target": "/var/certs/soajs/"
			}
		}
	}
];

let mongovolumes = [
	{
		docker: {
			volume: {
				"Type": "volume",
				"Source": "custom-mongo-volume",
				"Target": "/data/db/"
			}
		},
		kubernetes: {
			volume: {
				"name": "custom-mongo-volume",
				"hostPath": {
					"path": "/var/data/custom/db/"
				}
			},
			volumeMount: {
				"mountPath": "/var/data/db/",
				"name": "custom-mongo-volume"
			}
		}
	}
];

var catalogs = [
	{
		"name": "SOAJS Service Recipe",
		"type": "service",
		"subtype": "soajs",
		"description": "This recipe allows you to deploy a services built using the SOAJS framework",
		"locked": true,
        "restriction": {
            "deployment": [
                "container"
            ]
        },
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "soajs",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {},
				"readinessProbe": {
					"httpGet": {
						"path": "/heartbeat",
						"port": "maintenance"
					},
					"initialDelaySeconds": 5,
					"timeoutSeconds": 2,
					"periodSeconds": 5,
					"successThreshold": 1,
					"failureThreshold": 3
				},
				"restartPolicy": dockerRestartPolicy,
				"container": {
					"network": dockerNetwork, //container network for docker
					"workingDir": "/opt/soajs/deployer/" //container working directory
				},
				"voluming": JSON.parse(JSON.stringify(recipeVolumes))
			},
			"buildOptions": {
				"settings": {
					"accelerateDeployment": true
				},
				"env": {
					"SOAJS_DEPLOY_ACC" : {
						"type" : "static",
						"value" : "true"
					},
					"NODE_TLS_REJECT_UNAUTHORIZED": {
						"type": "static",
						"value": "0"
					},
					"NODE_ENV": {
						"type": "static",
						"value": "production"
					},
					"SOAJS_ENV": {
						"type": "computed",
						"value": "$SOAJS_ENV"
					},
					"SOAJS_PROFILE": {
						"type": "static",
						"value": "/opt/soajs/FILES/profiles/profile.js"
					},
					"SOAJS_SRV_AUTOREGISTERHOST": {
						"type": "static",
						"value": "true"
					},
					"SOAJS_SRV_MEMORY": {
						"type": "computed",
						"value": "$SOAJS_SRV_MEMORY"
					},
					"SOAJS_SRV_MAIN": {
						"type": "computed",
						"value": "$SOAJS_SRV_MAIN"
					},
					"SOAJS_DEPLOY_HA": {
						"type": "computed",
						"value": "$SOAJS_DEPLOY_HA"
					},
					"SOAJS_HA_NAME": {
						"type": "computed",
						"value": "$SOAJS_HA_NAME"
					},
					"SOAJS_NX_CONTROLLER_NB" : {
						"type" : "computed",
						"value" : "$SOAJS_NX_CONTROLLER_NB"
					},
					"SOAJS_NX_CONTROLLER_IP" : {
						"type" : "computed",
						"value" : "$SOAJS_NX_CONTROLLER_IP_N"
					},
					"SOAJS_NX_CONTROLLER_PORT" : {
						"type" : "computed",
						"value" : "$SOAJS_NX_CONTROLLER_PORT"
					}
				},
				"cmd": {
					"deploy": {
						"command": ["bash"],
						"args": [
							"-c",
							"let registryPort=$(($SOAJS_NX_CONTROLLER_PORT+1000))",
							"export SOAJS_REGISTRY_API=\"${SOAJS_NX_CONTROLLER_IP_1}:$registryPort\"",
							"node . -T service"
						]
					}
				}
			}
		}
	},
	
	{
		"name": "SOAJS Endpoint Recipe",
		"type": "service",
		"subtype": "soajs",
		"description": "This recipe allows you to deploy an endpoint built using the SOAJS API Builder",
		"locked": true,
		"restriction": {
			"deployment": [
				"container"
			]
		},
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "soajs",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {},
				"readinessProbe": {
					"httpGet": {
						"path": "/heartbeat",
						"port": "maintenance"
					},
					"initialDelaySeconds": 5,
					"timeoutSeconds": 2,
					"periodSeconds": 5,
					"successThreshold": 1,
					"failureThreshold": 3
				},
				"restartPolicy": dockerRestartPolicy,
				"container": {
					"network": dockerNetwork, //container network for docker
					"workingDir": "/opt/soajs/deployer/" //container working directory
				},
				"voluming": JSON.parse(JSON.stringify(recipeVolumes))
			},
			"buildOptions": {
				"settings": {
					"accelerateDeployment": true
				},
				"env": {
					"SOAJS_DEPLOY_ACC" : {
						"type" : "static",
						"value" : "true"
					},
					"NODE_TLS_REJECT_UNAUTHORIZED": {
						"type": "static",
						"value": "0"
					},
					"NODE_ENV": {
						"type": "static",
						"value": "production"
					},
					"SOAJS_ENV": {
						"type": "computed",
						"value": "$SOAJS_ENV"
					},
					"SOAJS_PROFILE": {
						"type": "static",
						"value": "/opt/soajs/FILES/profiles/profile.js"
					},
					"SOAJS_SRV_AUTOREGISTERHOST": {
						"type": "static",
						"value": "true"
					},
					"SOAJS_SRV_MEMORY": {
						"type": "computed",
						"value": "$SOAJS_SRV_MEMORY"
					},
					"SOAJS_SRV_MAIN": {
						"type": "computed",
						"value": "$SOAJS_SRV_MAIN"
					},
					"SOAJS_DEPLOY_HA": {
						"type": "computed",
						"value": "$SOAJS_DEPLOY_HA"
					},
					"SOAJS_HA_NAME": {
						"type": "computed",
						"value": "$SOAJS_HA_NAME"
					},
					"SOAJS_NX_CONTROLLER_NB" : {
						"type" : "computed",
						"value" : "$SOAJS_NX_CONTROLLER_NB"
					},
					"SOAJS_NX_CONTROLLER_IP" : {
						"type" : "computed",
						"value" : "$SOAJS_NX_CONTROLLER_IP_N"
					},
					"SOAJS_NX_CONTROLLER_PORT" : {
						"type" : "computed",
						"value" : "$SOAJS_NX_CONTROLLER_PORT"
					},
					"SOAJS_ENDPOINT_NAME" : {
						"type" : "computed",
						"value" : "$SOAJS_SERVICE_NAME"
					}
				},
				"cmd": {
					"deploy": {
						"command": ["bash"],
						"args": [
							"-c",
							"let registryPort=$(($SOAJS_NX_CONTROLLER_PORT+1000))",
							"export SOAJS_REGISTRY_API=\"${SOAJS_NX_CONTROLLER_IP_1}:$registryPort\"",
							"node . -T service"
						]
					}
				}
			}
		}
	},

	{
		"name": "SOAJS API Gateway Recipe",
		"type": "service",
		"subtype": "soajs",
		"description": "This recipe allows you to deploy the SOAJS API Gateway",
		"locked": true,
        "restriction": {
            "deployment": [
                "container"
            ]
        },
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "soajs",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {},
				"readinessProbe": {
					"httpGet": {
						"path": "/heartbeat",
						"port": "maintenance"
					},
					"initialDelaySeconds": 5,
					"timeoutSeconds": 2,
					"periodSeconds": 5,
					"successThreshold": 1,
					"failureThreshold": 3
				},
				"restartPolicy": dockerRestartPolicy,
				"container": {
					"network": dockerNetwork, //container network for docker
					"workingDir": "/opt/soajs/deployer/" //container working directory
				},
				"voluming": JSON.parse(JSON.stringify(recipeVolumes))
			},
			"buildOptions": {
				"settings": {
					"accelerateDeployment": true
				},
				"env": {
					"SOAJS_DEPLOY_ACC" : {
						"type" : "static",
						"value" : "true"
					},
					"NODE_TLS_REJECT_UNAUTHORIZED": {
						"type": "static",
						"value": "0"
					},
					"NODE_ENV": {
						"type": "static",
						"value": "production"
					},
					"SOAJS_ENV": {
						"type": "computed",
						"value": "$SOAJS_ENV"
					},
					"SOAJS_PROFILE": {
						"type": "static",
						"value": "/opt/soajs/FILES/profiles/profile.js"
					},
					"SOAJS_SRV_AUTOREGISTERHOST": {
						"type": "static",
						"value": "true"
					},
					"SOAJS_SRV_MEMORY": {
						"type": "computed",
						"value": "$SOAJS_SRV_MEMORY"
					},
					"SOAJS_SRV_MAIN": {
						"type": "computed",
						"value": "$SOAJS_SRV_MAIN"
					},
					"SOAJS_DEPLOY_HA": {
						"type": "computed",
						"value": "$SOAJS_DEPLOY_HA"
					},
					"SOAJS_HA_NAME": {
						"type": "computed",
						"value": "$SOAJS_HA_NAME"
					},
					"SOAJS_MONGO_NB": {
						"type": "computed",
						"value": "$SOAJS_MONGO_NB"
					},
					"SOAJS_MONGO_PREFIX": {
						"type": "computed",
						"value": "$SOAJS_MONGO_PREFIX"
					},
					"SOAJS_MONGO_RSNAME": {
						"type": "computed",
						"value": "$SOAJS_MONGO_RSNAME"
					},
					"SOAJS_MONGO_AUTH_DB": {
						"type": "computed",
						"value": "$SOAJS_MONGO_AUTH_DB"
					},
					"SOAJS_MONGO_SSL": {
						"type": "computed",
						"value": "$SOAJS_MONGO_SSL"
					},
					"SOAJS_MONGO_IP": {
						"type": "computed",
						"value": "$SOAJS_MONGO_IP_N"
					},
					"SOAJS_MONGO_PORT": {
						"type": "computed",
						"value": "$SOAJS_MONGO_PORT_N"
					},
					"SOAJS_MONGO_USERNAME": {
						"type": "computed",
						"value": "$SOAJS_MONGO_USERNAME"
					},
					"SOAJS_MONGO_PASSWORD": {
						"type": "computed",
						"value": "$SOAJS_MONGO_PASSWORD"
					}
				},
				"cmd": {
					"deploy": {
						"command": ["bash"],
						"args": ["-c", "node index.js -T service"]
					}
				}
			}
		}
	},

	{
		"name": "SOAJS Daemon Recipe",
		"type": "daemon",
		"subtype": "soajs",
		"description": "This recipe allows you to deploy a daemons built using the SOAJS framework",
		"locked": true,
        "restriction": {
            "deployment": [
                "container"
            ]
        },
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "soajs",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {},
				"readinessProbe": {
					"httpGet": {
						"path": "/heartbeat",
						"port": "maintenance"
					},
					"initialDelaySeconds": 5,
					"timeoutSeconds": 2,
					"periodSeconds": 5,
					"successThreshold": 1,
					"failureThreshold": 3
				},
				"restartPolicy": dockerRestartPolicy,
				"container": {
					"network": dockerNetwork, //container network for docker
					"workingDir": "/opt/soajs/deployer/" //container working directory
				},
				"voluming": JSON.parse(JSON.stringify(recipeVolumes))
			},
			"buildOptions": {
				"settings": {
					"accelerateDeployment": true
				},
				"env": {
					"SOAJS_DEPLOY_ACC" : {
						"type" : "static",
						"value" : "true"
					},
					"NODE_TLS_REJECT_UNAUTHORIZED": {
						"type": "static",
						"value": "0"
					},
					"NODE_ENV": {
						"type": "static",
						"value": "production"
					},
					"SOAJS_ENV": {
						"type": "computed",
						"value": "$SOAJS_ENV"
					},
					"SOAJS_PROFILE": {
						"type": "static",
						"value": "/opt/soajs/FILES/profiles/profile.js"
					},
					"SOAJS_SRV_AUTOREGISTERHOST": {
						"type": "static",
						"value": "true"
					},
					"SOAJS_SRV_MEMORY": {
						"type": "computed",
						"value": "$SOAJS_SRV_MEMORY"
					},
					"SOAJS_SRV_MAIN": {
						"type": "computed",
						"value": "$SOAJS_SRV_MAIN"
					},
					"SOAJS_DAEMON_GRP_CONF": {
						"type": "computed",
						"value": "$SOAJS_DAEMON_GRP_CONF"
					},
					"SOAJS_DEPLOY_HA": {
						"type": "computed",
						"value": "$SOAJS_DEPLOY_HA"
					},
					"SOAJS_HA_NAME": {
						"type": "computed",
						"value": "$SOAJS_HA_NAME"
					},
					"SOAJS_MONGO_USERNAME": {
						"type": "computed",
						"value": "$SOAJS_MONGO_USERNAME"
					},
					"SOAJS_MONGO_PASSWORD": {
						"type": "computed",
						"value": "$SOAJS_MONGO_PASSWORD"
					},
					"SOAJS_MONGO_NB": {
						"type": "computed",
						"value": "$SOAJS_MONGO_NB"
					},
					"SOAJS_MONGO_PREFIX": {
						"type": "computed",
						"value": "$SOAJS_MONGO_PREFIX"
					},
					"SOAJS_MONGO_RSNAME": {
						"type": "computed",
						"value": "$SOAJS_MONGO_RSNAME"
					},
					"SOAJS_MONGO_AUTH_DB": {
						"type": "computed",
						"value": "$SOAJS_MONGO_AUTH_DB"
					},
					"SOAJS_MONGO_SSL": {
						"type": "computed",
						"value": "$SOAJS_MONGO_SSL"
					},
					"SOAJS_MONGO_IP": {
						"type": "computed",
						"value": "$SOAJS_MONGO_IP_N"
					},
					"SOAJS_MONGO_PORT": {
						"type": "computed",
						"value": "$SOAJS_MONGO_PORT_N"
					}
				},
				"cmd": {
					"deploy": {
						"command": ["bash"],
						"args": ["-c", "node index.js -T service"]
					}
				}
			}
		}
	},

	{
		"name": "Nginx Recipe",
		"type": "server",
		"subtype": "nginx",
		"description": "This recipe allows you to deploy an nginx server",
		"locked": true,
        "restriction": {
            "deployment": [
                "container"
            ]
        },
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "nginx",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {
					"configuration": {
						"label": "Attach Custom Configuration",
						"repo": "",
						"branch": "",
						"required": false
					},
					"custom": {
						"label": "Attach Custom UI",
						"repo": "",
						"branch": "",
						"type": "static",
						"required": false
					}
				},
				"readinessProbe": {
					"httpGet": {
						"path": "/",
						"port": "http"
					},
					"initialDelaySeconds": 5,
					"timeoutSeconds": 2,
					"periodSeconds": 5,
					"successThreshold": 1,
					"failureThreshold": 3
				},
				"restartPolicy": dockerRestartPolicy,
				"container": {
					"network": dockerNetwork, //container network for docker
					"workingDir": "/opt/soajs/deployer/" //container working directory
				},
				"voluming": JSON.parse(JSON.stringify(recipeVolumes)),
				"ports": [
					{
						"name": "http",
						"target": 80,
						"isPublished": true,
						"preserveClientIP": true
					},
					{
						"name": "https",
						"target": 443,
						"isPublished": true,
						"preserveClientIP": true
					}
				],
				"certificates": "optional"
			},
			"buildOptions": {
				"env": {
					"SOAJS_ENV": {
						"type": "computed",
						"value": "$SOAJS_ENV"
					},
					"SOAJS_EXTKEY": {
						"type": "computed",
						"value": "$SOAJS_EXTKEY"
					},
					"SOAJS_NX_DOMAIN": {
						"type": "computed",
						"value": "$SOAJS_NX_DOMAIN"
					},
					"SOAJS_NX_API_DOMAIN": {
						"type": "computed",
						"value": "$SOAJS_NX_API_DOMAIN"
					},
					"SOAJS_NX_SITE_DOMAIN": {
						"type": "computed",
						"value": "$SOAJS_NX_SITE_DOMAIN"
					},
					"SOAJS_NX_CONTROLLER_NB": {
						"type": "computed",
						"value": "$SOAJS_NX_CONTROLLER_NB"
					},
					"SOAJS_NX_CONTROLLER_IP": {
						"type": "computed",
						"value": "$SOAJS_NX_CONTROLLER_IP_N"
					},
					"SOAJS_NX_CONTROLLER_PORT": {
						"type": "computed",
						"value": "$SOAJS_NX_CONTROLLER_PORT"
					},
					"SOAJS_NX_REAL_IP": {
						"type": "static",
						"value": "true"
					},
					"SOAJS_DEPLOY_HA": {
						"type": "computed",
						"value": "$SOAJS_DEPLOY_HA"
					},
					"SOAJS_HA_NAME": {
						"type": "computed",
						"value": "$SOAJS_HA_NAME"
					}
				},
				"cmd": {
					"deploy": {
						"command": ["bash"],
						"args": ["-c", "node index.js -T nginx"]
					}
				}
			}
		}
	},

	{
		"name" : "Mongo Recipe",
		"type" : "cluster",
		"subtype" : "mongo",
		"description" : "This recipe allows you to deploy a mongo server",
		"locked" : true,
        "restriction": {
            "deployment": [
                "container"
            ]
        },
		"recipe" : {
			"deployOptions" : {
				"image" : {
					"prefix" : "",
					"name" : "mongo",
					"tag" : "3.4.10",
					"pullPolicy" : "IfNotPresent"
				},
				"sourceCode": {
					"configuration": {
						"label": "Attach Custom Configuration",
						"repo": "",
						"branch": "",
						"required": false
					}
				},
				"readinessProbe" : {
					"httpGet" : {
						"path" : "/",
						"port" : 27017
					},
					"initialDelaySeconds" : 5,
					"timeoutSeconds" : 2,
					"periodSeconds" : 5,
					"successThreshold" : 1,
					"failureThreshold" : 3
				},
				"restartPolicy" : dockerRestartPolicy,
				"container" : {
					"network" : "soajsnet",
					"workingDir" : ""
				},
				"voluming" : JSON.parse(JSON.stringify(mongovolumes)),
				"ports" : [
					{
						"name" : "mongo",
						"target" : 27017,
						"isPublished" : true
					}
				],
				"certificates": "optional"
			},
			"buildOptions" : {
				"env" : {

				},
				"cmd" : {
					"deploy" : {
						"command" : [
							"mongod"
						],
						"args" : [
							"--smallfiles"
						]
					}
				}
			}
		}
	},
];

module.exports = catalogs;
