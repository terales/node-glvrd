const nock = require('nock')

const NodeGlvrd = require('../index')
const endpointsSpec = require('../endpointsSpec')

/**
 * Mocking real server and disable internet for all unit tests
 * @param {object} t - AVA's execution object, see https://github.com/avajs/ava#t
 * @param {object} t.context - shared state which will be populated with glvrd, fakeServer and catchExpectedRequest
 */
module.exports = function initFakeServer (t) {
  t.context.glvrd = new NodeGlvrd('testApp')
  t.context.fakeServer = nock(endpointsSpec.baseUrl)
  nock.disableNetConnect()

  t.context.catchExpectedRequest = function (endpoint, replyCode = 200) {
    t.context
      .fakeServer[endpoint.method](endpoint.name)
      .query(endpoint.queryExample)
      .reply(replyCode, endpoint.responseExample)
  }
}
