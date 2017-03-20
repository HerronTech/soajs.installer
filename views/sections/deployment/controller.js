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

    $scope.submit = function(form) {
        if (form.$valid) { //submit form if it is valid
            $scope.fillDeployment();
        } else if($scope.kubernetes){
            $scope.alerts.push({'type': 'danger', 'msg': 'Missing required fields [access token,  namespaces]'});
        } else if($scope.deployment.deployDriver.indexOf("docker.remote") !== -1){
            $scope.alerts.push({'type': 'danger', 'msg': 'Missing required fields [certificates]'});
		}
    }

	$scope.installSOAJS = function(){

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
				"gitSource": (response && response.gitSource) ? response.gitSource : null,
				"gitProvider": (response && response.gitProvider) ? response.gitProvider : null,
				"gitOwner": (response && response.gitOwner) ? response.gitOwner : null,
                "gitRepo": (response && response.gitRepo) ? response.gitRepo : null,
                "gitBranch": (response && response.gitBranch) ? response.gitBranch : "master",
                "gitToken": (response && response.gitToken) ? response.gitToken : null,
				"imagePrefix": (response && response.imagePrefix) ? response.imagePrefix : "soajsorg",
				"certsRequired": false,

				"nginxPort": (response && response.nginxPort) ? response.nginxPort : 80,
                "nginxSecurePort": (response && response.nginxSecurePort) ? response.nginxSecurePort : 443,
                "nginxSsl": (response && response.nginxSsl) ? response.nginxSsl : false,
				"nginxDeployType": (response && response.nginxDeployType) ? response.nginxDeployType : "NodePort",

                "dockerReplica": (response && response.dockerReplica) ? response.dockerReplica : 1
			};

			if($scope.deployment.deployDriver.indexOf("docker") !== -1){
				$scope.deployment.containerDir = (response && response.docker && response.docker.containerDir) ? response.docker.containerDir : "";
				$scope.deployment.containerPort = (response && response.docker && response.docker.containerPort) ? response.docker.containerPort : 2376;
				$scope.deployment.networkName = (response && response.docker && response.docker.networkName) ? response.docker.networkName : "soajsnet";
				$scope.deployment.dockerInternalPort = (response && response.docker && response.docker.dockerInternalPort) ? response.docker.dockerInternalPort : 2377;
				//if remote docker save certs files
                if($scope.deployment.deployDriver.indexOf("remote") !== -1){
                	$scope.deployment.certsRequired = true;
                	$scope.deployment.certificates = {};
                }
                else if($scope.deployment.deployDriver.indexOf("local") !== -1){
                    $scope.deployment.certsRequired = false;
                    $scope.deployment.dockerSocket = (response && response.docker && response.docker.dockerSocket) ? response.docker.dockerSocket : "/var/run/docker.sock";
				}
			}
			else if ($scope.deployment.deployDriver.indexOf("kubernetes") !== -1){
                $scope.deployment.certsRequired = false;
				$scope.deployment.containerDir = (response && response.kubernetes && response.kubernetes.containerDir) ? response.kubernetes.containerDir : "";
				$scope.deployment.kubeContainerPort = (response && response.kubernetes && response.kubernetes.containerPort) ? response.kubernetes.containerPort : 8443;

				//get certificate information
				$scope.deployment.certificates = {};
				//CA certificate
                $scope.deployment.certificates.caCertificate = (response && response.certificates && response.certificates.caCertificate) ? response.certificates.caCertificate : "";
                //Cert certificate
                $scope.deployment.certificates.certCertificate = (response && response.certificates && response.certificates.certCertificate) ? response.certificates.certCertificate : "";
                //CA certificate
                $scope.deployment.certificates.keyCertificate = (response && response.certificates && response.certificates.keyCertificate) ? response.certificates.keyCertificate : "";

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
					default: (response && response.namespaces && response.namespaces.default) ? response.namespaces.default : '',
					perService: (response && response.namespaces && response.namespaces.perService) ? response.namespaces.perService : false
				};

				//get kubernetes authentication token
				$scope.deployment.authentication = {};
				$scope.deployment.authentication.accessToken = (response && response.authentication && response.authentication.accessToken) ? response.authentication.accessToken : "";
			}

			$scope.evaluateDeploymentChoice();
			resizeContent();
		});
	};
	$scope.loadDeployment();
}]);
