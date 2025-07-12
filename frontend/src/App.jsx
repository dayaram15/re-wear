import { Route, Routes, useNavigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import { Button } from "./components/ui/button"
import Home from "./pages/Home"
import Login from "./pages/Login"


const App = () => {
 
  return (
   <div>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/login" element={<Login/>} />
    </Routes>
   </div>
  )
}

export default App