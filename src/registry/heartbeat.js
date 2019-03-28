const http = require('http')
const registry = require('./registry')
const TIMEOUT = parseInt(process.env.TIMEOUT_HEARTBEAT.trim(), 10)

const ping = (service) => {
  const address = service.address.split(':')
  const hostname = address[0]
  const port = parseInt(address[1])
  const request = http.get({
    hostname,
    port,
    path: '/heartbeat',
    agent: false
  }, getPingResponse(service))
  request.setTimeout(TIMEOUT, () => deadService(service))
  request.on('error', () => deadService(service))
}

const getPingResponse = (service) => (res) => {
  console.log(`Success ping at ${service.address} (${service.uuid})`)
  let data = ''
  res.on('data', (d) => data += d)
  res.on('end', () => {
    const dataRes = JSON.parse(data)
    if (dataRes.uuid != service.uuid) {
      deadService(service)
    }
  })
}

const getAllServices = ({ services }) => {
  return Object
    .values(services)
    .reduce((acc, val) => acc.concat(Object.values(val)), [])
}

const pingEveryServices = (registry) => {
  getAllServices(registry).forEach(ping)
}

const deadService = ({ name, address, uuid }) => {
  console.log(`${name} at ${address} iz ded!`)
  registry.deleteDeadService(uuid)
}

module.exports = {
  pingEveryServices
}
