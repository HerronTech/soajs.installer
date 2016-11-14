"use strict";
var clustersApp = app.components;
clustersApp.controller('clustersCtrl', ['$scope', 'ngDataApi', function ($scope, ngDataApi) {
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
	};
	
	$scope.removeServer = function (index) {
		$scope.clusters.servers.splice(index, 1);
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
		
		var options = {
			url: appConfig.url + "/installer/clusters",
			method: "post",
			data: {
				"clusters": data
			}
		};
		
		ngDataApi.post($scope, options, function (error, response) {
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
			
			$scope.clusters = {
				"prefix": (response && response.prefix) ? response.prefix : "",
				"servers": (response && response.servers) ? response.servers : [{"host": "127.0.0.1", "port": 27017}],
				"credentials": (response && response.credentials) ? response.credentials : {
					"username": "",
					"password": ""
				},
				"URLParam": (response && response.URLParam) ? JSON.stringify(response.URLParam, null, 2) : JSON.stringify({
					"connectTimeoutMS": 0,
					"socketTimeoutMS": 0,
					"maxPoolSize": 5,
					"wtimeoutMS": 0,
					"slaveOk": true
				}, null, 2),
				"extraParam": (response && response.extraParam) ? JSON.stringify(response.extraParam, null, 2) : JSON.stringify({
					"db": {
						"native_parser": true,
						"bufferMaxEntries": 0
					},
					"server": {
					}
				}, null, 2),
				"streaming": (response && response.streaming) ? JSON.stringify(response.streaming, null, 2) : JSON.stringify({})
			};
			
			resizeContent();
		});
	};
	$scope.loadClusters();
}]);