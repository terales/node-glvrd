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
    return new Promise((resolve, reject) =>
      this._makeRequest('getStatus')
        .then(
          response => resolve(response),
          error => reject(error)
        ).catch(error => reject(error))
    );
  }

  proofread(text) {
    return new Promise((resolve, reject) => {
      this._makeRequest('postProofread', 'text=' + text)
        .then(rawFragments    => this._fillRawFragmentsWithHints(rawFragments.fragments))
        .then(filledFragments => resolve(filledFragments))
        .catch(error => reject(error));
    });
  }

  _makeRequest(endpointKey, body, isJson = true) {
    var endpoint = endpointsSpec.endpoints[endpointKey];
    var queryParams = {};

    endpoint.queryParams.forEach(queryParamName => {
      if (this.params.hasOwnProperty(queryParamName)) {
        queryParams[queryParamName] = this.params[queryParamName];
      }
    });

    return new Promise((resolve, reject) => {
      let options = {
        method: endpoint.method,
        uri: endpoint.name,
        qs: queryParams,
        json: isJson
      };

      if (body) {
        options.body = body;
      }

      this.req(options, function requestCallback(error, response, body) {
        if (error) {
          reject(error);
        }

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
    var uncachedHints = [];

    rawFragments.forEach(fragment => this.hintsCache.hasOwnProperty(fragment.hint_id) ? false : uncachedHints.push(fragment.hint_id));

    var fillFragmentsWithHintFromCache = (fragments) => {
      return fragments.map(fragment => {
        let { name, description } = this.hintsCache[fragment.hint_id];

        fragment.hint = {
          id: fragment.hint_id,
          name: name,
          description: description
        };

        delete fragment.hint_id;
        return fragment;
      });
    };

    return new Promise((resolve, reject) => {
      if (uncachedHints.length === 0) {
        return resolve(fillFragmentsWithHintFromCache(rawFragments));
      }

      let uncachedHintIds = {};
      uncachedHints.forEach(hintId => uncachedHintIds[hintId] = null);

      this._makeRequest('postHints', 'ids=' + Object.keys(uncachedHintIds).join(','))
        .then(response => {
          Object.assign(this.hintsCache, response.hints);
          resolve(fillFragmentsWithHintFromCache(rawFragments));
        });
    });
  }
}

export default nodeGlvrd;
