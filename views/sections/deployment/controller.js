"use strict";
var deploymentApp = app.components;
deploymentApp.controller('deploymentCtrl', ['$scope', 'ngDataApi', '$modal', '$timeout', function ($scope, ngDataApi, $modal, $timeout) {
	$scope.alerts = [];
	
	$scope.goBack = function () {
		$scope.$parent.go("#/clusters");
	};
	
	$scope.closeAlert = function (i) {
		$scope.alerts.splice(i, 1);
	};
	
	$scope.evaluateDeploymentChoice = function () {
		$scope.ha = false;
		$scope.docker = false;
		$scope.kubernetes = false;

		if ($scope.deployment.deployDriver !== "manual") {
			$scope.ha = true;
			$scope.deployment.deployType = "container";
			var types = ["container.docker.remote", "container.kubernetes.remote"];
			$scope.local = (types.indexOf($scope.deployment.deployDriver) ===  -1);

			if($scope.deployment.deployDriver.indexOf("docker") !== -1){
                $scope.docker = true;
            }
            if($scope.deployment.deployDriver.indexOf("kubernetes") !== -1) {
                $scope.kubernetes = true;
            }

			if(!$scope.local){
				$scope.deployment.deployDockerNodes = [];
				$scope.deployment.deployDockerNodes.push($scope.deployment.containerHost);
			}
		}
		else{
			$scope.deployment.deployType = "manual";
		}
	};

	$scope.goToFinal = function(){
		var options = {
			url: appConfig.url + "/installer/deployment",
			method: "post",
			data: {
				"deployment": {
					"deployType" : "manual",
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
				"security": (response.security) ? syntaxHighlight(JSON.stringify(response.security, null, 2)): JSON.stringify({}),
				"clusters": (response.clusters) ? syntaxHighlight(response.clusters): JSON.stringify({}),
				"deployment": (response.deployment) ? syntaxHighlight(response.deployment): JSON.stringify({})
			};
			$timeout(function(){
				resizeContent();
			}, 10);
		});
	};

	$scope.fillDeployment = function () {
		var data = angular.copy($scope.deployment);
		for(var i in data){
			if(data[i] === null){
				delete data[i];
			}
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
			$scope.data = {
				"gi": (response.gi) ? syntaxHighlight(JSON.stringify(response.gi, null, 4)) : JSON.stringify({}),
				"security": (response.security) ? syntaxHighlight(JSON.stringify(response.security, null, 2)): JSON.stringify({}),
				"clusters": (response.clusters) ? syntaxHighlight(response.clusters): JSON.stringify({}),
				"deployment": (response.deployment) ? syntaxHighlight(response.deployment): JSON.stringify({})
			};
			$timeout(function(){
				resizeContent();
			}, 10);
		});
	};
	
	$scope.installSOAJS = function(){
		var options = {
			url: appConfig.url + "/installer/go",
			method: "get"
		};
		
		ngDataApi.get($scope, options, function (error, response) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			var currentScope = $scope;
			var keyModal = $modal.open({
				templateUrl: 'deployModal.tmpl',
				size: 'lg',
				backdrop: false,
				keyboard: false,
				controller: function ($scope) {
					$scope.hosts = response.hosts;
					$scope.ui = response.ui;
					$scope.cmd = response.cmd;
					$scope.deployment = currentScope.deployment;
					$scope.finalize = function () {
						keyModal.close();
					};
				}
			});
		});
	};
	
	$scope.loadDeployment = function () {
		var options = {
			url: appConfig.url + "/installer/deployment",
			method: "get"
		};
		
		ngDataApi.get($scope, options, function (error, response) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}

			$scope.deployment = {
				"deployType": (response && response.deployType) ? response.deployType : "manual",
				"deployDriver": (response && response.deployDriver) ? response.deployDriver : "manual",
				"deployDockerNodes": (response && response.deployDockerNodes) ? response.deployDockerNodes : [],
				"containerHost": (response && response.containerHost) ? response.containerHost : "127.0.0.1",
				"gitOwner": (response && response.gitOwner) ? response.gitOwner : null,
                "gitRepo": (response && response.gitRepo) ? response.gitRepo : null,
                "gitToken": (response && response.gitToken) ? response.gitToken : null,
				"imagePrefix": (response && response.imagePrefix) ? response.imagePrefix : "soajsorg",
                
				"nginxPort": (response && response.nginxPort) ? response.nginxPort : 80,
                "nginxSecurePort": (response && response.nginxSecurePort) ? response.nginxSecurePort : 443,
                "nginxSsl": (response && response.nginxSsl) ? response.nginxSsl : false,
				
                "dockerReplica": (response && response.dockerReplica) ? response.dockerReplica : 1
			};

			if($scope.deployment.deployDriver.indexOf("docker") !== -1){
				$scope.deployment.containerDir = (response && response.docker && response.docker.containerDir) ? response.docker.containerDir : "";
				$scope.deployment.containerPort = (response && response.docker && response.docker.containerPort) ? response.docker.containerPort : 2376;
				$scope.deployment.dockerSocket = (response && response.docker && response.docker.dockerSocket) ? response.docker.dockerSocket : "/var/run/docker.sock";
				$scope.deployment.networkName = (response && response.docker && response.docker.networkName) ? response.docker.networkName : "soajsnet";
				$scope.deployment.dockerInternalPort = (response && response.docker && response.docker.dockerInternalPort) ? response.docker.dockerInternalPort : 2377;
			}
			else if ($scope.deployment.deployDriver.indexOf("kubernetes") !== -1){
				$scope.deployment.containerDir = (response && response.kubernetes && response.kubernetes.containerDir) ? response.kubernetes.containerDir : "";
				$scope.deployment.kubeContainerPort = (response && response.kubernetes && response.kubernetes.containerPort) ? response.kubernetes.containerPort : 8443;
			}
			
			$scope.evaluateDeploymentChoice();
			resizeContent();
		});
	};
	$scope.loadDeployment();
}]);