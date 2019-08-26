import React from 'react'

const fetchBakeryServices = async () => {
  const response = await fetch('/services', { method: 'post' })
  const data = await response.json()
  return data
}

const unifyServices = services => {
  return services.reduce((acc, service) => {
    const { name } = service
    const allServices = acc[name] || []
    return { ...acc, [name]: [...allServices, service] }
  }, {})
}

const useBakeryServices = setServices => {
  React.useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchBakeryServices()
      const newServices = unifyServices(data)
      setServices(newServices)
    }, 1000)
    return () => clearInterval(interval)
  }, [setServices])
}

const useWindowWidth = setWindowWidth => {
  React.useEffect(() => {
    window.addEventListener("resize", () => {
      const width = window.innerWidth
      const realWidth = computeRealWidth(width)
      setWindowWidth(realWidth)
    })
  }, [setWindowWidth])
}

const getStateColor = state => {
  if (state < 33) {
    return 'green'
  } else if (state < 66) {
    return 'orange'
  } else {
    return 'red'
  }
}

const RenderRestInterface = ({ rest }) => (
  <React.Fragment>
    <div className="instance-content-title">REST</div>
    <pre className="instance-content-value">
      {JSON.stringify(rest, null, 2)}
    </pre>
  </React.Fragment>
)

const RenderInterface = ({ interf }) => {
  const { type, value } = interf
  switch (type) {
    case 'REST':
      return <RenderRestInterface rest={value} />
    default:
      return null
  }
}

const RenderInstances = ({ instances }) => {
  return instances.map(({ name, version, address, state, uuid, ...instance }) => (
    <div className="instance column" key={uuid}>
      <div className="instance-name">{name}</div>
      <div className="instance-header">
        <div className="column">
          <span className="instance-address">{address}</span>
          <span style={{ paddingTop: '3px' }} />
          <span className="instance-version">{version}</span>
        </div>
        <span className={`instance-state ${getStateColor(state)}`}>
          {state} %
        </span>
      </div>
      <div className="instance-content column">
        <RenderInterface interf={instance.interface} />
      </div>
    </div>
  ))
}

const wrapIntoPx = value => `${value}px`

const computeRealWidth = width => {
  const instanceCardWidth = 324
  const appSectionPadding = 48
  const width_ = Math.floor(width / instanceCardWidth) * instanceCardWidth + appSectionPadding
  if (width_ > width) {
    const numberOfCards = Math.floor(width / instanceCardWidth) - 1
    const widthOfAllCards = numberOfCards * instanceCardWidth
    return wrapIntoPx(widthOfAllCards + appSectionPadding)
  } else {
    return wrapIntoPx(width_)
  }
}

const RenderServices = ({ services, width }) => {
  return Object.entries(services).map(([serviceName, instances]) => {
    return (
      <section className="app-section" style={{ width }} key={serviceName}>
        <RenderInstances instances={instances} />
      </section>
    )
  })
}

const App = () => {
  const [services, setServices] = React.useState([])
  const [windowWidth, setWindowWidth] = React.useState(computeRealWidth(window.innerWidth))
  useBakeryServices(setServices)
  useWindowWidth(setWindowWidth)
  return (
    <div className="app">
      <header className="app-header">Bakery</header>
      <main className="app-main">
        <RenderServices services={services} width={windowWidth}/>
      </main>
    </div>
  )
}

export default App
