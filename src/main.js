require('./dotenv')
const MilleFeuille = require('@frenchpastries/millefeuille')
const registry = require('./registry/registry')
const heartbeat = require('./registry/heartbeat')
const { response } = require('@frenchpastries/millefeuille/response')
const {
  get,
  post,
  notFound,
  ...Assemble
} = require('@frenchpastries/assemble')

const handlerServices = (request) => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(registry.registry)
})

const handlerRegister = (request) => {
  console.log(request.body)
  const uuid = registry.register(JSON.parse(request.body))
  console.log(registry.registry)
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ uuid })
  }
}

const pingServices = () => {
  setInterval(
    heartbeat.pingEveryServices,
    parseInt(process.env.INTERVAL_HEARTBEAT),
    registry.registry
  )
}

const helloResponse = response('Do you want croissant?!')

const handler = Assemble.routes([
  get('/', request => helloResponse),
  get('/services', handlerServices),
  post('/register', handlerRegister),
  notFound(request => ({ statusCode: 404 }))
])

const server = MilleFeuille.create(handler)

pingServices()

console.log(registry.registry)
