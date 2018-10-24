"use strict";

const bunyan = require("bunyan");
const bunyanFormat = require('bunyan-format');

module.exports = {
	"getLogger":  () => {
		//set the logger
		let formatOut = bunyanFormat({ "levelInString": true, "outputMode": 'short' });
		const logger = bunyan.createLogger({
			name: "SOAJS Installer",
			"src": true,
			"level": "debug",
			"stream": (process.env.SOAJS_CONSOLE) ? null : formatOut
		});
		
		return logger;
	}
};