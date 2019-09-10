'use strict';
//need to update configSHA, set to correct values when config files on master branch get updated
var soajs_account = {
	"_id": '56f1189430f153a571b9c8be',
	"label": "SOAJS Open Source",
	"owner": "soajs",
	"provider": "github",
	"type": "organization",
	"domain": "github.com",
	"access": "public",
	"repos": [
		{
			"name": "soajs/soajs.controller",
			"serviceName": "controller",
			"type": "service"
		},
		{
			"name": "soajs/soajs.dashboard",
			"serviceName": "dashboard",
			"type": "service"
		},
		{
			"name": "soajs/soajs.urac",
			"serviceName": "urac",
			"type": "service"
		},
		{
			"name": "soajs/soajs.oauth",
			"serviceName": "oauth",
			"type": "service"
		},
        {
            "name": "soajs/soajs.multitenant",
            "serviceName": "multitenant",
            "type": "service"
        },
		{
			"name": "soajs/soajs.epg",
			"serviceName": "epg",
			"type": "component"
		}
	]
};

module.exports = soajs_account;