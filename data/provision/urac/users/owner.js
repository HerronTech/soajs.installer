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
		"id": '5551aca9e179c39b760f7a1a',
		"code": 'DBTN'
	}
};

module.exports = owner;