import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Login from './pages/Login'
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
import DoctorNotes from './pages/DoctorNotes'
import Appointments from './pages/Appointments'
import ArticlesPage from './pages/ArticlesPage'
import SetPassword from './pages/SetPassword'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import LandingPage from './pages/LandingPage'
import PricingPage from './pages/PricingPage'
import SubscriptionCallback from './pages/SubscriptionCallback'
import Signup from './pages/Signup'
import MutabiAdmin from './pages/MutabiAdmin'
import './App.css'


const SUBSCRIPTION_EXEMPT = ['/subscription', '/subscription/callback']

function ProtectedRoute({ children }) {
  const { user, loading, subscription } = useAuthStore()
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
  const { user, loading, subscription } = useAuthStore()
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
  }, [])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/reset-password" element={<ResetPassword />} />
	
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

                <Route path="/subscription" element={
                  <ProtectedRoute><PricingPage /></ProtectedRoute>
                } />
                <Route path="/subscription/callback" element={
                  <ProtectedRoute><SubscriptionCallback /></ProtectedRoute>
                } />

                <Route path="/mutabi-admin" element={<MutabiAdmin />} />
    </Routes>
    
  )
}

export default App