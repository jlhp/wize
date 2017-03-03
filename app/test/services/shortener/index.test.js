'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('shortener service', function() {
  it('registered the shorteners service', () => {
    assert.ok(app.service('shorteners'));
  });
});
