'use strict';
const path = require("path");
const exec = require("child_process").exec;

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
		}
		else if (process.env.PLATFORM === 'Linux') {
			execPath += "/docker-linux.sh";
		}
		let install = exec( execPath, ["."]);
		install.stdout.on('data', (data) => {
			if (data){
				process.stdout.write(data);
			}
		});
		
		install.stderr.on('data', (error) => {
			if (error){
				process.stdout.write(error);
			}
		});
		install.on('close', (code) => {
			return callback(null, "Docker installed...")
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
		let command;
		if (process.env.PLATFORM === 'Darwin') {
			command = "/Applications/Docker.app/Contents/MacOS/Docker --uninstall";
		}
		else if (process.env.PLATFORM === 'Linux') {
			command = "sudo apt-get purge docker-ce && sudo rm -rf /var/lib/docker*";
		}
		exec(command, callback);
	},
	
	/**
	 * Start docker
	 * @param args
	 * @param callback
	 */
	start: (args, callback) => {
		let command;
		if (process.env.PLATFORM === 'Darwin') {
			command = "open /Applications/Docker.app";
		}
		else if (process.env.PLATFORM === 'Linux') {
			command = path.normalize(process.env.PWD + "/../libexec/bin/FILES/DOCKER/docker-linux.sh");
		}
		exec(command, (err) => {
			if (err){
				return callback(err);
			}
			dockerModule.connect(args, callback);
		});
	},
	
	/**
	 * Stop docker
	 * @param args
	 * @param callback
	 */
	stop: (args, callback) => {
		let command;
		if (process.env.PLATFORM === 'Darwin') {
			command = "killall Docker";
		}
		else if (process.env.PLATFORM === 'Linux') {
			command = "service docker stop";
		}
		exec(command, (err) => {
			if (err){
				return callback(err);
			}
			dockerModule.connect(args, callback);
		});
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