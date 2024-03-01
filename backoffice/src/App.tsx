import React, { useState } from 'react'

export type Interface = {
  type: 'REST'
  value: {
    method: string
    path: string
  }[]
}

export type Service = {
  address: string
  name: string
  state: number
  uuid: string
  version: string
  interface: Interface
}

const fetchBakeryServices = async () => {
  try {
    const response = await fetch('/services')
    const data = await response.json()
    return data
  } catch (error) {
    console.log('this is error', error)
    throw error
  }
}

const useBakeryServices = () => {
  const [services, setServices] = React.useState<Service[]>([])
  React.useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchBakeryServices()
      setServices(data)
    }, 1000)
    return () => clearInterval(interval)
  }, [setServices])
  return services
}

const getStateColor = (state: number) => {
  if (typeof state !== 'number') return 'orange'
  if (state < 33) {
    return 'green'
  } else if (state < 66) {
    return 'orange'
  } else {
    return 'red'
  }
}

const Path = ({ path }: { path: string }) => {
  const [displayCopied, setDisplayCopied] = useState(false)
  return (
    <div
      className="instance-content-value-path"
      onClick={() => {
        navigator.clipboard.writeText(path)
        setDisplayCopied(true)
        setTimeout(() => setDisplayCopied(false), 2000)
      }}
    >
      <span>{path}</span>
      {displayCopied && <span>Copied!</span>}
    </div>
  )
}

const RenderRestInterface = ({ rest }: { rest: Interface['value'] }) => {
  const groups = rest.reduce((acc: { [key: string]: string[] }, value) => {
    const paths = acc[value.method] ?? []
    return { ...acc, [value.method]: [...paths, value.path] }
  }, {})
  return (
    <React.Fragment>
      <div className="instance-content-value">
        {Object.entries(groups).map(([key, value]) => (
          <div className="instance-content-value-group" key={key}>
            <div className="instance-content-value-method">{key}</div>
            <div className="instance-content-value-paths">
              {value.map(path => (
                <Path path={path} key={path} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  )
}

const RenderInterface = ({ interf }: { interf: Interface }) => {
  const { type, value } = interf
  switch (type) {
    case 'REST':
      return <RenderRestInterface rest={value} />
    default:
      return null
  }
}

const RenderInstance = ({ instance }: { instance: Service }) => {
  const { name, version, address, state } = instance
  return (
    <div className="instance column">
      <div className="instance-name">{name}</div>
      <div className="instance-header">
        <div className="column padded">
          <span className="instance-address">{address}</span>
          <div className="row padded">
            <span className="instance-pill">v{version}</span>
            <span className="instance-pill">{instance.interface.type}</span>
          </div>
        </div>
        <span className={`instance-state ${getStateColor(state)}`}>{state ?? '?'} %</span>
      </div>
      <div className="instance-content column">
        <RenderInterface interf={instance.interface} />
      </div>
    </div>
  )
}

const RenderServices = ({ services }: { services: Service[] }) => {
  return services.map(instance => (
    <section className="app-section" key={instance.uuid}>
      <RenderInstance instance={instance} />
    </section>
  ))
}

const App = () => {
  const services = useBakeryServices()
  console.log(services)
  return (
    <div className="app">
      <header className="app-header">Bakery</header>
      <main className="app-main">
        <RenderServices services={services} />
      </main>
    </div>
  )
}

export default App
