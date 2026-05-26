import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientProfile from './pages/PatientProfile'
import ProgressReview from './pages/ProgressReview'
import TherapyPlanBuilder from './pages/TherapyPlanBuilder'
import Registration from './pages/Registration'
import Feedback from './pages/Feedback'
import Doctors from './pages/Doctors'
import DoctorProgress from './pages/DoctorProgress'
import DoctorProfile from './pages/DoctorProfile'
import ExerciseLibrary from './pages/ExerciseLibrary'
import SetPassword from './pages/SetPassword'
import './App.css'


function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-orange-500 text-lg">جاري التحميل...</div>
    </div>
  )
	console.log("قيمة Active القادمة من الباك إند هي:", user.active, "ونوعها:", typeof user.active);
  if (!user.active && location.pathname !== '/set_password')
    return <Navigate to="/set_password" replace />

  if (!user) return <Navigate to="/" replace />
  return children

}

function AdminRoute({ children }) {
  const { user, loading } = useAuthStore()
  const location = useLocation()
  
  if (loading) return null
  if (!user) return <Navigate to="/" />

	if (!user.active && location.pathname !== '/set_password')
	return <Navigate to="/set_password" replace />

  if (user.role !== 'admin') return <Navigate to="/dashboard" />
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

    	<Route path="/patients" element={
        <ProtectedRoute>
          <Patients />
        </ProtectedRoute>
        } />

				<Route path="/patients/:id" element={
				<ProtectedRoute>
					<PatientProfile />
				</ProtectedRoute>
			} />

                <Route path="/patients/:id/progress" element={
                <ProtectedRoute>
                    <ProgressReview />
                </ProtectedRoute>
                } />

                <Route path="/registration" element={
                <ProtectedRoute>
                    <Registration />
                </ProtectedRoute>
                } />

                <Route path="/exercises" element={
                <ProtectedRoute>
                    <ExerciseLibrary />
                </ProtectedRoute>
                } />

                <Route path="/feedback" element={
                <ProtectedRoute>
                    <Feedback />
                </ProtectedRoute>
                } />

                <Route path="/doctors" element={
                <AdminRoute>
                    <Doctors />
                </AdminRoute>
                } />

                <Route path="/doctors/:id" element={
                <AdminRoute>
                    <DoctorProfile />
                </AdminRoute>
                } />

                <Route path="/progress" element={
                <AdminRoute>
                    <DoctorProgress />
                </AdminRoute>
                } />

                <Route path='/set_Password' element={
                    <ProtectedRoute>
                        <SetPassword />
                    </ProtectedRoute>
                } />
    </Routes>
    
  )
}

export default App