'use strict';

module.exports = [
	{
		"name": "SOAJS Recipe",
		"provider": "travis",
		"type": "recipe",
		"locked": true,
		"recipe": "sudo: required\ngroup: deprecated-2017Q2\nlanguage: node_js\nnode_js: 6.9.5\nservices:\n    - mongodb\nenv:\n    - CXX=g++-4.8\nbranches:\n    only:\n        - master\naddons:\n    apt:\n        sources:\n            - ubuntu-toolchain-r-test\n        packages:\n            - g++-4.8\n    hosts:\n        - localhost\n        - dev-controller\nbefore_install:\n    - 'sudo apt-get update && sudo apt-get install make g++'\nbefore_script:\n    - 'npm install -g grunt-cli'\nscript:\n    - 'grunt coverage'\nafter_success:\n    - 'node ./soajs.cd.js'\n",
		"sha": "b5078f480de6fc2a244e124184384cf32fe1680a"
	},
	{
		"name": "Node.js Recipe",
		"provider": "travis",
		"type": "recipe",
		"locked": true,
		"recipe": "sudo: required\ngroup: deprecated-2017Q2\nlanguage: node_js\nnode_js: 6.9.5\nservices:\n    - mongodb\nenv:\n    - CXX=g++-4.8\nbranches:\n    only:\n        - master\naddons:\n    apt:\n        sources:\n            - ubuntu-toolchain-r-test\n        packages:\n            - g++-4.8\n    hosts:\n        - localhost\n        - dev-controller\nbefore_install:\n    - 'sudo apt-get update && sudo apt-get install make g++'\nbefore_script:\n    - 'npm install -g grunt-cli'\nscript:\n    - 'grunt coverage'\nafter_success:\n    - 'node ./soajs.cd.js'\n",
		"sha": "b5078f480de6fc2a244e124184384cf32fe1680a"
	},
	{
		"name": "Elasticsearch Recipe",
		"provider": "travis",
		"type": "recipe",
		"locked": true,
		"recipe": "sudo: required\ngroup: deprecated-2017Q2\nlanguage: node_js\nnode_js: 6.9.5\nservices:\n    - elasticsearch\nenv:\n    - CXX=g++-4.8\nbranches:\n    only:\n        - master\naddons:\n    apt:\n        sources:\n            - ubuntu-toolchain-r-test\n        packages:\n            - g++-4.8\n    hosts:\n        - localhost\n        - dev-controller\nbefore_install:\n    - 'sudo apt-get update && sudo apt-get install make g++'\nbefore_script:\n    - 'npm install -g grunt-cli'\nscript:\n    - 'grunt coverage'\nafter_success:\n    - 'node ./soajs.cd.js'\n",
		"sha": "18bba2c913e8feb3a0e206c5e2910e7e616f26aa"
	},
	{
		"name": "Java Recipe",
		"provider": "travis",
		"type": "recipe",
		"locked": true,
		"recipe": "language: java\nsudo: false\ninstall: true\njdk: oraclejdk8\nafter_success:\n    - 'node ./soajs.cd.js'\n",
		"sha": "e38700cbc221e270a3c3dc015e40904db3a0221b"
	}
];