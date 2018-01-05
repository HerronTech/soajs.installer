'use strict';

module.exports = [
	{
		"type": "_BLANK",
		"gi": {
			"code": "BLANK",
			"deployPortal": true
		},
		"deploy": {
			"deployment": {},
			"selectedDriver": ""
		}
	},
	{
		"type": "_SOAJS",
		"gi": {
			"code": "SOAJS",
			"deployPortal": true
		},
		"deploy": {
			"deployment": {},
			"selectedDriver": ""
		},
		"controller": {},
		"nginx": {}
	},
	{
		"type": "_PORTAL",
		"gi": {
			"code": "PORTAL",
			"deployPortal": true
		},
		"deploy": {
			"deployment": {},
			"selectedDriver": ""
		},
		"cluster": {},
		"controller": {},
		"urac": {},
		"oauth": {},
		"nginx": {},
		"productize": {},
		"user": {}
	}
];