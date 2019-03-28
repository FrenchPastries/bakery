require('./dotenv')
const MilleFeuille = require('@frenchpastries/millefeuille')
const { response } = require('@frenchpastries/millefeuille/response')
const { jsonResponse, parseBody } = require('./middlewares/json')
const { get, post, notFound, routes } = require('@frenchpastries/assemble')

const Registry = require('./registry/registry')
const heartbeat = require('./registry/heartbeat')

const INTERVAL_HEARTBEAT = parseInt(process.env.INTERVAL_HEARTBEAT, 10)

const handleNotFound = () => {
  return {
    statusCode: 404,
  }
}

const getServices = registry => () => {
  return response(registry.registry)
}

const registerService = registry => ({ body }) => {
  console.log(body)
  const uuid = registry.register(body)
  console.log(registry)
  return response({ uuid })
}

const pingServices = registry => {
  return setInterval(
    heartbeat.pingEveryServices,
    INTERVAL_HEARTBEAT,
    registry,
  )
}

const handler = registry => routes([
  get('/services', jsonResponse(getServices(registry))),
  post('/register', parseBody(jsonResponse(registerService(registry)))),
  notFound(handleNotFound),
])

class Bakery {
  constructor(port) {
    this.registry = new Registry()
    this.server = MilleFeuille.create(handler(this.registry), { port })
    this.interval = pingServices(this.registry)
  }

  close() {
    clearInterval(this.interval)
    this.server.close()
  }
}

module.exports = Bakery
