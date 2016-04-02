'use strict';

import request from 'request';
import endpointsSpec from './endpointsSpec.js';

class nodeGlvrd {

  constructor(appName) {
    if (typeof appName !== 'string' || !appName.length) {
      throw new Error(`appName is required and should be a string. Got ${typeof appName} ${appName}`);
    }

    this.appName = appName;

    this.request = request.defaults({
      baseUrl: endpointsSpec.baseUrl,
      timeout: 1000
    });
  }
}

export default nodeGlvrd;
