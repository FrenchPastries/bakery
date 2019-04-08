const fetch = require('node-fetch')

const Registry = require('./Registry')

const getHeartbeatOrKillService = async (timeout, hostname, port, service, registry) => {
  try {
    const request = await fetch(`http://${hostname}:${port}/heartbeat`, { timeout })
    const data = await request.json()
    getPingResponse(registry, service, data)
  } catch (error) {
    console.log(error)
    deadService(registry, service)
  }
}

const ping = (timeout, registry) => async service => {
  const address = service.address.split(':')
  const hostname = address[0]
  const port = parseInt(address[1])
  getHeartbeatOrKillService(timeout, hostname, port, service, registry)
}

const getPingResponse = (registry, service, { uuid }) => {
  console.log(`Success ping at ${service.address} (${service.uuid})`)
  if (uuid !== service.uuid) {
    deadService(registry, service)
  }
}

const pingEveryServices = timeout => registry => {
  console.log(registry)
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
