'use strict';
var techop = {
	"_id": "5c0504c8cc199208a0ebf3ac",
	"type": "client",
	"locked": true,
	"code": "DEVO",
	"name": "DevOps",
	"description": "This is the tenant that holds the access rights and configuration for user devOps",
	"oauth": {
		"secret": "this is a secret",
		"redirectURI": "http://domain.com",
		"grants": [
			"password",
			"refresh_token"
		],
		"disabled": 0.0,
		"type": 2.0,
		"loginMode": "urac"
	},
	"applications": [
		{
			"product": "DSBRD",
			"package": "DSBRD_DEVOP",
			"appId": "5c0504c8cc199208a0ebf3ad",
			"description": "This application has the right privileges a DevOps user will need to be able to configure, control, and monitor what is happening across the board.",
			"_TTL": 604800000,
			"keys": [
				{
					"key": "c3bd703616775fe70feb5846ca865893",
					"extKeys": [
						{
							"extKey": "%devOpsExtKey%",
							"device": null,
							"geo": null,
							"env": "DASHBOARD",
							"dashboardAccess": true,
							"expDate": null
						}
					],
					"config": {
						"dashboard": {
							"commonFields": {
								"mail": {
									"from": "%email%",
									"transport": {
										"type": "sendmail",
										"options": {}
									}
								}
							},
							"urac": {
								"hashIterations": 1024,
								"seedLength": 32,
								"link": {
									"addUser": "%protocol%://%site%.%domain%:%port%/#/setNewPassword",
									"changeEmail": "%protocol%://%site%.%domain%:%port%/#/changeEmail/validate",
									"forgotPassword": "%protocol%://%site%.%domain%:%port%/#/resetPassword",
									"join": "%protocol%://%site%.%domain%:%port%/#/join/validate"
								},
								"tokenExpiryTTL": 2 * 24 * 3600 * 1000,
								"validateJoin": true,
								"mail": {
									"join": {
										"subject": 'Welcome to SOAJS',
										"path": "%wrkDir%/soajs/node_modules/soajs.urac/mail/urac/join.tmpl"
									},
									"forgotPassword": {
										"subject": 'Reset Your Password at SOAJS',
										"path": "%wrkDir%/soajs/node_modules/soajs.urac/mail/urac/forgotPassword.tmpl"
									},
									"addUser": {
										"subject": 'Account Created at SOAJS',
										"path": "%wrkDir%/soajs/node_modules/soajs.urac/mail/urac/addUser.tmpl"
									},
									"changeUserStatus": {
										"subject": "Account Status changed at SOAJS",
										//use custom HTML
										"path": "%wrkDir%/soajs/node_modules/soajs.urac/mail/urac/changeUserStatus.tmpl"
									},
									"changeEmail": {
										"subject": "Change Account Email at SOAJS",
										"path": "%wrkDir%/soajs/node_modules/soajs.urac/mail/urac/changeEmail.tmpl"
									}
								}
							}
						}
					}
				}
			]
		}
	],
	"tag": "devOps"
};

module.exports = techop;
