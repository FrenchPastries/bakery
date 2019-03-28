const uuidv4 = require('uuid/v4')

const registry = {
  services: {}
}

const register = (service) => {
  const uuid = uuidv4()
  service.uuid = uuid
  if (!registry.services[service.name]) {
    registry.services[service.name] = {}
    registry.services[service.name][uuid] = service
  } else {
    registry.services[service.name][uuid] = service
  }
  return uuid
}

const deleteDeadService = (uuid) => {
  delete Object.values(registry.services).find(el => el[uuid])[uuid]
}

module.exports = {
  register,
  registry,
  deleteDeadService
}
