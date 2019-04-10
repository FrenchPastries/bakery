const uuidv4 = require('uuid/v4')

const Interfaces = require('./interfaces')

const setServiceByUUID = (registry, service, uuid) => {
  if (!registry.services[service.name]) {
    registry.services[service.name] = {}
    registry.services[service.name][uuid] = service
  } else {
    registry.services[service.name][uuid] = service
  }
}

const generateHeartbeatContent = registry => {
  const { services } = registry
  const interfaces = Interfaces.getInterfaces(services)
  registry.heartbeatContent = JSON.stringify(interfaces)
}

const register = (registry, service) => {
  const uuid = uuidv4()
  service.uuid = uuid
  setServiceByUUID(registry, service, uuid)
  generateHeartbeatContent(registry)
  return uuid
}

const deleteDeadService = (registry, uuid) => {
  const findByID = element => element[uuid]
  delete Object.values(registry.services).find(findByID)[uuid]
  generateHeartbeatContent(registry)
}

const getAllServices = ({ services }) => {
  return (
    Object
      .values(services)
      .reduce((acc, val) => acc.concat(Object.values(val)), [])
  )
}

const create = () => {
  return {
    services: {},
    heartbeatContent: JSON.stringify(null),
  }
}

module.exports = {
  create,
  register,
  deleteDeadService,
  getAllServices,
}
