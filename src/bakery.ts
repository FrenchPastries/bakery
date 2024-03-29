import * as millefeuille from '@frenchpastries/millefeuille'
import { badRequest, response } from '@frenchpastries/millefeuille/response'
import * as assemble from '@frenchpastries/assemble'
import * as arrange from '@frenchpastries/arrange'
import * as fs from 'fs/promises'
import * as path from 'path'

import * as dns from './dns'
import { Registry } from './registry/registry'
import * as heartbeat from './registry/heartbeat'
import { Options } from './types'
import { schema } from './service'
import { Logger } from './utils/logger'
import * as logger from './utils/logger'

export * as ip from './utils/ip'

export type { Service, Interface } from './service'
export type { Services, Options, Heartbeats, Heartbeat } from './types'
export type { Logger } from './utils/logger'

const handleNotFound = async () => ({ statusCode: 404, body: 'Not Found' })

const getServices = (registry: Registry) => async () => {
  const allServices = JSON.parse(registry.heartbeat)
  return response(allServices)
}

const registerService = (registry: Registry, logger: Logger) => {
  return async ({ body }: millefeuille.IncomingRequest) => {
    const result = schema.validate(body)
    if (result.error) {
      logger.error(`[register]: \`request.body\` does not comply with interface:`, result.error)
      return badRequest(result.error.message)
    } else {
      const uuid = registry.register(result.value)
      const name = `${result.value.name}@[${result.value.address}]`
      logger.info(`[register]: service ${name} registered, { "uuid": "${uuid}" }`)
      return response({ uuid })
    }
  }
}

const pingServices = (registry: Registry, heartbeatInterval: number, heartbeatTimeout: number, logger: Logger) => {
  const pinger = heartbeat.pingEveryServices(heartbeatTimeout, logger)
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

const interceptGet = (logger: Logger): assemble.Middleware => {
  return handler => async request => {
    if (request.method !== 'GET') return handler(request)
    if (request.location?.pathname === '/services') return handler(request)
    if (process.env.BAKERY_DEVELOPMENT) {
      return { statusCode: 302, headers: { Location: 'http://localhost:8081' } }
    } else if (process.env.NODE_ENV === 'development') {
      return await getStaticFiles(request).catch(error => {
        logger.error(`[static]: unable to serve static files:`, error.message)
        return handleNotFound()
      })
    } else {
      return handler(request)
    }
  }
}

const allRoutes = (registry: Registry, logger: Logger) => {
  return arrange.json.response(
    arrange.json.parse(
      assemble.routes([
        assemble.get('/services', getServices(registry)),
        assemble.post('/register', registerService(registry, logger)),
        assemble.notFound(handleNotFound),
      ])
    )
  )
}

export const create = ({ heartbeatInterval, heartbeatTimeout, port, ...options }: Options) => {
  const instanceLogger: Logger = options.logger ?? logger
  const registry = new Registry()
  const server = millefeuille.create(interceptGet(instanceLogger)(allRoutes(registry, instanceLogger)), { port })
  const actualPort = port ?? 8080
  instanceLogger.info(`[services]: bakery started, listening on port ${actualPort}`)
  const dnsServer = options.dns ? dns.create(registry, actualPort + 1, instanceLogger) : null
  if (options.dns) instanceLogger.info(`[services]: DNS started, listening on port ${actualPort + 1}`)
  const unsubscriber = pingServices(registry, heartbeatInterval, heartbeatTimeout, instanceLogger)
  return () => {
    unsubscriber()
    server.close()
    dnsServer?.close()
  }
}
