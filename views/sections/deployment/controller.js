"use strict";

var deploymentApp = app.components;
deploymentApp.controller('deploymentCtrl', ['$scope', 'ngDataApi', '$modal', '$timeout', '$cookies', function ($scope, ngDataApi, $modal, $timeout, $cookies) {
	$scope.alerts = [];
	
	$scope.goBack = function () {
		$scope.$parent.go("#/resources");
	};
	
	$scope.removeConfirmation = function () {
		$scope.confirmation = false;
		$cookies.remove('confirmation');
	};
	
	$scope.closeAlert = function (i) {
		$scope.alerts.splice(i, 1);
	};
	
	$scope.accordion1 = {
		machine: true,
		image: false,
		certificates: true,
		deploymentDocker: true,
		token: true,
		namespace: true,
		readiness: false,
		deploymentKube: true,
		ui: true,
		nginx: true
	};
	
	$scope.accordion2 = {
		gi: true,
		security: false,
		clusters: false,
		deployment: false
	};
	
	$scope.tabSwitched = function () {
		$timeout(function () {
			resizeContent();
		}, 100);
	};
	
	$scope.evaluateDeploymentChoice = function () {
		$scope.ha = false;
		$scope.docker = false;
		$scope.kubernetes = false;
		
		if ($scope.deployment.deployDriver !== "manual") {
			$scope.ha = true;
			$scope.deployment.deployType = "container";
			var types = ["container.docker.remote", "container.kubernetes.remote"];
			$scope.local = (types.indexOf($scope.deployment.deployDriver) === -1);
			
			if ($scope.deployment.deployDriver.indexOf("docker") !== -1) {
				$scope.docker = true;
			}
			if ($scope.deployment.deployDriver.indexOf("kubernetes") !== -1) {
				$scope.kubernetes = true;
			}
			
			if (!$scope.local) {
				$scope.deployment.deployDockerNodes = [];
				$scope.deployment.deployDockerNodes.push($scope.deployment.containerHost);
			}
		}
		else {
			$scope.deployment.deployType = "manual";
		}
	};
	
	$scope.getLatestSOAJSImages = function (prefix, name, reload) {
		if (!$scope.image) {
			$scope.image = {};
		}
		
		let options = {
			url: appConfig.url + "/soajs/versions",
			method: "get",
			params: {
				prefix: prefix,
				name: name
			}
		};
		ngDataApi.get($scope, options, function (error, response) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
			}
			else {
				if (reload) {
					$scope.deployment[name + 'ImageTag'] = "latest";
				}
				
				$scope.image[name] = [];
				$scope.image[name] = response;
			}
		});
	};
	
	$scope.goToFinal = function () {
		
		var options = {
			url: appConfig.url + "/installer/deployment",
			method: "post",
			data: {
				"deployment": {
					"deployType": "manual",
					"deployDriver": "manual"
				}
			}
		};
		
		ngDataApi.post($scope, options, function (error, response) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			
			$scope.confirmation = true;
			$scope.data = {
				"gi": (response.gi) ? syntaxHighlight(JSON.stringify(response.gi, null, 4)) : JSON.stringify({}),
				"security": (response.security) ? syntaxHighlight(JSON.stringify(response.security, null, 2)) : JSON.stringify({}),
				"clusters": (response.clusters) ? syntaxHighlight(response.clusters) : JSON.stringify({}),
				"deployment": (response.deployment) ? syntaxHighlight(response.deployment) : JSON.stringify({})
			};
			$timeout(function () {
				resizeContent();
			}, 10);
		});
	};
	
	$scope.fillDeployment = function () {
		var data = angular.copy($scope.deployment);
		for (var i in data) {
			if (data[i] === null) {
				delete data[i];
			}
		}
		if (!data.gitPath && data.gitOwner && data.gitRepo && data.gitProvider) {
			data.gitPath = "/";
		}
		var options = {
			url: appConfig.url + "/installer/deployment",
			method: "post",
			data: {
				"deployment": data
			}
		};
		
		ngDataApi.post($scope, options, function (error, response) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			
			$scope.confirmation = true;
			$cookies.putObject('confirmation', $scope.confirmation);
			$scope.data = {
				"gi": (response.gi) ? response.gi : {},
				"security": (response.security) ? response.security : {},
				"clusters": (response.clusters) ? response.clusters : {},
				"deployment": (response.deployment) ? response.deployment : {}
			};
			
			if($scope.data.deployment.nginxDeployType === 'NodePort'){
				$scope.data.deployment.nginxPort += 30000;
				$scope.data.deployment.nginxSecurePort += 30000;
			}
			
			$timeout(function () {
				resizeContent();
			}, 10);
		});
	};
	
	$scope.submit = function (form) {
		$scope.alerts = [];
		
		if ($scope.deployment.deployDriver.indexOf("kubernetes") !== -1) {
			if (!$scope.deployment.nginxSsl || $scope.deployment.nginxSsl && $scope.deployment.generateSsc) {
				$scope.deployment.nginxKubeSecret = null;
			}
			
			if(!$scope.deployment.namespaces || !$scope.deployment.namespaces.default){
				$scope.alerts.push({'type': 'danger', 'msg': 'Missing required field [namespaces]'});
				$scope.$valid = false;
			}
			
			if(!$scope.deployment.authentication || !$scope.deployment.authentication.accessToken){
				$scope.alerts.push({'type': 'danger', 'msg': 'Missing required field [kubernetes authentication token]'});
				$scope.$valid = false;
			}
		}
		else if($scope.deployment.deployDriver.indexOf("docker") !== -1){
			if(!$scope.deployment.authentication || !$scope.deployment.authentication.accessToken){
				$scope.alerts.push({'type': 'danger', 'msg': 'Missing required field [docker authentication token]'});
				$scope.$valid = false;
			}
			
			if(!$scope.deployment.dockerSocket){
				$scope.alerts.push({'type': 'danger', 'msg': 'Missing required fields [Docker Socket Directory]'});
				$scope.$valid = false;
			}
		}
		
		if($scope.deployment.nginxDeployType === 'LoadBalancer'){
			$scope.deployment.nginxPort = 80;
			$scope.deployment.nginxSecurePort = 443;
		}
		
		if($scope.deployment.nginxPort < appConfig.kubernetes.minPort || $scope.deployment.nginxPort > appConfig.kubernetes.maxPort){
			$scope.alerts.push({'type': 'danger', 'msg': `HTTP Port should be within the range of: ${appConfig.kubernetes.minPort} and ${appConfig.kubernetes.maxPort}`});
			form.$valid = false;
		}
		
		if($scope.deployment.nginxSecurePort < appConfig.kubernetes.minPort || $scope.deployment.nginxSecurePort > appConfig.kubernetes.maxPort){
			$scope.alerts.push({'type': 'danger', 'msg': `HTTP Secure Port should be within the range of: ${appConfig.kubernetes.minPort} and ${appConfig.kubernetes.maxPort}`});
			form.$valid = false;
		}
		
		if($scope.deployment.nginxSecurePort === $scope.deployment.nginxPort){
			$scope.alerts.push({'type': 'danger', 'msg': `HTTP Port and HTTP Secure Port cannot be the same!`});
			form.$valid = false;
		}
		
		if (form.$valid) { //submit form if it is valid
			$scope.fillDeployment();
		}
	};
	
	$scope.installSOAJS = function () {
		
		var options = {
			url: appConfig.url + "/installer/go",
			method: "get"
		};
		
		ngDataApi.get($scope, options, function (error) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			$scope.$parent.go("#/progress");
		});
	};
	
	$scope.loadDeployment = function () {
		var options = {
			url: appConfig.url + "/installer/deployment",
			method: "get"
		};
		$scope.portsCommandReveal;
		ngDataApi.get($scope, options, function (error, response) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			
			$scope.deployment = {
				"deployType": (response && response.deployType) ? response.deployType : "manual",
				"deployDriver": (response && response.deployDriver) ? response.deployDriver : "manual",
				"deployDockerNodes": (response && response.deployDockerNodes) ? response.deployDockerNodes : ['127.0.0.1'],
				"containerHost": (response && response.containerHost) ? response.containerHost : "127.0.0.1",
				"soajsImagePrefix": (response && response.soajsImagePrefix) ? response.soajsImagePrefix : "soajsorg",
				"nginxImagePrefix": (response && response.nginxImagePrefix) ? response.nginxImagePrefix : "soajsorg",
				
				"soajsImageTag": (response && response.soajsImageTag) ? response.soajsImageTag : "latest",
				"nginxImageTag": (response && response.nginxImageTag) ? response.nginxImageTag : "latest",
				
				"nginxPort": (response && response.nginxPort) ? response.nginxPort : 80,
				"nginxSecurePort": (response && response.nginxSecurePort) ? response.nginxSecurePort : 443,
				"nginxSsl": (response && response.nginxSsl) ? response.nginxSsl : false,
				"nginxDeployType": (response && response.nginxDeployType) ? response.nginxDeployType : "NodePort",
				
				"dockerReplica": (response && response.dockerReplica) ? response.dockerReplica : 1
			};
			$scope.deployment.mongoExt = response.mongoExt;
			if (!response.mongoExt) {
				$scope.deployment.mongoExposedPort = (response && response.mongoExposedPort) ? response.mongoExposedPort : 32017;
			}
			
			if ($scope.deployment.deployDriver.indexOf("docker") !== -1) {
				$scope.deployment.containerDir = (response && response.docker && response.docker.containerDir) ? response.docker.containerDir : "/opt/soajs/deployer";
				$scope.deployment.containerPort = (response && response.docker && response.docker.containerPort) ? response.docker.containerPort : 443;
				$scope.deployment.networkName = (response && response.docker && response.docker.networkName) ? response.docker.networkName : "soajsnet";
				$scope.deployment.dockerInternalPort = (response && response.docker && response.docker.dockerInternalPort) ? response.docker.dockerInternalPort : 444;
				
				$scope.portsCommandReveal = "docker ps";
				
				//if remote docker save certs files
				if ($scope.deployment.deployDriver.indexOf("remote") !== -1) {
					$scope.deployment.dockerSocket = "/var/run/docker.sock";
					
					$scope.deployment.authentication = {
						accessToken: (response.authentication) ? response.authentication.accessToken: '',
						apiPort: 32376,
						protocol: 'https'
					};
				}
				else if ($scope.deployment.deployDriver.indexOf("local") !== -1) {
					$scope.deployment.dockerSocket = "/var/run/docker.sock";
					
					$scope.deployment.authentication = {
						accessToken: (response.authentication) ? response.authentication.accessToken: '',
						apiPort: 32376,
						protocol: 'https'
					};
				}
			}
			else if ($scope.deployment.deployDriver.indexOf("kubernetes") !== -1) {
				$scope.deployment.containerDir = (response && response.kubernetes && response.kubernetes.containerDir) ? response.kubernetes.containerDir : "/opt/soajs/deployer";
				$scope.deployment.kubeContainerPort = (response && response.kubernetes && response.kubernetes.containerPort) ? response.kubernetes.containerPort : 8443;
				
				//get readiness Probes information
				$scope.deployment.readinessProbe = {};
				//Initial Deploy Seconds
				$scope.deployment.readinessProbe.initialDelaySeconds = (response && response.readinessProbe
					&& response.readinessProbe.initialDelaySeconds) ? response.readinessProbe.initialDelaySeconds : 15;
				//Time Out Seconds
				$scope.deployment.readinessProbe.timeoutSeconds = (response && response.readinessProbe
					&& response.readinessProbe.timeoutSeconds) ? response.readinessProbe.timeoutSeconds : 1;
				//Period Seconds
				$scope.deployment.readinessProbe.periodSeconds = (response && response.readinessProbe
					&& response.readinessProbe.periodSeconds) ? response.readinessProbe.periodSeconds : 10;
				//Success Threshol
				$scope.deployment.readinessProbe.successThreshold = (response && response.readinessProbe
					&& response.readinessProbe.successThreshold) ? response.readinessProbe.successThreshold : 1;
				//Failure Threshold
				$scope.deployment.readinessProbe.failureThreshold = (response && response.readinessProbe
					&& response.readinessProbe.failureThreshold) ? response.readinessProbe.failureThreshold : 3;
				
				$scope.deployment.namespaces = {
					default: (response && response.namespaces && response.namespaces.default) ? response.namespaces.default : 'soajs',
					perService: (response && response.namespaces && response.namespaces.perService) ? response.namespaces.perService : false
				};
				
				//get kubernetes authentication token
				$scope.deployment.authentication = {};
				$scope.deployment.authentication.accessToken = (response && response.authentication && response.authentication.accessToken) ? response.authentication.accessToken : "";
				
				//NGINX Kubernetes SSL information
				$scope.deployment.generateSsc = (response && response.generateSsc) ? response.generateSsc : true;
				$scope.deployment.nginxKubeSecret = (response && response.nginxKubeSecret) ? response.nginxKubeSecret : null;
				
				$scope.portsCommandReveal = "kubectl get services -n " + $scope.deployment.namespaces.default;
			}
			
			$scope.evaluateDeploymentChoice();
			resizeContent();
		});
	};
	
	$scope.loadDeployment();
}]);
