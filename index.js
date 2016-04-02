'use strict';

class nodeGlvrd {

  constructor(appName) {
    if (typeof appName !== 'string' || !appName.length) {
      throw new TypeError(`appName is required and should be a string. Got ${typeof appName} ${appName}`);
    }

    this.appName = appName;
  }
}

export default nodeGlvrd;
