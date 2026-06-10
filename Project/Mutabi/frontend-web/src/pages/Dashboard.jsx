import Sidebar from '../components/Sidebar'
import AdminDashboard from '../components/dashboard/AdminDashboard'
import DoctorDashboard from '../components/dashboard/DoctorDashboard'
import useAuthStore from '../store/authStore'

export default function Dashboard() {
  document.title = 'Dashboard | Mutabi'
  const { user } = useAuthStore()

  return (
    <div className="flex h-screen bg-gray-50" dir="ltr">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        {user?.role === 'admin' && <AdminDashboard />}
        {user?.role === 'doctor' && <DoctorDashboard />}
      </main>
    </div>
  )
}