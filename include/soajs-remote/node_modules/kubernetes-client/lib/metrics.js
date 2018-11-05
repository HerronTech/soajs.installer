'use strict';

const ApiGroup = require('./api-group');

class Metrics extends ApiGroup {
  constructor(options) {
    const resources = [
      'nodes',
      'pods'
    ];
    options = Object.assign({}, options, {
      path: options.path || 'apis/metrics',
      version: options.version || 'v1alpha1',
      groupResources: resources,
      namespaceResources: ['pods']
    });
    super(options);
  }
}

module.exports = Metrics;
