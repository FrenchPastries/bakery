import { v4 as uuidv4 } from 'uuid'
import { Service, Services } from '../types'

export class Registry {
  #services: Services
  #heartbeatContent: string

  constructor() {
    this.#services = {}
    this.#heartbeatContent = 'null'
  }

  set(uuid: string, service: Service) {
    if (!this.#services[service.name]) this.#services[service.name] = {}
    this.#services[service.name][uuid] = service
  }

  register = (service: Service) => {
    const uuid = uuidv4()
    this.set(uuid, { ...service, uuid })
    this.#interfaces()
    return uuid
  }

  remove(uuid: string) {
    this.#services = Object.fromEntries(
      Object.entries(this.#services).flatMap(([servicesNames, services]) => {
        const servs = Object.entries(services).filter(([_, service]) => service.uuid !== uuid)
        if (servs.length > 0) return [[servicesNames, Object.fromEntries(servs)]]
        return []
      })
    )
    this.#interfaces()
  }

  list() {
    const servicesById = Object.values(this.#services)
    return servicesById.flatMap(serviceById => Object.values(serviceById))
  }

  get heartbeat() {
    return this.#heartbeatContent
  }

  #interfaces() {
    const response = Object.entries(this.#services).reduce((acc, [serviceName, servicesById]) => {
      const services_ = Object.values(servicesById)
      if (services_.length === 0) return acc
      const api = services_[0]
      const instances = services_.reduce(
        (acc, { address, version }) => [...acc, { address, version }],
        [] as { address: string; version: string }[]
      )
      const inteface_ = { ...api, instances }
      return { ...acc, [serviceName]: inteface_ }
    }, {})
    this.#heartbeatContent = JSON.stringify(response)
  }
}
