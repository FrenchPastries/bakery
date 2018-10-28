const registry = {
  services: {},
  routes: {}
}

const register = ({
  name,
  routes,
  version
}) => {
  if (Object.keys(registry.services).includes(name)) {
    throw new Error('Service with the same name already register ' + name)
  } else {
    const newRoutes = {}
    routes.forEach(route => {
      if (Object.keys(routes).includes(route)) {
        throw new Error('Route ' + route + ' already defined by an other service')
      } else {
        newRoutes[route] = {
          name,
          routes,
          version
        }
      }
    })
    registry.routes = Object.assign(registry.routes, newRoutes)
  }
}

exports.register = register
exports.registry = registry
