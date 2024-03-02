import { Interface, Service } from './service'

export type Services = { [serviceName: string]: { [uuid: string]: Service } }
export type Options = {
  heartbeatInterval: number
  heartbeatTimeout: number
  port?: number
}

export type Heartbeats = { [serviceName: string]: Heartbeat }
export type Heartbeat = {
  name: string
  api: Interface
  instances: {
    address: string
    version: string
  }[]
}
