'use strict';

var dsbrdInfra = {
	"_id": '5b27a0e391cf2200275c9a0e',
	"api": {
		"ipaddress": "%ipaddress%",
		"token": "%token%",
		"network": "%network%",
		"port": "%port%",
		"protocol": "%protocol%"
	},
	"name": "local",
	"technologies": [
		"%technology%"
	],
	"templates": null,
	"drivers": [
		"Native"
	],
	"label": "%label%",
	"deployments": [
		{
			"technology": "%technology%",
			"options": {
				"zone": "local"
			},
			"environments": [
				"DASHBOARD"
			],
			"loadBalancers": {},
			"name": "%name%",
			"id": "%name%"
		}
	]
};

module.exports = dsbrdInfra;