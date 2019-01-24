const http = require('http')
const TIMEOUT = parseInt(process.env.TIMEOUT_HEARTBEAT.trim(), 10)

const ping = service => {
  const address = service.address.split(':')
  const hostname = address[0]
  const port = parseInt(address[1])
  const request = http.get({
    hostname,
    port,
    path: '/heartbeat',
    agent: false
  }, (res) => {
    console.log('Success ping at ' + service.address + ' (' + service.uuid + ')')
    // console.log(res)
  });
  request.setTimeout(TIMEOUT, () => {
    deadService(service)
  });
  request.on("error", () => {
    deadService(service)
  })
}

const pingEveryServices = (registery) => {
  const services = Object.values(registery.services)
  // console.log(services)
  services.reduce((acc, val) => acc.concat(Object.values(val)), []).forEach(ping)
}

const deadService = (service) => {
  console.log(service.name + ' at ' + service.address + ' iz ded!')
}

module.exports = {
  pingEveryServices
}
