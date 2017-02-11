"use strict";
var progressApp = app.components;
progressApp.controller('progressCtrl', ['$scope', 'ngDataApi', '$timeout', function($scope, ngDataApi, $timeout) {
	$scope.alerts = [];
	$scope.deployType;
	$scope.closeAlert = function(i){
		$scope.alerts.splice(i, 1);
	};
	
	$scope.getInfo = function(){
		var options = {
			url: appConfig.url + "/progress/info",
			method: "get"
		};
		
		ngDataApi.get($scope, options, function (error, response) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			$scope.ui = response.ui;
			$scope.cmd = response.cmd;
			$scope.hosts = response.hosts;
		});
	};
	
	$scope.getProgress = function(){
		var options = {
			url: appConfig.url + "/progress",
			method: "get"
		};
		
		ngDataApi.get($scope, options, function(error, response) {
			if (error) {
				$scope.alerts.push({'type': 'danger', 'msg': error.message});
				return false;
			}
			
			$scope.info = response;
			$scope.deployType = $scope.info.deployType;
			if($scope.info.download){
				$scope.info.download.progress = ($scope.info.download.count / $scope.info.download.total) * 100;
				$scope.info.download.progress = $scope.info.download.progress.toFixed(2);
				$scope.download = ($scope.info.download && $scope.info.download.count === $scope.info.download.total);
				if($scope.info.download.progress < 50){
					$scope.info.download.barType = "warning";
				}
				else {
					$scope.info.download.barType = "info";
				}
			}
			
			if($scope.info.install){
				$scope.info.install.progress = ($scope.info.install.count / $scope.info.install.total) * 100;
				$scope.info.install.progress = $scope.info.install.progress.toFixed(2);
				$scope.install = ($scope.info.install && $scope.info.install.count === $scope.info.install.total);
				if($scope.info.install.progress < 50){
					$scope.info.install.barType = "warning";
				}
				else {
					$scope.info.install.barType = "info";
				}
			}
			
			if($scope.deployType === 'manual'){
				if((!$scope.install || $scope.install === false) || (!$scope.download || $scope.download === false)){
					$timeout(function(){
						$scope.getProgress();
					}, 3000);
				}
			}
			else{
				if((!$scope.download || $scope.download === false)){
					$timeout(function(){
						$scope.getProgress();
					}, 3000);
				}
			}
		});
	};
	
	$timeout(function(){
		$scope.getInfo();
		$scope.getProgress();
	}, 2000);
	
}]);