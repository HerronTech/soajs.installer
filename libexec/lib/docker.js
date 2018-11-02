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
			execPath = execPath;
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
		}
		
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
				return callback(data);
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
				command = "apt-get purge -y docker-ce";
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
						//unmount the volumes and clean up
						//&& umount /var/lib/docker/containers/* && rm -Rf /var/lib/docker/*
						exec("cat /proc/mounts | grep docker", (error, cmdOutput) => {
							if(error || !cmdOutput){
								return callback("Error Removing Docker Swarm!");
							}
							
							cmdOutput = cmdOutput.split("\n");
							if (Array.isArray(cmdOutput) && cmdOutput.length > 0) {
								let counter = 0, max = 0;
								cmdOutput.forEach((oneCMDLine) => {
									oneCMDLine = oneCMDLine.replace(/\s+/g, ' ').split(' ');
									if(oneCMDLine[1] && oneCMDLine[1].trim() !== ''){
										max++;
										exec(`umount ${oneCMDLine[1]}`, () => {
											//remove the lib folder
											counter++;
											if(counter >= max){
												removeLibFolder();
											}
										});
									}
								});
							}
							else{
								//remove the lib folder
								removeLibFolder();
							}
						});
					}
					else {
						return callback("Error Removing Docker Swarm!");
					}
				});
			}
		});
		
		function removeLibFolder(){
			exec(`rm -Rf /var/lib/docker/*`, (error) => {
				if(error){
					return callback(error);
				}
				return callback(null, "Docker Swarm has been removed");
			});
		}
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
			exec("docker ps", (err, data) => {
				if(data){
					return callback("Docker already started on this machine!");
				}
				else{
					command = path.normalize(process.env.PWD + "/../libexec/bin/FILES/DOCKER/docker-linux-start.sh");

					start = spawn(command, {
						cwd: process.env.SOAJS_INSTALLER_LOCATION,
						env: process.env,
						detached: true
					});
					start.unref();

					start.stdout.on('data', (data) => {
						if (data) {
							if (data.toString().includes("----- DONE -----")) {
								return callback(null, "Docker Swarm started on Ubuntu, please run soajs docker connect.");
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
			exec(`ps aux | grep docker`, (error, cmdOutput) => {
				if (error || !cmdOutput) {
					return callback();
				}
				
				//go through the returned output and find the process ID
				cmdOutput = cmdOutput.split("\n");
				let counter = 0;
				let max = 0;
				if (Array.isArray(cmdOutput) && cmdOutput.length > 0) {
					cmdOutput.forEach((oneCMDLine) => {
						//command is not null, does not include grep or docker stop or docker restart
						if (oneCMDLine.trim() !== '' && !oneCMDLine.includes("grep") && !oneCMDLine.includes("docker stop") && !oneCMDLine.includes("docker restart") && !oneCMDLine.includes("docker remove")) {
							max++;
							let oneProcess = oneCMDLine.replace(/\s+/g, ' ').split(' ');
							let PID = oneProcess[1];
							if (PID) {
								exec(`kill -9 ${PID}`, (err) => {
									counter++;
									//see if you are done to leave
									leaveMe(counter, max);
								});
							}
						}
					});
					
					if (max === 0) {
						//no matching commands representing processes
						leaveMe(0, 0);
					}
				}
				else {
					//nothing
					leaveMe(0, 0);
				}
			});
		}
		
		function leaveMe(counter, max) {
			if (counter >= max) {
				return callback(null, "Docker Swarm Stopped ...");
			}
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