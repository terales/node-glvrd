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

    this.hintsCache = {};

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

  proofread(text) {
    return new Promise(resolve => {
      this._makeRequest('postProofread', text)
        .then(rawFragments    => this._fillRawFragmentsWithHints(rawFragments))
        .then(filledFragments => resolve(filledFragments));
    });
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

  _createSession() {
    return new Promise(resolve =>
      this._makeRequest('postSession').then(response => {
        this.params.session = response.session;
        this.params.lifespan = response.lifespan;
        resolve(response);
      })
    );
  }

  _fillRawFragmentsWithHints(rawFragments) {
    var uncachedHints = rawFragments.map(fragment => this.hintsCache.hasOwnProperty(fragment.hint_id));

    var fillFragmentsWithHintFromCache = (fragments) => {
      return fragments.map(fragment => {
        let { name, description } = this.hintsCache[fragment.hint_id];

        fragment.hint = {
          id: fragment.hint_id,
          name: name,
          description: description
        };

        delete fragment.hint_id;
      });
    };

    return new Promise(resolve => {
      if (uncachedHints.length === 0) {
        resolve(fillFragmentsWithHintFromCache(rawFragments));
      }

      let uncachedHintIds = {};
      uncachedHints.forEach(fragment => uncachedHintIds[fragment.hint_id] = null);

      this._makeRequest('postHints', Object.keys(uncachedHintIds).join(','))
        .then(response => {
          Object.assign(this.hintsCache, response);
          resolve(fillFragmentsWithHintFromCache(rawFragments));
        });
    });
  }
}

export default nodeGlvrd;
