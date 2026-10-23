import { NavLink, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { Camera, LogOut, Pencil, X } from 'lucide-react'
import { API_BASE_URL } from '../services/api/config'
import useAuthStore from '../store/authStore'
import { ThemeToggle } from '../design-system/templates'
import logoMark from '../assets/logo-mark.svg'
import { getWebNavItems } from './webNavigation'

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition'

export default function Sidebar() {
  const { user, clearUser, setUser, subscription } = useAuthStore()
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
      const res = await fetch(`${API_BASE_URL}/api/v1/upload/clinic-logo`, {
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
      const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
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
      const res = await fetch(`${API_BASE_URL}/api/v1/users/clinic/me`, {
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
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    clearUser()
    navigate('/')
  }

  const isSpecialist = subscription?.plan_type === 'specialist'
  const items = getWebNavItems({ role: user?.role, isSpecialist })

  return (
    <>
    <aside className="mt-sidebar" aria-label="القائمة الرئيسية">
      <div className="mt-sidebar__brand">
        <img src={logoMark} alt="" width="39" height="39" />
        <div><strong>متابع</strong><small>إدارة المتابعة العلاجية</small></div>
      </div>
      <div className="mt-sidebar__clinic">
        <div className="mt-sidebar__clinic-logo">
          {user?.clinic_logo_url ? <img src={user.clinic_logo_url} alt="شعار العيادة" /> : <span>{user?.clinic_name?.[0] || 'ع'}</span>}
          {isAdmin && <><button type="button" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} aria-label="تغيير شعار العيادة" title="تغيير شعار العيادة"><Camera size={13} /></button>
            <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} /></>}
        </div>
        <div><strong>{user?.clinic_name || 'العيادة'}</strong><small>مساحة العمل</small></div>
        {isAdmin && <button type="button" className="mt-sidebar__edit" onClick={openEditClinic} aria-label="تعديل معلومات العيادة"><Pencil size={15} /></button>}
      </div>
      <nav className="mt-sidebar__nav" aria-label="صفحات التطبيق">
        <span className="mt-sidebar__nav-label">القائمة</span>
        {items.map(item => {
          const Icon = item.icon
          return <NavLink key={item.path} to={item.path} end={item.end} className={({ isActive }) => `mt-sidebar__link ${isActive ? 'mt-sidebar__link--active' : ''}`}>
            <Icon size={19} strokeWidth={1.9} aria-hidden="true" /><span>{item.label}</span>
          </NavLink>
        })}
      </nav>
      <div className="mt-sidebar__footer">
        <div className="mt-sidebar__person"><span className="mt-sidebar__avatar">{user?.profile_picture_url ? <img src={user.profile_picture_url} alt="" /> : user?.first_name?.[0] || 'م'}</span>
          <div><strong>{[user?.first_name, user?.second_name].filter(Boolean).join(' ') || 'المستخدم'}</strong><small>{isAdmin ? 'مدير العيادة' : 'أخصائي'}</small></div>
          <button type="button" className="mt-sidebar__edit" onClick={openEditProfile} aria-label="تعديل الملف الشخصي"><Pencil size={15} /></button>
        </div>
        <div className="mt-sidebar__footer-actions"><ThemeToggle /><button type="button" onClick={handleLogout}><LogOut size={18} /> تسجيل الخروج</button></div>
      </div>
    </aside>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="mt-sidebar-dialog-backdrop fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="mt-sidebar-dialog bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" dir="rtl" role="dialog" aria-modal="true" aria-labelledby="sidebar-profile-title">
            <div className="flex items-center justify-between mb-5">
              <h2 id="sidebar-profile-title" className="text-base font-semibold text-gray-800">تعديل الملف الشخصي</h2>
              <button
                onClick={() => setShowEditProfile(false)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <X size={16} aria-hidden="true" />
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
                className="mt-sidebar-dialog__save flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-60">
                {savingProfile ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Clinic Modal */}
      {showEditClinic && (
        <div className="mt-sidebar-dialog-backdrop fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="mt-sidebar-dialog bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" dir="rtl" role="dialog" aria-modal="true" aria-labelledby="sidebar-clinic-title">
            <div className="flex items-center justify-between mb-5">
              <h2 id="sidebar-clinic-title" className="text-base font-semibold text-gray-800">تعديل معلومات العيادة</h2>
              <button
                onClick={() => setShowEditClinic(false)}
                className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <X size={16} aria-hidden="true" />
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
                className="mt-sidebar-dialog__save flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition disabled:opacity-60">
                {savingClinic ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
