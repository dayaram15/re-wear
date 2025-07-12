import { Route, Routes, useNavigate } from "react-router-dom"
import Navbar from "./components/Navbar2"
import { Button } from "./components/ui/button"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import MainLayout from "../Layout/MainLayout"
import LandingPage from "./pages/LandingPage"
import Dashboard from "./pages/Dashboard"
import ItemListingPage from "./pages/ItemListingPage.jsx"


const App = () => {
 
  return (
   <div>
    {/* <Navbar/> */}
    <Routes>
        {/* Layout wrapped pages */}
        <Route
          path="/"
          element={
            <MainLayout>
              <LandingPage />
            </MainLayout>
          }
        />
        <Route
          path="/browse"
          element={
            <MainLayout>
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/add-item"
          element={
            <MainLayout>
              <ItemListingPage />
            </MainLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />

        {/* Auth pages (no layout wrapper) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
   </div>
  )
}

export default App