'use strict';
const path = require("path");
const exec = require("child_process").exec;
const spawn = require("child_process").spawn;

function ifLinuxRoot(callback) {
	if (process.env.LOGNAME !== 'root') {
		let output = "This command requires you run it as Root!\n";
		output += "[1] -> sudo su\n";
		output += "[2] -> soajs docker " + process.env.SOAJS_INSTALLER_COMMAND;
		return callback(output);
	}
}

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
			
			ifLinuxRoot(callback);
			
			execPath += "/docker-linux-install.sh";
		}
		
		exec("docker --version", (error, data) =>{
			if(data){
				return callback("Docker already installed on this machine!");
			}
			else{
				let install = exec(execPath, {
					cwd: process.env.SOAJS_INSTALLER_LOCATION,
					env: process.env
				});
				install.stdout.on('data', (data) => {
					if (data) {
						process.stdout.write(data);
					}
				});

				install.stderr.on('data', (error) => {
					if (error) {
						process.stdout.write(error);
					}
				});
				install.on('close', (code) => {
					if (code === 0) {
						if (process.env.PLATFORM === 'Darwin') {
							return callback(null, "Docker downloaded, follow the Docker Wizard to finalize the installation ...");
						}
						else {
							return callback(null, "Docker downloaded and installed.");
						}
					}
					else {
						return callback("Error while downloading and installing docker!");
					}
				});
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
		
		let execPath = path.normalize(process.env.PWD + "/../libexec/bin/FILES/DOCKER");
		if (process.env.PLATFORM === 'Darwin') {
			process.env.MACHINE_IP = getHostIP();
		}
		else if (process.env.PLATFORM === 'Linux') {
			
			ifLinuxRoot(callback);
			
			process.env.MACHINE_IP = "127.0.0.1";
			
			execPath = "sudo " + execPath;
		}
		
		//check if docker is running
		exec("sudo docker ps", (err, data) => {
			if (err) {
				return callback("Docker is not installed or not running.\n[ Install ] -> soajs docker install\n[ Start ] -> soajs docker start");
			}
			else {
				let connect = exec(execPath + "/docker-api.sh", {
					cwd: process.env.SOAJS_INSTALLER_LOCATION,
					env: process.env
				});
				
				connect.stdout.on('data', (data) => {
					if(data){
						process.stdout.write(data);
					}
				});
				
				connect.stderr.on('data', (data) => {
					if(data){
						process.stdout.write(data);
					}
				});
				
				connect.on('close', (code) => {
					if(code === 0){
						return callback(null);
					}
					else{
						return callback("Error Connecting to Docker Swarm!");
					}
				});
			}
		});
	},
	
	/**
	 * remove docker from machine
	 * @param args
	 * @param callback
	 */
	remove: (args, callback) => {
		
		//call stop before you remove docker
		dockerModule.stop([], (error) => {
			if (error) {
				return callback(error);
			}
			
			let command;
			if (process.env.PLATFORM === 'Darwin') {
				command = "/Applications/Docker.app/Contents/MacOS/Docker --uninstall";
				let remove = exec(command);
				
				remove.stdout.on('data', (data) => {
					if (data) {
						process.stdout.write(data);
					}
				});
				
				remove.stderr.on('data', (error) => {
					if (error) {
						process.stdout.write(error);
					}
				});
				remove.on('close', (code) => {
					if (code === 0) {
						if (process.env.PLATFORM === 'Darwin') {
							return callback(null, "Docker Swarm Removed.");
						}
						else {
							return callback(null, "Docker Swarm Removed.");
						}
					}
					else {
						return callback("Error Removing Docker Swarm!");
					}
				});
			}
			else if (process.env.PLATFORM === 'Linux') {
				
				ifLinuxRoot(callback);
				//delete the installation files
				command = "sudo apt-get purge -y docker-ce && sudo rm -rf /var/lib/docker";
				let remove = exec(command);
				
				remove.stdout.on('data', (data) => {
					if (data) {
						process.stdout.write(data);
					}
				});
				
				remove.stderr.on('data', (error) => {
					if (error) {
						process.stdout.write(error);
					}
				});
				
				remove.on('close', (code) => {
					if (code === 0) {
						return callback(null, "Docker Swarm has been removed");
					}
					else {
						return callback("Error Removing Docker Swarm!");
					}
				});
			}
		});
	},
	
	/**
	 * Start docker
	 * @param args
	 * @param callback
	 */
	start: (args, callback) => {
		let command;
		let start;
		
		if (process.env.PLATFORM === 'Darwin') {
			command = "open /Applications/Docker.app";
			
			start = exec(command, {
				cwd: process.env.SOAJS_INSTALLER_LOCATION,
				env: process.env
			});
			
			start.stdout.on('data', (data) => {
				if (data) {
					process.stdout.write(data);
				}
			});
			
			start.stderr.on('data', (error) => {
				if (error) {
					return callback(error);
				}
			});
			
			start.on('close', (code) => {
				checkIfDockerOSXisRunning(0, () => {
					dockerModule.connect(args, callback);
				});
			});
		}
		else if (process.env.PLATFORM === 'Linux') {
			
			ifLinuxRoot(callback);
			exec("sudo docker ps", (err, data) => {
				if(err && !err.toString().includes("Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?")){
					return callback("Docker is not installed. [ RUN ] -> soajs docker install");
				}
				else if(data){
					return callback("Docker already running on this machine!");
				}
				else{
					command = path.normalize(process.env.PWD + "/../libexec/bin/FILES/DOCKER/docker-linux-start.sh");

					start = spawn("sudo", [command], {
						cwd: process.env.SOAJS_INSTALLER_LOCATION,
						env: process.env,
						detached: true
					});
					start.unref();

					start.stdout.on('data', (data) => {
						if (data) {
							if (data.toString().includes("----- DONE -----")) {
								let out = "Docker Swarm started on Ubuntu, please run soajs docker connect.";
								out += "\nDocker CLI Commands require (sudo) to work, ex: sudo docker ps"
								
								return callback(null, out);
							}
							else {
								process.stdout.write(data);
							}
						}
					});

					start.stderr.on('data', (error) => {
						if (error) {
							process.stdout.write(error);
						}
					});
				}
			});
		}
		
		function checkIfDockerOSXisRunning(counter, vCb) {
			exec("docker stats --no-stream", (error, response) => {
				if (error) {
					if (counter === 0) {
						console.log("Checking if Docker Swarm on OSX is running ...");
					}
					
					counter++;
					
					if (counter >= 10) {
						return callback(error);
					}
					else {
						setTimeout(() => {
							checkIfDockerOSXisRunning(counter, vCb)
						}, 5000);
					}
				}
				else {
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
		
		//if osx, killing the Docker app is enough
		if (process.env.PLATFORM === 'Darwin') {
			command = "killall Docker";
			exec(command, (err) => {
				if (err) {
					if (err.toString().includes("No matching processes belonging to you were found")) {
						return callback(null, "Docker Swarm stopped..")
					}
					else {
						return callback(err);
					}
				}
				return callback(null, "Docker Swarm stopped..")
			});
		}
		else if (process.env.PLATFORM === 'Linux') {
			
			ifLinuxRoot(callback);
			
			//remove all the docker processes found
			exec(`systemctl stop docker`, (error) => {
				if (error) {
					return callback();
				}
				return callback(null, "Docker Swarm Stopped ...");
			});
		}
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