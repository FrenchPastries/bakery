import { Interface, Service } from './service'
import { Logger } from './utils/logger'

export type Services = { [serviceName: string]: { [uuid: string]: Service } }
export type Options = {
  heartbeatInterval: number
  heartbeatTimeout: number
  port?: number
  dns?: boolean
  logger?: Logger
}

export type Heartbeats = { [serviceName: string]: Heartbeat }
export type Heartbeat = {
  name: string
  api: Interface
}
