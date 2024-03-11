import { Service } from '../service'
import { Logger } from '../utils/logger'
import { Registry } from './registry'
import * as ip from '../utils/ip'

const heartbeat = (url: string, timeout: number) => {
  return (body: string) => {
    const signal = AbortSignal.timeout(timeout)
    return fetch(url, { method: 'POST', body, signal })
  }
}

const getHeartbeatOrKillService = async (
  registry: Registry,
  timeout: number,
  hostname: string,
  port: number,
  service: Service,
  logger: Logger
) => {
  try {
    const host = ip.ipv6.enclose(hostname)
    const fetcher = heartbeat(`http://${host}:${port}/heartbeat`, timeout)
    const request = await fetcher(registry.heartbeat)
    const data = await request.json()
    getPingResponse(registry, logger, service, data)
  } catch (error: unknown) {
    if (error instanceof Error) {
      const name = `${service.name}@[${service.address}]`
      const metadata = { uuid: '${service.uuid}' }
      logger.error(`[ping]: error in heartbeat ping, service ${name}, ${metadata}:`, error.message)
    }
    removeDeadService(registry, logger, service)
  }
}

const ping = (registry: Registry, timeout: number, logger: Logger) => {
  return async (service: Service) => {
    getHeartbeatOrKillService(registry, timeout, service.address, service.port, service, logger)
  }
}

const getPingResponse = (registry: Registry, logger: Logger, service: Service, response: unknown) => {
  if (response && typeof response === 'object' && 'uuid' in response && typeof response.uuid === 'string') {
    const { name, address } = service
    logger.debug(`[ping]: service ${name}@[${address}] alive, { "uuid": "${service.uuid}" }`)
    if (response.uuid !== service.uuid) {
      removeDeadService(registry, logger, service)
    }
  }
}

const removeDeadService = (registry: Registry, logger: Logger, { name, address, uuid }: Service) => {
  logger.debug(`[ping]: service ${name}@[${address}] dead, { "uuid": "${uuid}" }`)
  registry.remove(uuid)
}

export const pingEveryServices = (timeout: number, logger: Logger) => (registry: Registry) => {
  registry.list().forEach(ping(registry, timeout, logger))
}
