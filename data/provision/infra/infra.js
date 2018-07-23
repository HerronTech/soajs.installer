'use strict';

var dsbrdInfra = {
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