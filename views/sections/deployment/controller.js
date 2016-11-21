"use strict";
var deploymentApp = app.components;
deploymentApp.controller('deploymentCtrl', ['$scope', 'ngDataApi', '$modal', '$timeout', function ($scope, ngDataApi, $modal, $timeout) {
	$scope.alerts = [];
	$scope.confirmation = false;
	
	$scope.goBack = function () {
		$scope.$parent.go("#/clusters");
	};
	
	$scope.closeAlert = function (i) {
		$scope.alerts.splice(i, 1);
	};
	
	$scope.evaluateDeploymentChoice = function () {
		$scope.ha = false;
		
		if ($scope.deployment.deployDriver !== "manual") {
			$scope.ha = true;
			$scope.deployment.deployType = "container";
			var types = ["container.docker.remote", "container.kubernetes.remote"];
			$scope.local = (types.indexOf($scope.deployment.deployDriver) ===  -1);
			
			if($scope.deployment.deployDriver.indexOf("remote") !== -1){
				$scope.deployment.deployDockerNodes = [];
				$scope.deployment.deployDockerNodes.push($scope.deployment.containerHost);
			}
		}
		else{
			$scope.deployment.deployType = "manual";
		}
	};
	
	$scope.goToFinal = function(){
		$timeout(function(){
			$scope.fillDeployment();
		}, 1000);
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
			$scope.data = {};
			
			if(response.gi) {
				$scope.data.gi = syntaxHighlight(JSON.stringify(response.gi, null, 4));
			}
			
			if(response.security) {
				$scope.data.security = syntaxHighlight(JSON.stringify(response.security, null, 4));
			}
			
			if(response.clusters) {
				$scope.data.clusters = syntaxHighlight(JSON.stringify(response.clusters, null, 4));
			}
			
			if(response.deployment) {
				$scope.data.deployment = syntaxHighlight(JSON.stringify(response.deployment, null, 4));
			}
			
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
			
			$scope.ha = (response.deployType !== 'manual');
			$scope.deployment = {
				"deployType": (response && response.deployType) ? response.deployType : "manual",
				"deployDriver": (response && response.deployDriver) ? response.deployDriver : "manual",
				"deployDockerNodes": (response && response.deployDockerNodes) ? response.deployDockerNodes : [],
				"containerHost": (response && response.containerHost) ? response.containerHost : "127.0.0.1",
				"containerDir": (response && response.containerDir) ? response.containerDir : "",
				"mongoExt": (response && response.mongoExt) ? response.mongoExt : false,
				"gitOwner": (response && response.gitOwner) ? response.gitOwner : null,
                "gitRepo": (response && response.gitRepo) ? response.gitRepo : null,
                "gitToken": (response && response.gitToken) ? response.gitToken : null,
				"imagePrefix": (response && response.imagePrefix) ? response.imagePrefix : "soajsorg",
                "nginxPort": (response && response.nginxPort) ? response.nginxPort : 80,
                "nginxSecurePort": (response && response.nginxSecurePort) ? response.nginxSecurePort : 443,
                "nginxSsl": (response && response.nginxSsl) ? response.nginxSsl : false,
				"dockerSocket": (response && response.dockerSocket) ? response.dockerSocket : "/var/run/docker.sock",
				"networkName": (response && response.networkName) ? response.networkName : "soajsnet",
                "containerPort": (response && response.containerPort) ? response.containerPort : 2376,
                "dockerInternalPort": (response && response.dockerInternalPort) ? response.dockerInternalPort : 2377,
                "dockerReplica": (response && response.dockerReplica) ? response.dockerReplica : 1
			};
			
			$scope.evaluateDeploymentChoice();
			resizeContent();
		});
	};
	$scope.loadDeployment();
}]);