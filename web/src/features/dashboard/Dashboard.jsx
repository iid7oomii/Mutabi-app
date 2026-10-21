import { useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import AdminDashboard from './components/AdminDashboard'
import DoctorDashboard from './components/DoctorDashboard'
import useAuthStore from '../../store/authStore'
import { ThemeProvider } from '../../design-system/ThemeProvider'
import '../../design-system/dashboard.css'

export default function Dashboard() {
  const { user } = useAuthStore()

  useEffect(() => { document.title = 'لوحة التحكم | متابع' }, [])

  return <ThemeProvider>
    <div className="mt-dashboard-shell">
      <Sidebar />
      <main className="mt-dashboard-main" id="main-content">
        {user?.role === 'admin' && <AdminDashboard />}
        {user?.role === 'doctor' && <DoctorDashboard />}
      </main>
    </div>
  </ThemeProvider>
}
