import * as bakery from './bakery'

const readFromEnv = (value: string) => {
  const num = +(process.env?.[value] ?? '1000')
  if (isNaN(num)) return 1000
  return num
}

const heartbeatTimeout = readFromEnv('HEARTBEAT_TIMEOUT')
const heartbeatInterval = readFromEnv('HEARTBEAT_INTERVAL')
const port = readFromEnv('PORT')

bakery.create({
  heartbeatTimeout,
  heartbeatInterval,
  port: 8080,
})

console.log('Bakery started on port 8080')
