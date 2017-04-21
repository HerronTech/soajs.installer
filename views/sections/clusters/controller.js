"use strict";
var clustersApp = app.components;
clustersApp.controller('clustersCtrl', ['$scope', '$timeout', 'ngDataApi', function ($scope, $timeout, ngDataApi) {
	$scope.alerts = [];

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
	$scope.AddEsNewServer = function () {
		$scope.es_clusters.servers.push({"host": "", "port": ""});
		
		$timeout(function () {
			resizeContent();
		}, 100);
	};
	
	$scope.removeServer = function (index) {
		$scope.clusters.servers.splice(index, 1);
		
		$timeout(function(){
			resizeContent();
		}, 100);
	};
	
	$scope.removeEsServer = function (index) {
		$scope.es_clusters.servers.splice(index, 1);
		
		$timeout(function () {
			resizeContent();
		}, 100);
	};
	
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
		var es_data = angular.copy($scope.es_clusters);
		
		try {
			data.URLParam = JSON.parse(data.URLParam);
		}
		catch (e) {
			alert("URL Parameters should be a JSON object!");
			return false;
		}
		try {
			data.extraParam = JSON.parse(data.extraParam);
		}
		catch (e) {
			alert("Extra Parameters should be a JSON object!");
			return false;
		}

		try {
			data.streaming = JSON.parse(data.streaming);
		}
		catch (e) {
			alert("Streaming should be a JSON object!");
			return false;
		}
		if ($scope.analytics) {
			try {
				es_data.URLParam = JSON.parse(es_data.URLParam);
			}
			catch (e) {
				alert("ElasticSearch URL Parameters should be a JSON object!");
				return false;
			}
			try {
				es_data.extraParam = JSON.parse(es_data.extraParam);
			}
			catch (e) {
				alert("ElasticSearch Extra Parameters should be a JSON object!");
				return false;
			}
			
		}
		var es_options = {
			url: appConfig.url + "/installer/esClusters",
			method: "post",
			data: {
				"es_clusters": es_data
			}
		};
		
		var options = {
			url: appConfig.url + "/installer/clusters",
			method: "post",
			data: {
				"clusters": data
			}
		};

		ngDataApi.post($scope, options, function (error) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			
			ngDataApi.post($scope, es_options, function (error) {
				if (error) {
					$scope.alerts.push({'type': 'danger', 'msg': error.message});
					return false;
				}
				$scope.$parent.go("#/deployment");
			});
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
			$scope.deployAnalytics = (response && response.deployment.deployAnalytics) ? response.deployment.deployAnalytics : false;
			$scope.deployment = {
                "deployType": (response && response.deployment.deployType) ? response.deployment.deployType : "manual"
			};

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
					"connectTimeoutMS": 0,
					"socketTimeoutMS": 0,
					"maxPoolSize": 5,
					"wtimeoutMS": 0,
					"slaveOk": true
				}, null, 2),
				"extraParam": (response && response.clusters && response.clusters.extraParam) ? JSON.stringify(response.clusters.extraParam, null, 2) : JSON.stringify({
					"db": {
						"native_parser": true,
						"bufferMaxEntries": 0
					},
					"server": {
					}
				}, null, 2),
				"streaming": (response && response.clusters && response.clusters.streaming) ? JSON.stringify(response.clusters.streaming, null, 2) : JSON.stringify({})
			};
			if ($scope.deployAnalytics) {
				$scope.es_clusters = {
					"es_Ext": (response && response.es_clusters && response.es_clusters.es_Ext) ? response.es_clusters.es_Ext : false,
					"servers": (response && response.es_clusters && response.es_clusters.servers) ? response.es_clusters.servers : [{
						"host": "127.0.0.1",
						"port": 9200
					}],
					"credentials": (response && response.es_clusters && response.es_clusters.credentials) ? response.es_clusters.credentials : {
						"username": "",
						"password": ""
					},
					"URLParam": (response && response.es_clusters && response.es_clusters.URLParam) ? JSON.stringify(response.es_clusters.URLParam, null, 2) : JSON.stringify({
						"protocol": "http"
					}, null, 2),
					"extraParam": (response && response.es_clusters && response.es_clusters.extraParam) ? JSON.stringify(response.es_clusters.extraParam, null, 2) : JSON.stringify({
						"requestTimeout": 30000,
						"keepAlive": true,
						"maxSockets": 30,
						"number_of_shards": 5,
						"number_of_replicas": 1
					}, null, 2)
				};
				$scope.analytics = true;
			}
			else {
				$scope.analytics = false;
			}
			
			resizeContent();
		});
	};
	$scope.loadClusters();
}]);
