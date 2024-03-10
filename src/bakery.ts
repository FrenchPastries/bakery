import * as millefeuille from '@frenchpastries/millefeuille'
import { badRequest, response } from '@frenchpastries/millefeuille/response'
import * as assemble from '@frenchpastries/assemble'
import * as arrange from '@frenchpastries/arrange'
import * as fs from 'fs/promises'
import * as path from 'path'

import { Registry } from './registry/registry'
import * as heartbeat from './registry/heartbeat'
import * as logger from './utils/logger'
import { Options } from './types'
import { schema } from './service'
import * as dns from './dns'

export type { Service, Interface } from './service'
export type { Services, Options, Heartbeats, Heartbeat } from './types'

const handleNotFound = async () => ({ statusCode: 404, body: 'Not Found' })

const getServices = (registry: Registry) => async () => {
  const allServices = JSON.parse(registry.heartbeat)
  return response(allServices)
}

const registerService = (registry: Registry) => {
  return async ({ body }: millefeuille.IncomingRequest) => {
    const result = schema.validate(body)
    if (result.error) {
      logger.error(`Body does not comply with interface`, result.error)
      return badRequest(result.error.message)
    } else {
      const uuid = registry.register(result.value)
      logger.log(`Registering ${result.value.name}@${result.value.address}, uuid: ${uuid}`)
      return response({ uuid })
    }
  }
}

const pingServices = (registry: Registry, heartbeatInterval: number, heartbeatTimeout: number) => {
  const pinger = heartbeat.pingEveryServices(heartbeatTimeout)
  const intervalId = setInterval(pinger, heartbeatInterval, registry)
  return () => clearInterval(intervalId)
}

const getStaticFiles = async (request: millefeuille.IncomingRequest) => {
  if (request.location?.pathname === '/') {
    const htmlFilePath = path.resolve(__dirname, '../backoffice/build/index.html')
    const body = await fs.readFile(htmlFilePath, 'utf-8')
    return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body }
  } else {
    const relativePath = '../backoffice/build' + request.location?.pathname
    const filePath = path.resolve(__dirname, relativePath)
    const body = await fs.readFile(filePath, 'utf8')
    return { statusCode: 200, body }
  }
}

const interceptGet: assemble.Middleware = handler => async request => {
  if (request.method !== 'GET') return handler(request)
  if (request.location?.pathname === '/services') return handler(request)
  if (process.env.BAKERY_DEVELOPMENT) {
    return { statusCode: 302, headers: { Location: 'http://localhost:8081' } }
  } else if (process.env.NODE_ENV === 'development') {
    return await getStaticFiles(request).catch(error => {
      logger.error(error.message)
      return handleNotFound()
    })
  } else {
    return handler(request)
  }
}

const allRoutes = (registry: Registry) => {
  return arrange.json.response(
    arrange.json.parse(
      assemble.routes([
        assemble.get('/services', getServices(registry)),
        assemble.post('/register', registerService(registry)),
        assemble.notFound(handleNotFound),
      ])
    )
  )
}

export const create = ({ heartbeatInterval, heartbeatTimeout, port, ...options }: Options) => {
  const registry = new Registry()
  const server = millefeuille.create(interceptGet(allRoutes(registry)), { port })
  console.log(`Bakery started on port ${port ?? 8080}`)
  const dnsServer = options.dns ? dns.create(registry, (port ?? 8080) + 1) : null
  if (options.dns) console.log(`DNS server listening on port ${port}`)
  const unsubscriber = pingServices(registry, heartbeatInterval, heartbeatTimeout)
  return () => {
    unsubscriber()
    server.close()
    dnsServer?.close()
  }
}
