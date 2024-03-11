import dns2, { DnsAnswer } from 'dns2'
import { Registry } from './registry/registry'
import { Logger } from './utils/logger'

interface DnsAnswerSRV extends DnsAnswer {
  priority: number
  weight: number
  port: number
  target: string
}

export const create = (registry: Registry, port: number, logger: Logger) => {
  const server = dns2.createServer({
    udp: true,
    handle: (request, send, rinfo) => {
      const response = dns2.Packet.createResponseFromRequest(request)
      const [question] = request.questions
      const { name } = question
      if (!name.endsWith('.bakery')) {
        logger.debug(`[dns]: request does not end with .bakery: ${name}`)
        return send(response)
      }
      const serviceName = name.replace(/\.bakery/g, '')
      const server = registry.getDns(serviceName)
      if (!server) {
        logger.debug(`[dns]: no service called ${serviceName} found`)
        return send(response)
      }
      const { address, port } = server
      response.answers.push({
        name,
        type: dns2.Packet.TYPE.SRV,
        class: dns2.Packet.CLASS.IN,
        ttl: 5,
        priority: 10,
        weight: 5,
        port,
        target: address,
      } as DnsAnswerSRV)
      send(response)
    },
  })
  server.listen({ udp: { port, address: 'localhost' } })
  return server
}
