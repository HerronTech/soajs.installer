'use strict';

const ApiGroup = require('./api-group');

class ApiRegistration extends ApiGroup {
  constructor(options) {
    const resources = [
	    'apiservices'
    ];
    options = Object.assign({}, options, {
      path: 'apis/apiregistration.k8s.io',
      version: options.version || 'v1beta1',
      groupResources: resources,
      namespaceResources: []
    });
    super(options);
  }
	
	/**
	 * Return the API object for the given Kubernetes kind
	 * @param {object|string} k - Kubernetes manifest object or a string
	 * @returns {BaseObject} Kubernetes API object.
	 */
	kind(k) {
		return this[(k.kind || k).toLowerCase()];
	}
}

module.exports = ApiRegistration;
