'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('r service', function() {
  it('registered the rs service', () => {
    assert.ok(app.service('rs'));
  });
});
