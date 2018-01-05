'use strict';

module.exports = [
	{
		"type": "BLANK",
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
		"type": "SOAJS",
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
		"type": "PORTAL",
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