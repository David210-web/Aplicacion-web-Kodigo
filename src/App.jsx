import { useState } from 'react'
import DataTableComida from './components/DataTableComida'
//import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <DataTableComida/>
    </>
  )
}

export default App
