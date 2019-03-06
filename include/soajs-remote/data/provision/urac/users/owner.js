'use strict';
var owner = {
	"locked": true,
	"username": "%username%",
	"password": '%password%',
	"firstName": "owner",
	"lastName": "owner",
	"email": "%email%",
	"ts": new Date().getTime(),
	"status": "active",
	"profile": {},
	"groups": ["owner"],
	"config": {
		"packages": {},
		"keys": {}
	},
	"tenant":{
		"id": '5c0e74ba9acc3c5a84a51259',
		"code": 'OWNE'
	}
};

module.exports = owner;