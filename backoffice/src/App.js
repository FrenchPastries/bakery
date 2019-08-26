import React from 'react'

const fetchBakeryServices = async () => {
  const response = await fetch('/services', { method: 'post' })
  const data = await response.json()
  return data
}

const useBakeryServices = () => {
  React.useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchBakeryServices()
      console.log(data)
    }, 1000)
    return () => clearInterval(interval)
  }, [])
}

const App = () => {
  useBakeryServices()
  return (
    <div className="App">
      <header className="App-header"></header>
    </div>
  )
}

export default App
