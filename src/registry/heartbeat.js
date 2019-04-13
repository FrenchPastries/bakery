const fetch = require('node-fetch')

const Registry = require('./Registry')

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
    console.log(error)
    deadService(registry, service)
  }
}

const ping = (timeout, registry) => async service => {
  const [ hostname, port ] = service.address.split(':')
  getHeartbeatOrKillService(timeout, hostname, parseInt(port), service, registry)
}

const getPingResponse = (registry, service, { uuid }) => {
  console.log(`Success ping at ${service.address} (${service.uuid})`)
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
  console.log(`${name} at ${address} iz ded!`)
  Registry.deleteDeadService(registry, uuid)
}

module.exports = {
  pingEveryServices,
}
