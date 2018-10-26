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
			execPath += "/kubernetes-linux.sh";
		}
		let install = exec("sudo " + execPath, {"stdio": 'inherit'});
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
				return callback(null, "Kubernetes downloaded and installed...")
			}
			else{
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
			command = "sudo kubeadm reset && sudo apt-get purge kubeadm kubectl kubelet kubernetes-cni kube* && sudo apt-get autoremove && sudo rm -rf ~/.kube && docker volume rm etcd";
		}
		exec(command, callback);
	},
	
	/**
	 * Start kubernetes
	 * @param args
	 * @param callback
	 */
	start: (args, callback) => {
		if (process.env.PLATFORM === 'Darwin') {
			exec("sudo minikube start", (err) => {
				if (err) {
					return callback(err);
				}
				kubeModule.connect(args, callback);
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
		
		if (process.env.PLATFORM === 'Darwin') {
			kubeModule.stop(args, (err) => {
				if (err) {
					return callback(err);
				}
				
				setTimeout(() => {
					kubeModule.start(args, callback);
				}, 3000);
			});
		}
		else {
			return callback(null, "Command inapplicable on Linux machines..")
		}
	}
};

module.exports = kubeModule;