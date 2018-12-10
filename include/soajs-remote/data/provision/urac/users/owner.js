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
		"id": '5c0e72d59acc3c5a84a51257',
		"code": 'OWNE'
	}
};

module.exports = owner;