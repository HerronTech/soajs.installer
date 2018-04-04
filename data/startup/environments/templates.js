'use strict';

module.exports = [
	{
		"name": "Empty Environment",
		"type": "_template",
		"description": "This templates allows creating a blank environment that can be used to deploy components in later on.",
		"link": "",
		"content": {},
		"deploy": {}
	},
	{
		"name": "SOAJS Environment",
		"type": "_template",
		"description": "This template allows creating a SOAJS environment.",
		"link": "",
		"content": {
			"deployments": {
				"repo": {
					"controller": {
						"label": "SOAJS API Gateway",
						"name": "controller",
						"type": "service",
						"category": "soajs",
						"deploy": {
							"recipes": {
								"available": [],
								"default": "SOAJS Controller Recipe"
							},
							"memoryLimit": 500,
							"mode": "replicated",
							"replicas": 1,
							"cpu": 0.5
						}
					}
				}
			}
		},
		"deploy": {
			"deployments": {
				"pre": {},
				"steps": {
					"deployments.repo.controller": {}
				},
				"post": {}
			}
		}
	},
	{
		"name": "SOAJS Environment + NGINX",
		"type": "_template"
		"description": "This template allows creating a SOAJS environment with an NGINX server.",
		"link": "",
		"content": {
			"deployments": {
				"repo": {
					"controller": {
						"label": "SOAJS API Gateway",
						"name": "controller",
						"type": "service",
						"category": "soajs",
						"deploy": {
							"recipes": {
								"available": [],
								"default": "SOAJS Controller Recipe"
							},
							"memoryLimit": 500,
							"mode": "replicated",
							"replicas": 1,
							"cpu": 0.5
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
							"memoryLimit": 500,
							"mode": "global",
							"cpu": 0.5
						}
					}
				}
			}
		},
		"deploy": {
			"deployments": {
				"pre": {},
				"steps": {
					"deployments.repo.controller": {},
					"deployment.resources.nginx": {}
				},
				"post": {}
			}
		}
	},
	{
		"name": "Portal Environment",
		"type": "_template",
		"description": "This templates creates and deploys a PORTAL environment.",
		"link": "",
		"content": {
			"productization": {
				"data": [
					{
						"code": "TEST",
						"name": "Test Product",
						"description": "Test Product Description",
						"packages": [
							{
								"code": "BASIC",
								"name": "Basic Package",
								"description": "Basic Package Description",
								"TTL": 6 * 36000 * 1000,
								"acl": {
									"simpleservice": {}

								}
							},
							{
								"code": "MAIN",
								"name": "Main Package",
								"description": "Main Package Description",
								"TTL": 6 * 3600 * 1000,
								"acl": {
									"swaggerservice": {}
								}
							}
						]
					}
				]
			},
			"tenant": {
				"data": [
					{
						"code": "TEST",
						"name": "Test Tenant",
						"description": "Test Tenant Description",
						"oauth": {},
						"applications": [
							{
								"product": "TEST",
								"package": "TEST_MAIN",
								"description": "Test main application",
								"_TTL": 7 * 24 * 3600 * 1000,
								"keys": [
									{
										"extKeys": [
											{
												"device": {},
												"geo": {},
												"dashboardAccess": false,
												"expDate": null
											}
										],
										"config": {}
									}
								]
							},
							{
								"product": "TEST",
								"package": "TEST_USER",
								"description": "Test Logged In user Application",
								"_TTL": 7 * 24 * 3600 * 1000,
								"acl": {
									"simpleservice": {"access": true},
									"swaggerservice": {"access": true}
								},
								"keys": [
									{
										"extKeys": [
											{
												"device": {},
												"geo": {},
												"dashboardAccess": true,
												"expDate": null
											}
										],
										"config": {}
									}
								]
							}
						]
					}
				]
			},
			"deployments": {
				"repo": {
					"controller": {
						"label": "SOAJS API Gateway",
						"name": "controller",
						"type": "service",
						"category": "soajs",
						"deploy": {
							"recipes": {
								"available": [],
								"default": "SOAJS Controller Recipe"
							},
							"memoryLimit": 500,
							"mode": "replicated",
							"replicas": 1,
							"cpu": 0.5
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
								"default": "Nginx Recipe Custom SSL"
							},
							"memoryLimit": 500,
							"mode": "global",
							"cpu": 0.5,
							"secrets": ["nginx-certs"]
						}
					},
					"urac": {

					},
					"oauth": {

					},
					"mongo": {
						"label": "Mongo",
						"type": "server",
						"category": "mongo",
						"ui": "${REF:resources/drivers/server/mongo}",
						"deploy": {
							"recipes": {
								"available": [],
								"default": "Mongo Recipe"
							},
							"memoryLimit": 500,
							"mode": "global",
							"cpu": 0.5
						}
					}
				}
			}
		},
		"deploy": {
			"database": {
					"pre": {},
					"steps": {
						"productization": {
							"ui": {
								"readonly": true
							}
						},
						"tenant": {
							"ui": {
								"readonly": true
							}
						},
						"resources.deployment."
					},
					"post": {}
			},
			"deployments": {
				"pre": {},
				"steps": {},
				"post": {}
			}
		}
	}

];
