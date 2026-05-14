
import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import TherapyPlanBuilder from './pages/TherapyPlanBuilder'
import './App.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-orange-500 text-lg">جاري التحميل...</div>
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  return children
}

function App() {
  const { fetchUser } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/plans" element={
        <ProtectedRoute>
          <TherapyPlanBuilder />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App