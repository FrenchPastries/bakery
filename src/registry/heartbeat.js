const fetch = require('node-fetch')

const Registry = require('./registry')
const logger = require('../utils/logger')

const heartbeat = (url, timeout) => {
  return (body) => {
    return fetch(url, { method: 'POST', timeout, body })
  }
}

const getHeartbeatOrKillService = async (timeout, hostname, port, service, registry) => {
  try {
    const fetcher = heartbeat(`http://${hostname}:${port}/heartbeat`, timeout)
    const request = await fetcher(registry.heartbeatContent)
    const data = await request.json()
    getPingResponse(registry, service, data)
  } catch (error) {
    logger.error(error.message)
    deadService(registry, service)
  }
}

const ping = (timeout, registry) => async service => {
  const [ hostname, port ] = service.address.split(':')
  getHeartbeatOrKillService(timeout, hostname, parseInt(port), service, registry)
}

const getPingResponse = (registry, service, { uuid }) => {
  const { name, address } = service
  logger.log(`[ping]:ok ${name}@${address} (UUID: ${service.uuid})`)
  if (uuid !== service.uuid) {
    deadService(registry, service)
  }
}

const pingEveryServices = timeout => registry => {
  Registry
    .getAllServices(registry)
    .forEach(ping(timeout, registry))
}

const deadService = (registry, { name, address, uuid }) => {
  logger.log(`[dead] ${name}@${address}`)
  Registry.deleteDeadService(registry, uuid)
}

module.exports = {
  pingEveryServices,
}
