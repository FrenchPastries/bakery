// File used for dev purposes.

import * as bakery from './bakery'

bakery.create({
  heartbeatTimeout: 10000000,
  heartbeatInterval: 10000000,
  port: 8080,
})

console.log('Bakery started on port 8080')
