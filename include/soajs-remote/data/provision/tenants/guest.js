'use strict';
var techop = {
	"_id": "5c0e74ba9acc3c5a84a51259",
	"type": "product",
	"code": "DBTN",
	"locked": true,
	"name": "Console Tenant",
	"description": "This is the tenant that holds the access rights and configuration for the console users with DSBRD_GUEST as Guest default package",
	"oauth": {
		"secret": "this is a secret",
		"disabled": 0,
		"type": 2,
		"loginMode": "urac"
	},
	"applications": [
		{
			"product": "DSBRD",
			"package": "DSBRD_GUEST",
			"appId": "5c0e74ba9acc3c5a84a5125a",
			"description": "Dashboard application for DSBRD_GUEST package",
			"_TTL": 604800000,
			"keys": [
				{
					"key": "a139786a6e6d18e48b4987e83789430b",
					"extKeys": [
						{
							"extKey": "%guestExtKey%",
							"device": null,
							"geo": null,
							"env": "DASHBOARD",
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
	"tag": "Console"
};

module.exports = techop;
