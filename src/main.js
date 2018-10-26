const express = require('express')
var bodyParser = require('body-parser')
const app = express()

const port = 3000
const services = {}
let routes = {}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/service', function(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.send({
    services,
    routes
  })
})

app.post('/service', function(req, res) {
  const service = req.body
  services[service.name] = service
  const newRoutes = {}
  service.routes.forEach(route => {
    if (Object.keys(routes).includes(route)) {
      throw new Error('Route ' + route + 'already defined by an other service')
    } else {
      newRoutes[route] = service
    }
  })
  routes = Object.assign(routes, newRoutes)
  res.send('ok')
})

app.delete('/service', function(req, res) {
  console.log(req)
  res.send('ok')
})

app.listen(port, function() {
  console.log('Example app listening on port ' + port)
})
