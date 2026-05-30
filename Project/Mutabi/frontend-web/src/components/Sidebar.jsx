import { NavLink, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import useAuthStore from '../store/authStore'

const navItems = [
  {
    label: 'Dashboard', path: '/dashboard',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
  },
  {
    label: 'Patients', path: '/patients',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  },
  {
    label: 'Registration', path: '/registration',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
  },
  {
    label: 'Exercise Library', path: '/exercises',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
  },
  {
    label: 'Therapy Plan Builder', path: '/plans',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
  },
  {
    label: 'Feedback', path: '/feedback',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
  },
  {
    label: 'Doctor Notes', path: '/notes',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  },
  {
    label: 'Appointments', path: '/appointments',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  },
  {
    label: 'Articles', path: '/articles',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
  },
]

const adminItems = [
  {
    label: 'Doctors', path: '/doctors',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
]

const CameraIcon = () => (
  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const PencilIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
)

const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"

export default function Sidebar() {
  const { user, clearUser, setUser } = useAuthStore()
  const navigate = useNavigate()
  const logoInputRef = useRef(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Edit Profile
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState(null)

  // Edit Clinic
  const [showEditClinic, setShowEditClinic] = useState(false)
  const [clinicForm, setClinicForm] = useState({})
  const [savingClinic, setSavingClinic] = useState(false)
  const [clinicError, setClinicError] = useState(null)

  const isAdmin = user?.role === 'admin'
  const isDoctor = user?.role === 'doctor'

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/v1/upload/clinic-logo', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      if (res.ok) {
        const data = await res.json()
        setUser({ ...user, clinic_logo_url: data.url })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingLogo(false)
      e.target.value = ''
    }
  }

  const openEditProfile = () => {
    setProfileForm({
      first_name: user?.first_name || '',
      second_name: user?.second_name || '',
      phone: user?.phone || '',
      specialty: user?.specialty || '',
    })
    setProfileError(null)
    setShowEditProfile(true)
  }

  const handleSaveProfile = async () => {
    setProfileError(null)
    if (!profileForm.first_name?.trim() || !profileForm.second_name?.trim()) {
      setProfileError('الاسم الأول والأخير مطلوبان')
      return
    }
    setSavingProfile(true)
    try {
      const body = {
        first_name: profileForm.first_name.trim(),
        second_name: profileForm.second_name.trim(),
        phone: profileForm.phone.trim(),
      }
      if (isDoctor && profileForm.specialty?.trim()) {
        body.specialty = profileForm.specialty.trim()
      }
      const res = await fetch('/api/v1/users/me', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setProfileError(data.error || 'فشل حفظ البيانات')
        return
      }
      setUser({
        ...user,
        first_name: data.first_name,
        second_name: data.second_name,
        phone: data.phone,
        specialty: data.specialty,
      })
      setShowEditProfile(false)
    } catch {
      setProfileError('تعذر الاتصال بالخادم')
    } finally {
      setSavingProfile(false)
    }
  }

  const openEditClinic = () => {
    setClinicForm({
      name: user?.clinic_name || '',
      contact_phone: user?.clinic_contact_phone || '',
      address: user?.clinic_address || '',
    })
    setClinicError(null)
    setShowEditClinic(true)
  }

  const handleSaveClinic = async () => {
    setClinicError(null)
    if (!clinicForm.name?.trim()) {
      setClinicError('اسم العيادة مطلوب')
      return
    }
    setSavingClinic(true)
    try {
      const res = await fetch('/api/v1/users/clinic/me', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clinicForm.name.trim(),
          contact_phone: clinicForm.contact_phone.trim(),
          address: clinicForm.address.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setClinicError(data.error || 'فشل حفظ بيانات العيادة')
        return
      }
      setUser({
        ...user,
        clinic_name: data.name,
        clinic_contact_phone: data.contact_phone,
        clinic_address: data.address,
      })
      setShowEditClinic(false)
    } catch {
      setClinicError('تعذر الاتصال بالخادم')
    } finally {
      setSavingClinic(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    clearUser()
    navigate('/')
  }

  const items = isAdmin
    ? [...navItems, ...adminItems]
    : navItems

  return (
    <>
      <div className="h-screen w-56 flex flex-col border-r border-gray-100 bg-white" dir="ltr">

        {/* Clinic Logo */}
        <div className="flex flex-col items-center py-6 border-b border-gray-100">
          <div className="relative mb-1">
            {user?.clinic_logo_url ? (
              <img src={user.clinic_logo_url} alt="Clinic Logo"
                className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
                <span className="text-white font-bold text-lg">م</span>
              </div>
            )}
            {isAdmin && (
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo}
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white border border-white disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
                title="Upload clinic logo"
              >
                {uploadingLogo
                  ? <div className="w-2 h-2 rounded-full border border-white border-t-transparent animate-spin" />
                  : <CameraIcon />
                }
              </button>
            )}
            <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={handleLogoUpload} />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-400 font-medium">
              {user?.clinic_name || 'CLINIC'}
            </span>
            {isAdmin && (
              <button
                onClick={openEditClinic}
                className="w-4 h-4 rounded flex items-center justify-center text-gray-300 hover:text-gray-500 transition"
                title="Edit clinic info"
              >
                <PencilIcon />
              </button>
            )}
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-sm font-bold"
            style={{ background: user?.profile_picture_url ? 'transparent' : 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
            {user?.profile_picture_url
              ? <img src={user.profile_picture_url} alt="" className="w-full h-full object-cover" />
              : (user?.first_name?.[0] || 'U')
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.first_name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
          <button
            onClick={openEditProfile}
            className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition flex-shrink-0"
            title="Edit profile"
          >
            <PencilIcon />
          </button>
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
              {item.icon}
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" dir="rtl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-800">تعديل الملف الشخصي</h2>
              <button
                onClick={() => setShowEditProfile(false)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {profileError && (
              <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                {profileError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">الاسم الأول</label>
                <input className={inputCls} value={profileForm.first_name}
                  onChange={e => setProfileForm(f => ({ ...f, first_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">الاسم الأخير</label>
                <input className={inputCls} value={profileForm.second_name}
                  onChange={e => setProfileForm(f => ({ ...f, second_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">رقم الجوال</label>
                <input className={inputCls} value={profileForm.phone} dir="ltr"
                  onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              {isDoctor && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">التخصص</label>
                  <input className={inputCls} value={profileForm.specialty}
                    onChange={e => setProfileForm(f => ({ ...f, specialty: e.target.value }))} />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowEditProfile(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                إلغاء
              </button>
              <button onClick={handleSaveProfile} disabled={savingProfile}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
                {savingProfile ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Clinic Modal */}
      {showEditClinic && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" dir="rtl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-800">تعديل معلومات العيادة</h2>
              <button
                onClick={() => setShowEditClinic(false)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {clinicError && (
              <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                {clinicError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">اسم العيادة</label>
                <input className={inputCls} value={clinicForm.name}
                  onChange={e => setClinicForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">رقم التواصل</label>
                <input className={inputCls} value={clinicForm.contact_phone} dir="ltr"
                  onChange={e => setClinicForm(f => ({ ...f, contact_phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">العنوان</label>
                <input className={inputCls} value={clinicForm.address}
                  onChange={e => setClinicForm(f => ({ ...f, address: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowEditClinic(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
                إلغاء
              </button>
              <button onClick={handleSaveClinic} disabled={savingClinic}
                className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
                {savingClinic ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
