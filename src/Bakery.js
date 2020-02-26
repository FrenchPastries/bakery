const MilleFeuille = require('@frenchpastries/millefeuille')
const { response } = require('@frenchpastries/millefeuille/response')
const { post, notFound, routes } = require('@frenchpastries/assemble')
const { jsonResponse, parseJSONBody } = require('@frenchpastries/arrange')
const fs = require('fs').promises
const path = require('path')

const Registry = require('./registry/registry')
const heartbeat = require('./registry/heartbeat')
const logger = require('./utils/logger')

const handleNotFound = () => {
  return {
    statusCode: 404,
    body: 'Not Found',
  }
}

const getServices = registry => () => {
  return response(Registry.getAllServices(registry))
}

const registerService = registry => ({ body }) => {
  const uuid = Registry.register(registry, body)
  return response({ uuid })
}

const pingServices = (heartbeatInterval, heartbeatTimeout, registry) => {
  return setInterval(
    heartbeat.pingEveryServices(heartbeatTimeout),
    heartbeatInterval,
    registry,
  )
}

const getStaticFiles = async request => {
  if (request.url.pathname === '/') {
    const htmlFilePath = path.resolve(__dirname, '../backoffice/build/index.html')
    const htmlFile = await fs.readFile(htmlFilePath, 'utf8')
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: htmlFile,
    }
  } else {
    const relativePath = '../backoffice/build' + request.url.pathname
    const filePath = path.resolve(__dirname, relativePath)
    const file = await fs.readFile(filePath, 'utf8')
    return {
      statusCode: 200,
      body: file,
    }
  }
}

const interceptGet = handler => async request => {
  if (request.method === 'GET') {
    if (process.env.BAKERY_DEVELOPMENT) {
      return {
        statusCode: 302,
        headers: {
          Location: 'http://localhost:3006',
        },
      }
    } else if (process.env.NODE_ENV === 'development') {
      try {
        return await getStaticFiles(request)
      } catch (error) {
        logger.error(error.message)
        return handleNotFound()
      }
    } else {
      return handler(request)
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
