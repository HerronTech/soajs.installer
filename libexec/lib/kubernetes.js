'use strict';
const path = require("path");
const exec = require("child_process").exec;

function ifLinuxRoot(callback) {
	if (process.env.LOGNAME !== 'root') {
		let output = "This command requires you run it as Root!\n";
		output += "[1] -> sudo su\n";
		output += "[2] -> soajs kubernetes " + process.env.SOAJS_INSTALLER_COMMAND;
		return callback(output);
	}
}

let kubeModule = {
	/**
	 * install kubernetes on machine
	 * @param args
	 * @param callback
	 */
	install: (args, callback) => {
		
		let dockerInstall = "docker --version";
		let dockerStart = "docker ps";
		let execPath = path.normalize(process.env.PWD + "/../libexec/bin/FILES/KUBERNETES");
		
		if (process.env.PLATFORM === 'Darwin') {
			execPath += "/kubernetes-mac.sh";
		}
		else if (process.env.PLATFORM === 'Linux') {
			
			ifLinuxRoot(callback);
			
			execPath += "/kubernetes-linux-install.sh";
			execPath = "sudo " + execPath;
			dockerStart = "sudo " + dockerStart;
		}
		
		//check if docker is installed
		exec(dockerInstall, (error, data) => {
			if (data) {
				
				//check if docker is running
				exec(dockerStart, (err, data) => {
					if (data) {
						
						//install kubernetes
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
								return callback(null, "Kubernetes downloaded and installed...")
							}
							else {
								return callback("Error while downloading and installing Kubernetes!");
							}
						});
					}
					else {
						return callback("Docker is installed but not running on this machine!\n[ RUN ] -> soajs docker start");
					}
				});
			}
			else {
				return callback("Docker is not installed on this machine!\n[ RUN ] -> soajs docker install && soajs docker start");
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
		
		if (process.env.PLATFORM === 'Linux') {
			execPath = "sudo " + execPath;
		}
		
		exec(execPath, (err, result) => {
			return callback(err, result)
		});
	},
	
	/**
	 * remove kubernetes from machine
	 * @param args
	 * @param callback
	 */
	remove: (args, callback) => {
		kubeModule.stop([], (error) => {
			if(error){
				return callback(error);
			}
			
			let command;
			if (process.env.PLATFORM === 'Darwin') {
				command = "sudo minikube delete";
			}
			else if (process.env.PLATFORM === 'Linux') {
				command = "sudo apt-get purge -y kubeadm kubectl kubelet kubernetes-cni && sudo apt-get autoremove -y && sudo  rm -rf ~/.kube";
			}
			
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
					return callback(null, "Kubernetes removed ...")
				}
				else {
					return callback("Error while removing Kubernetes!");
				}
			});
		});
	},
	
	/**
	 * Start kubernetes
	 * @param args
	 * @param callback
	 */
	start: (args, callback) => {
		//check if kubernetes is running
		exec("kubectl get ns", (error, data) => {
			if(data){
				return callback("Kubernetes is already running on this machine!");
			}
			else{
				if (process.env.PLATFORM === 'Darwin') {
					exec("minikube start", (err) => {
						if (err) {
							return callback(err);
						}
						kubeModule.connect(args, callback);
					});
				}
				else if (process.env.PLATFORM === 'Linux') {
					let execPath = path.normalize(process.env.PWD + "/../libexec/bin/FILES/KUBERNETES");
					execPath += "/kubernetes-linux-start.sh";
					let start = exec("sudo " + execPath, {
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
			}
		});
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
				
				return callback(null, "Kubernetes stopped...")
			});
		}
		else if (process.env.PLATFORM === 'Linux') {
			exec("sudo systemctl stop kubelet && sudo kubeadm reset -f", (err) => {
				if (err) {
					return callback(err);
				}
				
				return callback(null, "Kubernetes stopped...");
			});
		}
		else {
			return callback(null, "Command inapplicable on Linux machines...")
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
				return callback(err);
			}
			
			setTimeout(() => {
				kubeModule.start(args, callback);
			}, 3000);
		});
	}
};

module.exports = kubeModule;