'use strict';

const ApiGroup = require('./api-group');

class Autoscaling extends ApiGroup {
    constructor(options) {
        const resources = [
            'horizontalpodautoscalers'
        ];
        options = Object.assign({}, options, {
            path: 'apis/autoscaling',
            version: options.version || 'v2alpha1',
	        groupResources: resources,
	        namespaceResources: resources
        });
        super(options);
    }
}

module.exports = Autoscaling;
