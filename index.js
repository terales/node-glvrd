'use strict';

import request from 'request';
import endpointsSpec from './endpointsSpec.js';

class nodeGlvrd {

  constructor(appName) {
    if (typeof appName !== 'string' || !appName.length) {
      throw new Error(`appName is required and should be a string. Got ${typeof appName} ${appName}`);
    }

    this.params = {
      app: appName
    };

    this.req = request.defaults({
      baseUrl: endpointsSpec.baseUrl,
      timeout: 1000
    });
  }

  checkStatus() {
    return new Promise(resolve =>
      this._makeRequest('getStatus').then(response => resolve(response))
    );
  }

  _makeRequest(endpointKey, body) {
    var endpoint = endpointsSpec.endpoints[endpointKey];
    var queryParams = {};

    endpoint.queryParams.forEach(queryParamName => {
      if (this.params.hasOwnProperty(queryParamName)) {
        queryParams[queryParamName] = this.params[queryParamName];
      }
    });

    return new Promise((resolve, reject) => {
      this.req({
        method: endpoint.method,
        uri: endpoint.name + '/',
        qs: queryParams,
        body: body,
        json: true
      }, function requestCallback(error, response, body) {
        if (error)
          reject(error);

        resolve(body);
      });
    });
  }
}

export default nodeGlvrd;
