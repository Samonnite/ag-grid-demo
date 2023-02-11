import { useState } from 'react'
import reactLogo from './assets/react.svg'
import AgTable from './components/table'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <AgTable/>
    </div>
  )
}

export default App
