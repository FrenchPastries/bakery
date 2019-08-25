const extractInterfaceInside = (acc, service) => {
  if (acc) {
    return acc
  } else {
    return service.interface
  }
}

const extractInterface = value => {
  return Object
    .values(value)
    .reduce(extractInterfaceInside, null)
}

const extractMetadata = value => {
  return Object.values(value).reduce((acc, { address, version }) => {
    return [...acc, { address, version }]
  }, [])
}

const generateInterfaces = (acc, [ key, value ]) => {
  const communicationInterface = extractInterface(value)
  const fullInterface = { ...communicationInterface, instances: extractMetadata(value) }
  return {
    ...acc,
    [key]: fullInterface,
  }
}

const extractAllInterfaces = services => {
  return Object
    .entries(services)
    .reduce(generateInterfaces, {})
}

const selectFullInterfaces = (acc, [ name, interf ]) => {
  if (interf) {
    return {
      ...acc,
      [name]: interf,
    }
  } else {
    return acc
  }
}

const cleanServicesInterface = interfaces => {
  return Object
    .entries(interfaces)
    .reduce(selectFullInterfaces, {})
}

const getInterfaces = services => {
  const first = extractAllInterfaces(services)
  const second = cleanServicesInterface(first)
  return second
}

module.exports = {
  getInterfaces,
}
