const expect = require('chai').expect
const assert = require('assert')

const assemble = require('../../src/registery')
const register = assemble.register
const registry = assemble.registry

describe('Register service', () => {
  it('should register a service', () => {
    register({
      name: 'name',
      routes: ['/', '/login'],
      version: '0.0.1'
    })
    assert.equal(Object.keys(registry.services).includes('name'), true, 'service name does not exist')
    assert.equal(Object.keys(registry.routes).includes('/'), true, 'route / does not exist')
    assert.equal(Object.keys(registry.routes).includes('/login'), true, 'route /login does not exist')
  })
})
