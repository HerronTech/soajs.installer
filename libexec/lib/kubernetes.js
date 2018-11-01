'use strict';
const path = require("path");
const exec = require("child_process").exec;

let kubeModule = {
	/**
	 * install kubernetes on machine
	 * @param args
	 * @param callback
	 */
	install: (args, callback) => {
		let execPath = path.normalize(process.env.PWD + "/../libexec/bin/FILES/KUBERNETES");
		if (process.env.PLATFORM === 'Darwin') {
			execPath += "/kubernetes-mac.sh";
		}
		else if (process.env.PLATFORM === 'Linux') {
			execPath += "/kubernetes-linux-install.sh";
		}
		
		//todo: check if kubernetes is already installed
		
		let install = exec("sudo " + execPath, {
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
				return callback(null, "Kubernetes downloaded and installed...")
			}
			else {
				return callback("Error while downloading and installing Kubernetes!");
			}
		});
	},
	
	/**
	 * Return kubernetes ip, port, and token
	 * @param args
	 * @param callback
	 */
	connect: (args, callback) => {
		let execPath = path.normalize(process.env.PWD + "/../libexec/bin/FILES/KUBERNETES/kubernetes-api.sh");
		exec("sudo " + execPath, (err, result) => {
			return callback(err, result)
		});
	},
	
	/**
	 * remove kubernetes from machine
	 * @param args
	 * @param callback
	 */
	remove: (args, callback) => {
		let command;
		if (process.env.PLATFORM === 'Darwin') {
			command = "sudo minikube delete";
		}
		else if (process.env.PLATFORM === 'Linux') {
			command = "apt-get purge -y kubeadm kubectl kubelet kubernetes-cni kube* && apt-get autoremove -y && rm -rf ~/.kube";
		}
		
		// kubeModule.stop([], (error) => {
		// 	if(error){
		// 		console.log(error);
		// 	}
			
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
				// if (code === 0) {
				// 	return callback(null, "Kubernetes removed ...")
				// }
				// else {
				// 	return callback("Error while removing Kubernetes!");
				// }
				console.log(code);
			});
		// });
	},
	
	/**
	 * Start kubernetes
	 * @param args
	 * @param callback
	 */
	start: (args, callback) => {
		
		//todo: check if kubernetes is already running
		
		if (process.env.PLATFORM === 'Darwin') {
			exec("sudo minikube start", (err) => {
				if (err) {
					return callback(err);
				}
				kubeModule.connect(args, callback);
			});
		}
		else if (process.env.PLATFORM === 'Linux') {
			let execPath = path.normalize(process.env.PWD + "/../libexec/bin/FILES/KUBERNETES");
			execPath += "/kubernetes-linux-start.sh";
			let start = exec(execPath, {
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
					process.stdout.write(error);
				}
			});
			
			start.on('close', (code) => {
				if (code === 0) {
					return callback(null, "Kubernetes started on Ubuntu, please run soajs kubernetes connect.")
				}
				else {
					return callback("Error while starting Kubernetes!");
				}
			});
		}
		else {
			return callback(null, "Command inapplicable on Linux machines..")
		}
	},
	
	/**
	 * Stop kubernetes
	 * @param args
	 * @param callback
	 */
	stop: (args, callback) => {
		if (process.env.PLATFORM === 'Darwin') {
			exec("sudo minikube stop", (err) => {
				if (err) {
					return callback(err);
				}
				return callback(null, "Kubernetes stopped..")
			});
		}
		else if (process.env.PLATFORM === 'Linux') {
			
			//get pids of port 6443 --> kubernetes
			exec("lsof -i:6443", (err, commandLines) => {
				if (err) {
					return callback(err);
				}
				if (!commandLines) {
					return callback(null, "Kubernetes stopped..");
				}
				commandLines = commandLines.split("\n");
				if (Array.isArray(commandLines) && commandLines.length > 0) {
					let PIDs = [];
					commandLines.forEach((oneCommandLine) => {
						oneCommandLine = oneCommandLine.replace(/\s+/g, ' ').split(' ');
						if (oneCommandLine[1] && oneCommandLine[1].trim() !== '' && oneCommandLine[1] !== 'PID') {
							
							if (PIDs.indexOf(oneCommandLine[1]) === -1) {
								PIDs.push(oneCommandLine[1]);
							}
						}
					});
					
					//if pids found, stop them
					if (PIDs.length > 0) {
						exec("kill -9 " + PIDs.join(" "), (err) => {
							if (err) {
								return callback(err);
							}
							return callback(null, "Kubernetes stopped..");
						});
					}
					else {
						return callback(null, "Kubernetes stopped..");
					}
				}
				else {
					return callback(null, "Kubernetes stopped..");
				}
			});
		}
		else {
			return callback(null, "Command inapplicable on Linux machines..")
		}
	},
	
	/**
	 * Restart kubernetes
	 * @param args
	 * @param callback
	 */
	restart: (args, callback) => {
		kubeModule.stop(args, (err) => {
			if (err) {
				console.log(err);
				// return callback(err);
			}
			
			setTimeout(() => {
				kubeModule.start(args, callback);
			}, 3000);
		});
	}
};

module.exports = kubeModule;