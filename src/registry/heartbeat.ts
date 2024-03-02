import { Service } from '../service'
import * as logger from '../utils/logger'
import { Registry } from './registry'

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
  service: Service
) => {
  try {
    const fetcher = heartbeat(`http://${hostname}:${port}/heartbeat`, timeout)
    const request = await fetcher(registry.heartbeat)
    const data = await request.text()
    getPingResponse(registry, service, data)
  } catch (error: unknown) {
    if (error instanceof Error) logger.error(error.message)
    removeDeadService(registry, service)
  }
}

const ping = (registry: Registry, timeout: number) => {
  return async (service: Service) => {
    const [hostname, port] = service.address.split(':')
    getHeartbeatOrKillService(registry, timeout, hostname, parseInt(port), service)
  }
}

const getPingResponse = (registry: Registry, service: Service, response: unknown) => {
  if (response && typeof response === 'object' && 'uuid' in response && typeof response.uuid === 'string') {
    const { name, address } = service
    logger.log(`[ping]: OK ${name}@${address} (UUID: ${service.uuid})`)
    if (response.uuid !== service.uuid) {
      removeDeadService(registry, service)
    }
  }
}

const removeDeadService = (registry: Registry, { name, address, uuid }: Service) => {
  logger.log(`[dead]: ${name}@${address}`)
  registry.remove(uuid)
}

export const pingEveryServices = (timeout: number) => (registry: Registry) => {
  registry.list().forEach(ping(registry, timeout))
}
