import { Route, Routes } from "react-router-dom"
import { useEffect } from "react"
import Navbar from "./components/Navbar2"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import MainLayout from "../Layout/MainLayout"
import LandingPage from "./pages/LandingPage"
import Dashboard from "./pages/Dashboard"
import ItemListingPage from "./pages/ItemListingPage.jsx"
import ItemDetailPage from "./pages/ItemDetailsPage.jsx"
import AdminDashboard from "./pages/AdminDashboard.jsx"
import useAuthStore from "./store/authStore"


const App = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check authentication status when app loads
    checkAuth();
  }, [checkAuth]);

  return (
   <div>
    <Navbar/>
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
          path="/item/:id"
          element={
            <MainLayout>
              <ItemDetailPage />
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
        <Route
          path="/admin-dashboard"
          element={
            <MainLayout>
              <AdminDashboard />
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