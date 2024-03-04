import * as bakery from './bakery'

const readFromEnv = (value: string, defaultValue: number) => {
  const num = +(process.env?.[value] ?? defaultValue.toString())
  if (isNaN(num)) return defaultValue
  return num
}

const heartbeatTimeout = readFromEnv('HEARTBEAT_TIMEOUT', 1000)
const heartbeatInterval = readFromEnv('HEARTBEAT_INTERVAL', 1000)
const port = readFromEnv('PORT', 8080)

bakery.create({
  heartbeatTimeout,
  heartbeatInterval,
  port,
  dns: !!process.env.DNS || process.env.NODE_ENV === 'development',
})
