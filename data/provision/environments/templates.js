'use strict';

module.exports = [
	{
		"name": "Blank Environment",
		"type": "_template",
		"description": "This templates will create a blank environment.",
		"link": "https://soajsorg.atlassian.net/wiki/spaces/DSBRD/pages/400392194/Blank+Environment",
		"logo": "modules/dashboard/templates/images/file-empty.png",
		"content": {},
		"deploy": {}
	},
	{
		"name": "SOAJS Microservices Environment",
		"type": "_template",
		"description": "This template will create an environment with SOAJS API Gateway configured, deployed & ready to use. You can leverage this environment to deploy microservices.",
		"link": "https://soajsorg.atlassian.net/wiki/spaces/DSBRD/pages/400588803/SOAJS+Microservices+Environment",
		"logo": "modules/dashboard/templates/images/soajs.png",
		"restriction": {
			"deployment": ["container"]
		},
		"content": {
			"deployments": {
				"repo": {
					"controller": {
						"label": "SOAJS API Gateway",
						"name": "controller",
						"type": "service",
						"category": "soajs",
						"gitSource": {
							"provider": "github",
							"owner": "soajs",
							"repo": "soajs.controller"
						},
						"deploy": {
							"recipes": {
								"available": [],
								"default": "SOAJS API Gateway Recipe"
							},
							"branch": "master",
							"memoryLimit": 0,
							"mode": "replicated",
							"replicas": 1
						}
					}
				}
			}
		},
		"deploy": {
			"deployments": {
				"pre": {},
				"steps": {
					"deployments__dot__repo__dot__controller": {}
				},
				"post": {}
			}
		}
	},
	{
		"name": "NGINX & SOAJS Microservices Environment",
		"type": "_template",
		"description": "This template will create an environment with Nginx & SOAJS API Gateway configured, deployed & ready to use. You can leverage this environment to deploy microservices & static content.",
		"link": "https://soajsorg.atlassian.net/wiki/spaces/DSBRD/pages/400424978/NGINX+SOAJS+Microservices+Environment",
		"logo": "modules/dashboard/templates/images/soajs-nginx.png",
		"restriction": {
			"deployment": ["container"]
		},
		"content": {
			"deployments": {
				"repo": {
					"controller": {
						"label": "SOAJS API Gateway",
						"name": "controller",
						"type": "service",
						"category": "soajs",
						"gitSource": {
							"provider": "github",
							"owner": "soajs",
							"repo": "soajs.controller"
						},
						"deploy": {
							"recipes": {
								"available": [],
								"default": "SOAJS API Gateway Recipe"
							},
							"branch": "master",
							"memoryLimit": 0,
							"mode": "replicated",
							"replicas": 1
						}
					}
				},
				"resources": {
					"nginx": {
						"label": "Nginx",
						"type": "server",
						"category": "nginx",
						"ui": "${REF:resources/drivers/server/nginx}",
						"deploy": {
							"recipes": {
								"available": [],
								"default": "Nginx Recipe"
							},
							"memoryLimit": 300,
							"mode": "global"
						}
					}
				}
			}
		},
		"deploy": {
			"deployments": {
				"pre": {},
				"steps": {
					"deployments__dot__repo__dot__controller": {}
				},
				"post": {
					"deployments__dot__resources__dot__nginx": {}
				}
			}
		}
	}
];
