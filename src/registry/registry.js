const uuidv4 = require('uuid/v4')

const setServiceByUUID = (services, service, uuid) => {
  if (!services[service.name]) {
    services[service.name] = {}
    services[service.name][uuid] = service
  } else {
    services[service.name][uuid] = service
  }
}

const register = (services, service) => {
  const uuid = uuidv4()
  service.uuid = uuid
  setServiceByUUID(services, service, uuid)
  return uuid
}

const deleteDeadService = (services, uuid) => {
  const findByID = element => element[uuid]
  delete Object.values(services).find(findByID)[uuid]
}

const getAllServices = services => {
  return (
    Object
      .values(services)
      .reduce((acc, val) => acc.concat(Object.values(val)), [])
  )
}

const create = () => {
  return {}
}

module.exports = {
  create,
  setServiceByUUID,
  register,
  deleteDeadService,
  getAllServices,
}
