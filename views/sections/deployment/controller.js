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
		
		if ($scope.deployment.deployDriver !== "manual") {
			$scope.ha = true;
			$scope.deployment.deployType = "container";
			var types = ["container.docker.remote", "container.kubernetes.remote"];
			$scope.local = (types.indexOf($scope.deployment.deployDriver) ===  -1);
			
			if(!$scope.local){
				$scope.deployment.deployDockerNodes = [];
				$scope.deployment.deployDockerNodes.push($scope.deployment.containerHost);
			}
		}
		else{
			$scope.deployment.deployType = "manual";
		}
	};
	
	$scope.fillDeployment = function () {
		var data = angular.copy($scope.deployment);
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
				"gi": syntaxHighlight(JSON.stringify(response.gi, null, 4)),
				"security": syntaxHighlight(JSON.stringify(response.security, null, 2)),
				"clusters": syntaxHighlight(response.clusters),
				"deployment": syntaxHighlight(response.deployment)
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
				"containerDir": (response && response.containerDir) ? response.containerDir : "",
				"mongoExt": (response && response.mongoExt) ? response.mongoExt : false,
				"gitOwner": (response && response.gitOwner) ? response.gitOwner : null,
                "gitRepo": (response && response.gitRepo) ? response.gitRepo : null,
                "gitToken": (response && response.gitToken) ? response.gitToken : null,
				"soajsImagePrefix": (response && response.soajsImagePrefix) ? response.soajsImagePrefix : "soajsorg",
                "nginxPort": (response && response.nginxPort) ? response.nginxPort : 80,
                "nginxSecurePort": (response && response.nginxSecurePort) ? response.nginxSecurePort : 443,
                "nginxSsl": (response && response.nginxSsl) ? response.nginxSsl : false,
				"dockerSocket": (response && response.dockerSocket) ? response.dockerSocket : "/var/run/docker.sock",
				"networkName": (response && response.networkName) ? response.networkName : "soajsnet",
                "containerPort": (response && response.containerPort) ? response.containerPort : 2376,
                "dockerInternalPort": (response && response.dockerInternalPort) ? response.dockerInternalPort : 2377,
                "dockerReplica": (response && response.dockerReplica) ? response.dockerReplica : 1,
				"certificatesFolder": (response && response.certificatesFolder) ? response.certificatesFolder : null,
			};
			
			$scope.evaluateDeploymentChoice();
			resizeContent();
		});
	};
	$scope.loadDeployment();
}]);