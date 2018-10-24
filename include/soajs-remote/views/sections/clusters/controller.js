"use strict";
var clustersApp = app.components;
clustersApp.controller('clustersCtrl', ['$scope', '$timeout', 'ngDataApi', function ($scope, $timeout, ngDataApi) {
	$scope.alerts = [];
	
	$scope.mongo = true;
	
	$scope.local = true;
	$scope.external = false;
	
	$scope.closeAlert = function (i) {
		$scope.alerts.splice(i, 1);
	};

	$scope.goBack = function () {
		$scope.$parent.go("#/security");
	};

	$scope.skip = function(){
		$scope.$parent.go("#/deployment");
	};

	$scope.AddNewServer = function () {
		$scope.clusters.servers.push({"host": "", "port": ""})
		
		$timeout(function(){
			resizeContent();
		}, 100);
	};
	
	$scope.removeServer = function (index) {
		$scope.clusters.servers.splice(index, 1);
		
		$timeout(function(){
			resizeContent();
		}, 100);
	};
	
	$scope.doMongoExt = function(optValue) {
		if(optValue !== undefined){
			$scope.clusters.mongoExt = optValue;
		}
		else{
			$scope.clusters.mongoExt = !$scope.clusters.mongoExt;
		}
		renderAccordion();
	};
	
	function renderAccordion(){
		
		if($scope.clusters.mongoExt){
			$scope.external = true;
			$scope.local = false;
		}
		else{
			$scope.external = false;
			$scope.local = true;
		}
		$timeout(function(){
			if($scope.clusters.mongoExt){
				$scope.accordion.groups[0].isOpen = false;
				$scope.accordion.groups[1].isOpen = true;
				$scope.external = true;
				$scope.local = false;
			}
			else{
				$scope.accordion.groups[0].isOpen = true;
				$scope.accordion.groups[1].isOpen = false;
				$scope.external = false;
				$scope.local = true;
			}
			$scope.uncheckReplica();
			resizeContent();
		}, 10);
	}
	
	$scope.uncheckReplica = function() {
		if(!$scope.clusters.mongoExt) {
            $scope.clusters.isReplica = false;
            $scope.resetMongoInput();
        }
        $timeout(function(){
			resizeContent();
        }, 100);
	};

	$scope.resetMongoInput = function() {
		if(!$scope.clusters.isReplica) {
			$scope.clusters.replicaSet = "";
        	$scope.clusters.servers = [$scope.clusters.servers[0]];
    	}
		$timeout(function(){
			resizeContent();
		}, 100);
	};

	$scope.fillClusters = function () {
		var data = angular.copy($scope.clusters);
		
		try {
			data.URLParam = JSON.parse(data.URLParam);
		}
		catch (e) {
			alert("URL Parameters should be a JSON object!");
			return false;
		}

		try {
			data.streaming = JSON.parse(data.streaming);
		}
		catch (e) {
			alert("Streaming should be a JSON object!");
			return false;
		}
		
		var options = {
			url: appConfig.url + "/installer/clusters",
			method: "post",
			data: {
				"clusters": data,
				"deployment": $scope.deployment
			}
		};
		
		ngDataApi.post($scope, options, function (error) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			$scope.$parent.go("#/deployment");
		});
	};

	$scope.loadClusters = function () {
		var options = {
			url: appConfig.url + "/installer/clusters",
			method: "get"
		};

		ngDataApi.get($scope, options, function (error, response) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			
			
			$scope.deployment = response.deployment;
			$scope.deployment.deployType = (response && response.deployment.deployType) ? response.deployment.deployType : "manual";
			$scope.deployment.mongoExposedPort = (response && response.deployment.mongoExposedPort) ? response.deployment.mongoExposedPort : 32017;

			$scope.containerDeployment = $scope.deployment.deployType === "container";
			
			$scope.clusters = {
				"prefix": (response && response.clusters && response.clusters.prefix) ? response.clusters.prefix : "",
                "mongoExt": (response && response.clusters && response.clusters.mongoExt) ? response.clusters.mongoExt : false,
                "servers": (response && response.clusters && response.clusters.servers) ? response.clusters.servers : [{"host": "127.0.0.1", "port": 27017}],
                "isReplica": (response && response.clusters && response.clusters.replicaSet) ? true : false,
				"replicaSet": (response && response.clusters && response.clusters.replicaSet) ? response.clusters.replicaSet : "",
				"credentials": (response && response.clusters && response.clusters.credentials) ? response.clusters.credentials : {
					"username": "",
					"password": ""
				},
				"URLParam": (response && response.clusters && response.clusters.URLParam) ? JSON.stringify(response.clusters.URLParam, null, 2) : JSON.stringify({
					"bufferMaxEntries": 0,
					"maxPoolSize": 5,
				}, null, 2),
				"streaming": (response && response.clusters && response.clusters.streaming) ? JSON.stringify(response.clusters.streaming, null, 2) : JSON.stringify({})
			};
			
			if($scope.deployment.deployType === 'manual'){
				if($scope.clusters.servers[0].host === '127.0.0.1'){
					$scope.clusters.servers[0].host = 'localhost';
				}
			}
			
			if(!$scope.containerDeployment){
				$scope.clusters.mongoExt = true;
			}
			
			renderAccordion();
		});
	};
	
	//execute default method
	$scope.loadClusters();
}]);
