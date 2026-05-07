import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const navItems = [
  { label: 'Dashboard',path: '/dashboard' },
  { label: 'Patients', path: '/patients' },
  { label: 'Registration', path: '/registration' },
  { label: 'Exercise Library', path: '/exercises' },
  { label: 'Therapy Plan Builder', path: '/plans' },
  { label: 'Feedback', path: '/feedback' },
]

const adminItems = [
  { label: 'Doctors', icon: '🩺', path: '/doctors' },
]

export default function Sidebar() {
  const { user, clearUser } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    clearUser()
    navigate('/')
  }

  const items = user?.role === 'admin'
    ? [...navItems, ...adminItems]
    : navItems

  return (
    <div className="h-screen w-56 flex flex-col border-r border-gray-100 bg-white" dir="ltr">

      {/* Logo */}
      <div className="flex flex-col items-center py-6 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
          style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
          <span className="text-white font-bold text-lg">م</span>
        </div>
        <span className="text-xs text-gray-400 font-medium">SPD CLINIC</span>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
          {user?.first_name?.[0] || 'U'}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{user?.first_name}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'text-white'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
            style={({ isActive }) =>
              isActive ? { background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' } : {}
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all w-full"
        >
          <span>→</span>
          Logout
        </button>
      </div>

    </div>
  )
}