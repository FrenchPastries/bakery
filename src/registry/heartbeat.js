const fetch = require('node-fetch')

const timeout = parseInt(process.env.TIMEOUT_HEARTBEAT, 10)

const getHeartbeatOrKillService = async (hostname, port, service, registry) => {
  try {
    const request = await fetch(`http://${hostname}:${port}/heartbeat`, { timeout })
    const data = await request.json()
    getPingResponse(service, data)
  } catch (error) {
    console.log(error)
    deadService(registry, service)
  }
}

const ping = registry => async service => {
  const address = service.address.split(':')
  const hostname = address[0]
  const port = parseInt(address[1])
  getHeartbeatOrKillService(hostname, port, service, registry)
}

const getPingResponse = (service, { uuid }) => {
  console.log(`Success ping at ${service.address} (${service.uuid})`)
  if (uuid !== service.uuid) {
    deadService(service)
  }
}

const pingEveryServices = registry => {
  console.log(registry)
  registry
    .getAllServices()
    .forEach(ping(registry))
}

const deadService = (registry, { name, address, uuid }) => {
  console.log(`${name} at ${address} iz ded!`)
  registry.deleteDeadService(uuid)
}

module.exports = {
  pingEveryServices,
}
