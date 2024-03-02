import { Service } from './service'

export type Services = { [serviceName: string]: { [uuid: string]: Service } }
export type Options = {
  heartbeatInterval: number
  heartbeatTimeout: number
  port?: number
}
