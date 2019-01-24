require('dotenv').config()
const MilleFeuille = require('@frenchpastries/millefeuille')
const registery = require('./registery/registery')
const heartbeat = require('./registery/heartbeat')
const {response} = require('@frenchpastries/millefeuille/response')
const {
  get,
  post,
  notFound,
  ...Assemble
} = require('@frenchpastries/assemble')
const HEARTBEAT_TIME = 1000

const handlerServices = request => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(registery.registery)
})

const handlerRegister = request => {
  console.log(request.body)
  const uuid = registery.register(JSON.parse(request.body))
  console.log(registery.registery)
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({uuid})
  }
}

setInterval(heartbeat.pingEveryServices, parseInt(process.env.INTERVAL_HEARBEAT), registery.registery)
const helloResponse = response('Do you want croissant?!')

const handler = Assemble.routes([
  get('/', request => helloResponse),
  get('/services', handlerServices),
  post('/register', handlerRegister),
  notFound(request => ({statusCode: 404}))
])

const server = MilleFeuille.create(handler)

console.log(registery.registery)
