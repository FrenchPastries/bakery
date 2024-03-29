import { v4 as uuidv4 } from 'uuid'
import { Heartbeats, Services } from '../types'
import { Service } from '../service'

const computeAverageState = (state: number[]) => {
  if (state.length === 0) return 100
  return state.reduce((acc, val) => acc + val, 0) / state.length
}

export class Registry {
  #services: Services
  #heartbeatContent: string

  constructor() {
    this.#services = {}
    this.#heartbeatContent = '{}'
  }

  set(uuid: string, service: Service) {
    if (!this.#services[service.name]) this.#services[service.name] = {}
    this.#services[service.name][uuid] = service
  }

  register(service: Omit<Service, 'uuid'>) {
    const uuid = uuidv4()
    this.set(uuid, { ...service, uuid })
    this.#generateHeartbeatContent()
    return uuid
  }

  remove(uuid: string) {
    this.#services = Object.fromEntries(
      Object.entries(this.#services).flatMap(([servicesNames, services]) => {
        const filteredServices = Object.entries(services).filter(([_, service]) => service.uuid !== uuid)
        if (filteredServices.length > 0) return [[servicesNames, Object.fromEntries(filteredServices)]]
        return []
      })
    )
    this.#generateHeartbeatContent()
  }

  list() {
    const servicesById = Object.values(this.#services)
    return servicesById.flatMap(serviceById => Object.values(serviceById))
  }

  get heartbeat() {
    return this.#heartbeatContent
  }

  getDns(serviceName: string): { address: string; port: number } | undefined {
    const service = this.#services[serviceName]
    const sortedServers = Object.values(service)
      .map(serv => ({ ...serv, state: computeAverageState(serv.state) }))
      .sort((a, b) => (a.state < b.state ? -1 : 1))
    const server = sortedServers[0]
    if (!server) return
    const { address, port } = server
    return { address, port }
  }

  #generateHeartbeatContent() {
    const response: Heartbeats = Object.entries(this.#services).reduce((acc, [serviceName, servicesById]) => {
      const services_ = Object.values(servicesById)
      if (services_.length === 0) return acc
      const api = services_[0].interface
      const name = services_[0].name
      const instances = services_.reduce(
        (acc, { address, version }) => [...acc, { address, version }],
        [] as { address: string; version: string }[]
      )
      const inteface_ = { name, api, instances }
      return { ...acc, [serviceName]: inteface_ }
    }, {})
    this.#heartbeatContent = JSON.stringify(response)
  }
}
