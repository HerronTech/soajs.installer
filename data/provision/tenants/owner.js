'use strict';
var dsbrd = {
	"_id": "5551aca9e179c39b760f7a1a",
	"locked": true,
	"type": "admin",
	"code": "DBTN",
	"name": "Dashboard Owner Tenant",
	"description": "this is the main dashboard tenant",
	"oauth": {},
	"applications": [
		{
			"product": "DSBRD",
			"package": "DSBRD_MAIN",
			"appId": '5512926a7a1f0e2123f638de',
			"description": "This application uses the Dashboard Public Package.",
			"keys": [
				{
					"key": "38145c67717c73d3febd16df38abf311",
					"extKeys": [
						{
							"extKey": "%extKey1%",
							"device": null,
							"geo": null,
							"env": "DASHBOARD"
						}
					],
					"config": {
						"dashboard": {
                            "mail": {
                                "from": '%email%',
                                "transport": {
                                    "type": "sendmail",
                                    "options": {}
                                }
                            },
                            "urac": {
                                "hashIterations": 1024,
                                "seedLength": 32,
                                "link": {
	                                "addUser": "http://%site%.%domain%/#/setNewPassword",
	                                "changeEmail": "http://%site%.%domain%/#/changeEmail/validate",
	                                "forgotPassword": "http://%site%.%domain%/#/resetPassword",
	                                "join": "http://%site%.%domain%/#/join/validate"
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
                                        "content": "%wrkDir%/soajs/node_modules/soajs.urac/mail/urac/changeUserStatus.tmpl"
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
		},
        {
            "product": "DSBRD",
            "package": "DSBRD_OWNER",
            "appId": '55cc56a3c3aca9179e5048e6',
            "description": "This application uses the Dashboard Owner Package.",
            "keys": [
                {
                    "key": "9ccfb3cdaf5f61cf0cff5c78215b2292",
                    "extKeys": [
                        {
	                        "env": "DASHBOARD",
                            "extKey": "%extKey2%",
                            "device": null,
                            "geo": null
                        }
                    ],
                    "config": {
                        "dashboard": {
                            "mail": {
                                "from": '%email%',
                                "transport": {
                                    "type": "sendmail",
                                    "options": {}
                                }
                            },
                            "urac": {
                                "hashIterations": 1024,
                                "seedLength": 32,
                                "link": {
                                    "addUser": "http://%site%.%domain%/#/setNewPassword",
                                    "changeEmail": "http://%site%.%domain%/#/changeEmail/validate",
                                    "forgotPassword": "http://%site%.%domain%/#/resetPassword",
                                    "join": "http://%site%.%domain%/#/join/validate"
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
                                        "content": "%wrkDir%/soajs/node_modules/soajs.urac/mail/urac/changeUserStatus.tmpl"
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
	]
};

module.exports = dsbrd;