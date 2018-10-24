'use strict';
var techop = {
	"_id": "5a00532812394b0046c46c43",
	"type": "client",
	"code": "TECO",
	"name": "TECOP",
	"description": "This tenant uses the Techop Package and its users are allowed to administer the cloud.",
	"oauth": {
		"secret": "soajs beaver",
		"redirectURI": "http://domain.com",
		"grants": [
			"password",
			"refresh_token"
		]
	},
	"applications": [
		{
			"product": "DSBRD",
			"package": "DSBRD_TECOP",
			"appId": "5a00532812394b0046c46c44",
			"description": "Dashboard application for DSBRD_TECOP package",
			"_TTL": 604800000,
			"keys": [
				{
					"key": "f485d5dc9ac1d0da8962e4121b3e58a9",
					"extKeys": [
						{
							"extKey": "%extKey3%",
							"device": null,
							"geo": null,
							"env": "DASHBOARD",
							"dashboardAccess": true
						}
					],
					"config": {
						"dashboard": {
							"oauth": {
								"loginMode": "urac"
							},
							"commonFields": {
								"mail": {
									"from": "me@localhost.com",
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
									"addUser": "http://dashboard.soajs.org:80/#/setNewPassword",
									"changeEmail": "http://dashboard.soajs.org:80/#/changeEmail/validate",
									"forgotPassword": "http://dashboard.soajs.org:80/#/resetPassword",
									"join": "http://dashboard.soajs.org:80/#/join/validate"
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
	"tag": "techop"
};

module.exports = techop;
