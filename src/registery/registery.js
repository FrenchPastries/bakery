const uuidv4 = require('uuid/v4')

const registery = {
  services: {}
}

const register = (service) => {
  const uuid = uuidv4()
  service.uuid = uuid
  if (!registery.services[service.name]) {
    registery.services[service.name] = {}
    registery.services[service.name][uuid] = service
  } else {
    registery.services[service.name][uuid] = service
  }
  return uuid
}

const deleteDeadService = (uuid) => {
  delete Object.values(registery.services).find(el => el[uuid])[uuid]
}

module.exports = {
  register,
  registery,
  deleteDeadService
}
