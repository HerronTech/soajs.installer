'use strict';

let dockerDefaultVoluming = {
	"volumes": [
		{
			"Type": "volume",
			"Source": "soajs_log_volume",
			"Target": "/var/log/soajs/"
		},
		{
			"Type": "bind",
			"ReadOnly": true,
			"Source": "/var/run/docker.sock",
			"Target": "/var/run/docker.sock"
		},
		{
			"Type": "volume",
			"Source": "soajs_certs_volume",
			"Target": "/var/certs/soajs/"
		}
	]
};
let dockerMongoVoluming = {
	"volumes": [
		{
			"Type": "volume",
			"Source": "custom-mongo-volume",
			"Target": "/data/db/"
		}
	]
};
let dockerRestartPolicy = {
	"condition": "any", //none, on-failure, any
	"maxAttempts": 5
};
let dockerNetwork = 'soajsnet';

let kubernetesDefaultVoluming = {
	"volumes": [
		{
			"name": "soajs-log-volume",
			"hostPath": {
				"path": "/var/log/soajs/"
			}
		}
	],
	"volumeMounts": [
		{
			"mountPath": "/var/log/soajs/",
			"name": "soajs-log-volume"
		}
	]
};
let kubernetesMongoVoluming = {
	"volumes": [
		{
			"name": "custom-mongo-volume",
			"hostPath": {
				"path": "/data/custom/db/"
			}
		}
	],
	"volumeMounts": [
		{
			"mountPath": "/data/db/",
			"name": "custom-mongo-volume"
		}
	]
};

var catalogs = [
	{
		"name": "SOAJS Service Recipe - Docker",
		"type": "service",
		"subtype": "soajs",
		"description": "This recipe allows you to deploy a services that uses soajs in docker",
		"locked": true,
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "soajs",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
						"required": false
					}
				},
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
				"voluming": JSON.parse(JSON.stringify(dockerDefaultVoluming))
			},
			"buildOptions": {
				"settings": {
					"accelerateDeployment": true
				},
				"env": {
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
		"name": "SOAJS Service Recipe - Kubernetes",
		"type": "service",
		"subtype": "soajs",
		"description": "This recipe allows you to deploy a services that uses soajs in kubernetes",
		"locked": true,
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "soajs",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
						"required": false
					}
				},
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
				"restartPolicy": {},
				"container": {
					"network": '', //container network for docker
					"workingDir": "/opt/soajs/deployer/" //container working directory
				},
				"voluming": JSON.parse(JSON.stringify(kubernetesDefaultVoluming))
			},
			"buildOptions": {
				"settings": {
					"accelerateDeployment": true
				},
				"env": {
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
		"name": "SOAJS Controller Recipe - Docker",
		"type": "service",
		"subtype": "soajs",
		"description": "This recipe allows you to deploy a controller that uses soajs in docker",
		"locked": true,
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "soajs",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
						"required": false
					}
				},
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
				"voluming": JSON.parse(JSON.stringify(dockerDefaultVoluming))
			},
			"buildOptions": {
				"settings": {
					"accelerateDeployment": true
				},
				"env": {
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
		"name": "SOAJS Controller Recipe - Kubernetes",
		"type": "service",
		"subtype": "soajs",
		"description": "This recipe allows you to deploy a controller that uses soajs in kubernetes",
		"locked": true,
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "soajs",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
						"required": false
					}
				},
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
				"restartPolicy": {},
				"container": {
					"network": '', //container network for docker
					"workingDir": "/opt/soajs/deployer/" //container working directory
				},
				"voluming": JSON.parse(JSON.stringify(kubernetesDefaultVoluming))
			},
			"buildOptions": {
				"settings": {
					"accelerateDeployment": true
				},
				"env": {
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
		"name": "SOAJS Daemon Recipe - Docker",
		"type": "daemon",
		"subtype": "soajs",
		"description": "This recipe allows you to deploy a soajs daemons in docker",
		"locked": true,
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
				"voluming": JSON.parse(JSON.stringify(dockerDefaultVoluming))
			},
			"buildOptions": {
				"settings": {
					"accelerateDeployment": true
				},
				"env": {
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
		"name": "SOAJS Daemon Recipe - Kubernetes",
		"type": "daemon",
		"subtype": "soajs",
		"description": "This recipe allows you to deploy a soajs daemons in kubernetes",
		"locked": true,
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
				"restartPolicy": {},
				"container": {
					"network": '', //container network for docker
					"workingDir": "/opt/soajs/deployer/" //container working directory
				},
				"voluming": JSON.parse(JSON.stringify(kubernetesDefaultVoluming))
			},
			"buildOptions": {
				"settings": {
					"accelerateDeployment": true
				},
				"env": {
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
		"name": "Portal Nginx Recipe - Docker",
		"type": "server",
		"subtype": "nginx",
		"description": "This recipe allows you to deploy the portal nginx server that upstreams traffic to soajs in docker",
		"locked": true,
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "nginx",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
						"required": false
					},
					"custom": {
						"label": "Custom UI",
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
				"voluming": JSON.parse(JSON.stringify(dockerDefaultVoluming)),
				"ports": [
					{
						"name": "http",
						"target": 80,
						"isPublished": true,
						"published": 81,
						"preserveClientIP": true
					},
					{
						"name": "https",
						"target": 443,
						"isPublished": true,
						"published": 444,
						"preserveClientIP": true
					}
				]
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
		"name": "Portal Nginx Recipe - Kubernetes",
		"type": "server",
		"subtype": "nginx",
		"description": "This recipe allows you to deploy the portal nginx server that upstreams traffic to soajs in kubernetes",
		"locked": true,
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "nginx",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
						"required": false
					},
					"custom": {
						"label": "Custom UI",
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
				"restartPolicy": {},
				"container": {
					"network": '', //container network for docker
					"workingDir": "/opt/soajs/deployer/" //container working directory
				},
				"voluming": JSON.parse(JSON.stringify(kubernetesDefaultVoluming)),
				"ports": [
					{
						"name": "http",
						"target": 80,
						"isPublished": true,
						"published": 81,
						"preserveClientIP": true
					},
					{
						"name": "https",
						"target": 443,
						"isPublished": true,
						"published": 444,
						"preserveClientIP": true
					}
				]
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
					},
					"SOAJS_GIT_PORTAL_BRANCH": {
						"type": "static",
						"value": "master"
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
		"name": "Nginx Recipe - Docker",
		"type": "server",
		"subtype": "nginx",
		"description": "This recipe allows you to deploy an nginx server that upstreams traffic to soajs in docker",
		"locked": true,
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "nginx",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
						"required": false
					},
					"custom": {
						"label": "Custom UI",
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
				"voluming": JSON.parse(JSON.stringify(dockerDefaultVoluming)),
				"ports": [
					{
						"name": "http",
						"target": 80,
						"isPublished": true,
						"published": 81,
						"preserveClientIP": true
					},
					{
						"name": "https",
						"target": 443,
						"isPublished": true,
						"published": 444,
						"preserveClientIP": true
					}
				]
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
		"name": "Nginx Recipe - Kubernetes",
		"type": "server",
		"subtype": "nginx",
		"description": "This recipe allows you to deploy an nginx server that upstreams traffic to soajs in kubernetes",
		"locked": true,
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "nginx",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
						"required": false
					},
					"custom": {
						"label": "Custom UI",
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
				"restartPolicy": {},
				"container": {
					"network": '', //container network for docker
					"workingDir": "/opt/soajs/deployer/" //container working directory
				},
				"voluming": JSON.parse(JSON.stringify(kubernetesDefaultVoluming)),
				"ports": [
					{
						"name": "http",
						"target": 80,
						"isPublished": true,
						"published": 81,
						"preserveClientIP": true
					},
					{
						"name": "https",
						"target": 443,
						"isPublished": true,
						"published": 444,
						"preserveClientIP": true
					}
				]
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
		"name" : "Mongo Recipe - Docker",
		"type" : "cluster",
		"subtype" : "mongo",
		"description" : "This recipe allows you to deploy a mongo server in docker",
		"locked" : true,
		"recipe" : {
			"deployOptions" : {
				"image" : {
					"prefix" : "",
					"name" : "mongo",
					"tag" : "3.4.10",
					"pullPolicy" : "IfNotPresent"
				},
				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
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
				"voluming" : JSON.parse(JSON.stringify(dockerMongoVoluming)),
				"ports" : [
					{
						"name" : "mongo",
						"target" : 27017,
						"isPublished" : true
					}
				]
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

	{
		"name" : "Mongo Recipe - Kubernetes",
		"type" : "cluster",
		"subtype" : "mongo",
		"description" : "This recipe allows you to deploy a mongo server in kubernetes",
		"locked" : true,
		"recipe" : {
			"deployOptions" : {
				"image" : {
					"prefix" : "",
					"name" : "mongo",
					"tag" : "3.4.10",
					"pullPolicy" : "IfNotPresent"
				},
				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
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
				"restartPolicy" : {},
				"container" : {
					"network" : "",
					"workingDir" : ""
				},
				"voluming" : JSON.parse(JSON.stringify(kubernetesMongoVoluming)),
				"ports" : [
					{
						"name" : "mongo",
						"target" : 27017,
						"isPublished" : true
					}
				]
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

	{
		"name": "Nodejs Recipe - Docker",
		"type": "service",
		"subtype": "nodejs",
		"description": "This recipe allows you to deploy a nodeJS application in docker",
		"locked": true,
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "soajs",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
						"required": false
					}
				},
				"readinessProbe": {},
				"restartPolicy": dockerRestartPolicy,
				"container": {
					"network": dockerNetwork, //container network for docker
					"workingDir": "/opt/soajs/deployer/" //container working directory
				},
				"voluming": JSON.parse(JSON.stringify(dockerDefaultVoluming))
			},
			"buildOptions": {
				"settings": {
					"accelerateDeployment": true
				},
				"env": {
					"NODE_ENV": {
						"type": "static",
						"value":"production"
					}
				},
				"cmd": {
					"deploy": {
						"command": ["bash"],
						"args": ["-c","node index.js -T nodejs"]
					}
				}
			}
		}
	},

	{
		"name": "Nodejs Recipe - Kubernetes",
		"type": "service",
		"subtype": "nodejs",
		"description": "This recipe allows you to deploy a nodeJS application in kubernetes",
		"locked": true,
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "soajs",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
						"required": false
					}
				},
				"readinessProbe": {},
				"restartPolicy": {},
				"container": {
					"network": '', //container network for docker
					"workingDir": "/opt/soajs/deployer/" //container working directory
				},
				"voluming": JSON.parse(JSON.stringify(kubernetesDefaultVoluming))
			},
			"buildOptions": {
				"settings": {
					"accelerateDeployment": true
				},
				"env": {
					"NODE_ENV": {
						"type": "static",
						"value":"production"
					}
				},
				"cmd": {
					"deploy": {
						"command": ["bash"],
						"args": ["-c","node index.js -T nodejs"]
					}
				}
			}
		}
	},

	{
		"name": "Java Recipe - Docker",
		"type": "service",
		"subtype": "java",
		"description": "This recipe allows you to deploy a Java Application in Docker",
		"locked": true,
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "java",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
						"required": false
					}
				},
				"readinessProbe": {},
				"restartPolicy": dockerRestartPolicy,
				"container": {
					"network": dockerNetwork,
					"workingDir": "/opt/soajs/deployer/"
				},
				"voluming": {
					"volumes": [],
					"volumeMounts": []
				}
			},
			"buildOptions": {
				"env": {
					"SOAJS_JAVA_APP_PORT": {
						"type": "computed",
						"value": "$SOAJS_SRV_PORT"
					}
				},
				"cmd": {
					"deploy": {
						"command": [
							"sh"
						],
						"args": [
							"-c",
							"node index.js -T java"
						]
					}
				}
			}
		}
	},

	{
		"name": "Java Recipe - Kubernetes",
		"type": "service",
		"subtype": "java",
		"description": "This recipe allows you to deploy a Java Application in Kubernetes",
		"locked": true,
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "soajsorg",
					"name": "java",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},
				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
						"required": false
					}
				},
				"readinessProbe": {},
				"restartPolicy": {},
				"container": {
					"network": '', //container network for docker
					"workingDir": "/opt/soajs/deployer/" //container working directory
				},
				"voluming": {
					"volumes": [],
					"volumeMounts": []
				}
			},
			"buildOptions": {
				"env": {
					"SOAJS_JAVA_APP_PORT": {
						"type": "computed",
						"value": "$SOAJS_SRV_PORT"
					}
				},
				"cmd": {
					"deploy": {
						"command": [
							"sh"
						],
						"args": [
							"-c",
							"node index.js -T java"
						]
					}
				}
			}
		}
	},

	{
		"name": "Elasticsearch Recipe - Docker",
		"type": "cluster",
		"subtype": "elasticsearch",
		"description": "This recipe allows you to deploy ElasticSearch in Docker",
		"locked": true,
		"recipe": {
			"deployOptions": {
				"image": {
					"prefix": "",
					"name": "elasticsearch",
					"tag": "latest",
					"pullPolicy": "IfNotPresent"
				},

				"sourceCode": {
					"config": {
						"label": "Custom Configuration",
						"required": false
					}
				},
				"readinessProbe": {},
				"restartPolicy": dockerRestartPolicy,
				"container": {
					"network": dockerNetwork, //container network for docker
					"workingDir": "" //container working directory
				},
				"voluming": {
					"volumes": [
						{
							"Type": "volume",
							"Source": "custom-es-volume",
							"Target": "/usr/share/elasticsearch/data/"
						}
					]
				},
				"ports": [
					{
						"name": "es",
						"target": 9200,
						"isPublished": false
					}
				]
			},
			"buildOptions": {
				"env": {},
				"cmd": {
					"deploy": {
						"command": [
							"bash"
						],
						"args": [
							"-c",
							"su -s /bin/bash elasticsearch -c '/usr/share/elasticsearch/bin/elasticsearch'"
						]
					}
				}
			}
		}
	}
];

module.exports = catalogs;
