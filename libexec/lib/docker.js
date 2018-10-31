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
		let install = exec( execPath, {
			cwd: process.env.SOAJS_INSTALLER_LOCATION,
			env: process.env
		});
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
			if(code === 0){
				if (process.env.PLATFORM === 'Darwin') {
					return callback(null, "Docker downloaded, follow the Docker Wizard to finalize the installation ...");
				}
				else {
					return callback(null, "Docker downloaded and installed.");
				}
			}
			else{
				return callback("Error while downloading and installing docker!");
			}
		});
		
		
	},
	
	/**
	 * Return docker ip, port, and token
	 * @param args
	 * @param callback
	 */
	connect: (args, callback) => {
		
		function getHostIP() {
			var ips = [];
			var ifnameLookupSequence = [];
			
			var os = require('os');
			var ifaces = os.networkInterfaces();
			ifnameLookupSequence = ["eth0", "en0", "eth1", "en1"];
			Object.keys(ifaces).forEach(function (ifname) {
				ifaces[ifname].forEach(function (iface) {
					if ('IPv4' !== iface.family || iface.internal !== false) {
						// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
						return null;
					}
					ips[ifname] = iface.address;
				});
			});
			for (var i = 0; i < ifnameLookupSequence.length; i++) {
				if (ips[ifnameLookupSequence[i]])
					return ips[ifnameLookupSequence[i]];
			}
			return null;
		}
		
		if (process.env.PLATFORM === 'Darwin') {
			process.env.MACHINE_IP = getHostIP();
		}
		else if (process.env.PLATFORM === 'Linux') {
			process.env.MACHINE_IP = "127.0.0.1";
		}
		
		let execPath = path.normalize(process.env.PWD + "/../libexec/bin/FILES/DOCKER");
		exec(execPath + "/docker-api.sh", {
			env: process.env
		}, (err, result) => {
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
		
		let start = exec(command);
		
		start.stdout.on('data', (data) => {
			if (data){
				process.stdout.write(data);
			}
		});
		
		start.stderr.on('data', (error) => {
			if (error){
				return callback(error);
			}
		});
		
		start.on('close', (code) => {
			if (process.env.PLATFORM === 'Darwin') {
				checkIfDockerOSXisRunning(0, () => {
					dockerModule.connect(args, callback);
				});
			}
			else{
				dockerModule.connect(args, callback);
			}
		});
		
		function checkIfDockerOSXisRunning(counter, vCb){
			exec("docker stats --no-stream", (error, response) => {
				if(error){
					if(counter === 0){
						console.log("Checking if Docker Swarm on OSX is running ...");
					}
					
					counter ++;
					
					if(counter >= 10){
						return callback(error);
					}
					else{
						setTimeout(() => {
							checkIfDockerOSXisRunning(counter, vCb)
						}, 5000);
					}
				}
				else{
					return vCb();
				}
			});
		}
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
				if(err.toString().includes("No matching processes belonging to you were found")){
					return callback(null, "Docker Swarm stopped..")
				}
				else{
					return callback(err);
				}
			}
			return callback(null, "Docker Swarm stopped..")
		});
	},
	
	/**
	 * Restart docker
	 * @param args
	 * @param callback
	 */
	restart: (args, callback) => {
		
		//stop docker
		dockerModule.stop(args, (err) => {
			if (err) {
				return callback(err);
			}
			
			setTimeout(() => {
				//start docker
				dockerModule.start(args, callback);
			}, 3000);
		});
	}
};

module.exports = dockerModule;