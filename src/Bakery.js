const MilleFeuille = require('@frenchpastries/millefeuille')
const { response } = require('@frenchpastries/millefeuille/response')
const { post, notFound, routes } = require('@frenchpastries/assemble')
const { jsonResponse, parseJSONBody } = require('@frenchpastries/arrange')

const Registry = require('./registry/registry')
const heartbeat = require('./registry/heartbeat')

const handleNotFound = () => {
  return {
    statusCode: 404,
  }
}

const getServices = registry => () => {
  return response(Registry.getAllServices(registry))
}

const registerService = registry => ({ body }) => {
  console.log(body)
  const uuid = Registry.register(registry, body)
  console.log(registry)
  return response({ uuid })
}

const pingServices = (heartbeatInterval, heartbeatTimeout, registry) => {
  return setInterval(
    heartbeat.pingEveryServices(heartbeatTimeout),
    heartbeatInterval,
    registry,
  )
}

const interceptGet = handler => request => {
  if (request.method === 'GET') {
    if (process.env.NODE_ENV !== 'production') {
      return {
        statusCode: 302,
        headers: {
          Location: 'http://localhost:3006',
        }
      }
    }
  } else {
    return handler(request)
  }
}

const allRoutes = registry => routes([
  post('/services', jsonResponse(getServices(registry))),
  post('/register', parseJSONBody(jsonResponse(registerService(registry)))),
  notFound(handleNotFound),
])

const create = ({ heartbeatInterval, heartbeatTimeout, port }) => {
  const registry = Registry.create()
  const server = MilleFeuille.create(interceptGet(allRoutes(registry)), { port })
  const interval = pingServices(heartbeatInterval, heartbeatTimeout, registry)
  return () => {
    clearInterval(interval)
    server.close()
  }
}

module.exports = {
  create,
}
