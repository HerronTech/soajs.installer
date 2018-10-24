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

app.filter('myObject', ['$sce', function ($sce) {
	function stringifyCamelNotation(value) {
		// if (translation[value] && translation[value][LANG]) {
		// 	return translation[value][LANG];
		// }
		return value.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
			return str.toUpperCase();
		});
	}
	
	function iterateAndPrintObj(obj) {
		var string = '';
		for (var i in obj) {
			if (obj.hasOwnProperty(i)) {
				if (Array.isArray(obj[i])) {
					string += "<span class='objectField'>" + stringifyCamelNotation(i) + ":</span> <br/>";
					var t = [];
					for (var e = 0; e < obj[i].length; e++) {
						if (typeof(obj[i][e]) === 'object') {
							if (e === 0) {
								t.push('<span class="noWrap"> &nbsp; ' + iterateAndPrintObj(obj[i][e]).replace(/<br \/>/g, " ") + '</span>');
							}
							else {
								t.push('<br/><span class="noWrap"> &nbsp; ' + iterateAndPrintObj(obj[i][e]).replace(/<br \/>/g, " ") + '</span>');
							}
						}
						else if(obj[i][e] && obj[i][e]!== ''){
							t.push(obj[i][e]);
						}
					}
					if(t.length > 0){
						string += t + "<br />";
					}
				}
				else if (typeof(obj[i]) === 'object') {
					string += iterateAndPrintObj(obj[i]);
					//string += (obj[i]);
				}
				else {
					if (i !== '$$hashKey') {
						string += "<span class='objectField'>" + stringifyCamelNotation(i) + ":</span>&nbsp;" + obj[i] + "<br />";
					}
				}
			}
		}
		return string;
	}
	
	return function (obj) {
		if (typeof(obj) === 'object') {
			var txt = iterateAndPrintObj(obj);
			return $sce.trustAsHtml(txt);
		}
		else {
			return obj;
		}
	};
	
}]);