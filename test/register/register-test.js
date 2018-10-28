const expect = require('chai').expect

const register = require('../../src/registery').register

describe('Register service', () => {
  it('should register a service', () => {
    register({
      name: 'name',
      routes: ['/', '/login'],
      version: '0.0.1'
    })
  })
})
