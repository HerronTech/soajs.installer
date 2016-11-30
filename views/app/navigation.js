"use strict";
var navigation = [
	{
		'id': 'home',
		'label': 'Home',
		'title': 'SOAJS Installer',
		'description': '',
		'keywords': '',
		'url': '#/',
		'tplPath': 'sections/home/page.html',
		'scripts': ['sections/home/controller.js']
	},
	{
		'id': 'gi',
		'label': 'General',
		'title': 'SOAJS Installer | General',
		'description': '',
		'keywords': '',
		'url': '#/gi',
		'tplPath': 'sections/gi/page.html',
		'scripts': ['sections/gi/controller.js']
	},
	{
		'id': 'security',
		'label': 'Security',
		'title': 'SOAJS Installer | Security',
		'description': '',
		'keywords': '',
		'url': '#/security',
		'tplPath': 'sections/security/page.html',
		'scripts': ['sections/security/controller.js']
	},
	{
		'id': 'clusters',
		'label': 'Clusters',
		'title': 'SOAJS Installer | Clusters',
		'description': '',
		'keywords': '',
		'url': '#/clusters',
		'tplPath': 'sections/clusters/page.html',
		'scripts': ['sections/clusters/controller.js']
	},
	{
		'id': 'deployment',
		'label': 'Deployment',
		'title': 'SOAJS Installer | Deployment',
		'description': '',
		'keywords': '',
		'url': '#/deployment',
		'tplPath': 'sections/deployment/page.html',
		'scripts': ['sections/deployment/controller.js']
	},
	{
		'id': 'progress',
		'label': 'Progress',
		'title': 'SOAJS Installer | Progress',
		'description': '',
		'keywords': '',
		'url': '#/progress',
		'tplPath': 'sections/progress/page.html',
		'scripts': ['sections/progress/controller.js']
	}
];

var whitelistedDomain = ['localhost'];