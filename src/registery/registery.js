const registery = {
  services: {}
}

const register = service => {
  if (!registery.services[service.name]) {
    registery.services[service.name] = [service]
  } else {
    registery.services[service.name].push(service)
  }
}

module.exports = {
  register,
  registery
}
