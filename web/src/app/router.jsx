import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import Login from '../features/auth/Login'
import Dashboard from '../features/dashboard/Dashboard'
import Patients from '../features/patients/Patients'
import PatientProfile from '../features/patients/PatientProfile'
import ProgressReview from '../features/patients/ProgressReview'
import TherapyPlanBuilder from '../features/therapy/TherapyPlanBuilder'
import Registration from '../features/auth/Registration'
import Feedback from '../features/therapy/Feedback'
import Doctors from '../features/doctors/Doctors'
import DoctorProgress from '../features/doctors/DoctorProgress'
import DoctorProfile from '../features/doctors/DoctorProfile'
import ExerciseLibrary from '../features/therapy/ExerciseLibrary'
import DoctorNotes from '../features/therapy/DoctorNotes'
import Appointments from '../features/appointments/Appointments'
import ArticlesPage from '../features/articles/ArticlesPage'
import SetPassword from '../features/auth/SetPassword'
import ForgotPassword from '../features/auth/ForgotPassword'
import ResetPassword from '../features/auth/ResetPassword'
import LandingPage from '../features/landing/LandingPage'
import MutabiAdmin from '../features/admin/MutabiAdmin'
import WebDesignPreview from '../features/design_preview/WebDesignPreview'
import './App.css'


function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-orange-500 text-lg">جاري التحميل...</div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (!user.active && location.pathname !== '/set_password')
    return <Navigate to="/set_password" replace />

  // SUBSCRIPTION CHECK DISABLED
  // if (
  //   user.role === 'admin' &&
  //   !SUBSCRIPTION_EXEMPT.includes(location.pathname) &&
  //   subscription !== null &&
  //   !['trial', 'active'].includes(subscription?.status)
  // ) {
  //   return <Navigate to="/subscription" replace />
  // }

  return children
}

function AdminRoute({ children }) {
  const { user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) return null
  if (!user) return <Navigate to="/login" />

  if (!user.active && location.pathname !== '/set_password')
    return <Navigate to="/set_password" replace />

  if (user.role !== 'admin') return <Navigate to="/dashboard" />

  // SUBSCRIPTION CHECK DISABLED
  // if (
  //   !SUBSCRIPTION_EXEMPT.includes(location.pathname) &&
  //   subscription !== null &&
  //   !['trial', 'active'].includes(subscription?.status)
  // ) {
  //   return <Navigate to="/subscription" replace />
  // }

  return children
}

function App() {
  const { fetchUser } = useAuthStore()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <Routes>
      {import.meta.env.DEV && <Route path="/design-preview" element={<WebDesignPreview />} />}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Navigate to="/?contact=1" replace />} />
	
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

                <Route path="/notes" element={
                <ProtectedRoute><DoctorNotes /></ProtectedRoute>
                } />

                <Route path="/appointments" element={
                <ProtectedRoute><Appointments /></ProtectedRoute>
                } />

                <Route path="/articles" element={
                <ProtectedRoute><ArticlesPage /></ProtectedRoute>
                } />

                <Route path='/set_password' element={<SetPassword />} />

                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="/mutabi-admin" element={<MutabiAdmin />} />
    </Routes>
    
  )
}

export default App
