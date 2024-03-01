import './stylesheets/styles.css'
import App from './App'
import { createRoot } from 'react-dom/client'

const root = document.getElementById('root')!
const reactRoot = createRoot(root)
reactRoot.render(<App />)
