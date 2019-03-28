const uuidv4 = require('uuid/v4')

class Registry {
  constructor() {
    this.services = {}
  }

  setServiceByUUID(service, uuid) {
    const { services } = this
    if (!services[service.name]) {
      services[service.name] = {}
      services[service.name][uuid] = service
    } else {
      services[service.name][uuid] = service
    }
  }

  register(service) {
    const uuid = uuidv4()
    service.uuid = uuid
    this.setServiceByUUID(service, uuid)
    return uuid
  }

  deleteDeadService(uuid) {
    const { services } = this
    const findByID = element => element[uuid]
    delete Object.values(services).find(findByID)[uuid]
  }

  getAllServices() {
    return (
      Object
        .values(this.services)
        .reduce((acc, val) => acc.concat(Object.values(val)), [])
    )
  }
}

module.exports = Registry
