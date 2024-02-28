export type Service = { uuid: string; name: string; address: string; version: string }
export type Services = { [serviceName: string]: { [uuid: string]: Service } }
export type Options = {
  heartbeatInterval: number
  heartbeatTimeout: number
  port: number
}
