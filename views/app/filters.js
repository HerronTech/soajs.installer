"use strict";

app.filter('toTrustedHtml', ['$sce', function ($sce) {
	return function (text) {
		return $sce.trustAsHtml(text);
	};
}]);

app.filter('trustAsResourceUrl', ['$sce', function ($sce) {
	return function (val) {
		return $sce.trustAsResourceUrl(val);
	};
}]);