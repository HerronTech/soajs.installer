'use strict';
const exec = require("child_process").exec;
const path = require("path");
const fs = require("fs");

let dockerModule = {
	/**
	 * install docker on machine
	 * @param args
	 * @param callback
	 */
	install: (args, callback) => {
		let execPath = path.normalize(process.env.PWD + "/../libexec/bin/FILES/DOCKER");
		if (process.env.PLATFORM === 'Darwin') {
			execPath += "/docker-mac.sh";
			exec(execPath, (err, result) => {
				return callback(err, result)
			});
		}
		else if (process.env.PLATFORM === 'Linux') {
			execPath += "/docker-linux.sh";
		}
		
		exec(execPath, (err, result) => {
			if (err) {
				return callback(err);
			}
			else {
				console.log("Docker installed!")
				dockerModule.connect(args, );
			}
		});
		
	},
	
	/**
	 * Return docker ip, port, and token
	 * @param args
	 * @param callback
	 */
	connect: (args, callback) => {
		let execPath = path.normalize(process.env.PWD + "/../libexec/bin/FILES/DOCKER");
		exec(execPath + "/docker-api.sh", (err, result) => {
			return callback(err, result)
		});
	},
	
	/**
	 * remove docker from machine
	 * @param args
	 * @param callback
	 */
	remove: (args, callback) => {
		console.log("name: docker.js");
		console.log("Arguments:");
		console.log(JSON.stringify(process.argv, null, 2));
		return callback(null, "done!")
	},
	
	/**
	 * Start docker
	 * @param args
	 * @param callback
	 */
	start: (args, callback) => {
		console.log("name: docker.js");
		console.log("Arguments:");
		console.log(JSON.stringify(process.argv, null, 2));
		return callback(null, "done!")
	},
	
	/**
	 * Stop docker
	 * @param args
	 * @param callback
	 */
	stop: (args, callback) => {
		console.log("name: docker.js");
		console.log("Arguments:");
		console.log(JSON.stringify(process.argv, null, 2));
		return callback(null, "done!")
	},
	
	/**
	 * Restart docker
	 * @param args
	 * @param callback
	 */
	restart: (args, callback) => {
		
		//stop mongodb
		dockerModule.stop(args, (err) => {
			if (err) {
				return callback(err);
			}
			
			setTimeout(() => {
				//start mongodb
				dockerModule.start(args, callback);
			}, 3000);
		});
	}
};

module.exports = dockerModule;