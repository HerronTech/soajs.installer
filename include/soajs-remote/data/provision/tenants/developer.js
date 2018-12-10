'use strict';
var techop = {
	"_id": "5c0505a9cc199208a0ebf3b1",
	"type": "client",
	"code": "DEVE",
	"locked": true,
	"name": "Developer",
	"description": "This package is ideal for a developer. You are not giving much access but yet it is enough to sail and fast.",
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
			"package": "DSBRD_DEVEL",
			"appId": "5c0505a9cc199208a0ebf3b2",
			"description": "This application is ideal for a developer. You are not giving much access but yet it is enough to sail and fast.",
			"_TTL": 604800000,
			"keys": [
				{
					"key": "499e214f8e1c17d0be793a842074c2cc",
					"extKeys": [
						{
							"extKey": "%developerExtKey%",
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
	"tag": "developer"
};

module.exports = techop;
