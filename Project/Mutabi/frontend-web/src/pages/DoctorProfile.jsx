import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { ChevronRightIcon } from '../components/Icons'
import { API_BASE_URL } from '../config';
import useAuthStore from '../store/authStore'

const AVATAR_COLORS = [
  '#4ECDC4', '#45B7D1', '#96C93D', '#F7A072',
  '#9B59B6', '#3498DB', '#E67E22', '#1ABC9C',
]
const avatarColor = (name) => AVATAR_COLORS[(name || 'X').charCodeAt(0) % AVATAR_COLORS.length]

function getAge(dob) {
  if (!dob) return '—'
  const yrs = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000))
  return `${yrs} yrs`
}

function PlanBadge({ status }) {
  if (!status) return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">No Plan</span>
  )
  const styles = {
    active: 'bg-orange-50 text-orange-500',
    completed: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-50 text-red-500',
  }
  const labels = {
    active: 'Active Plan',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {labels[status] || status}
    </span>
  )
}

export default function DoctorProfile() {
  document.title = 'Doctor Profile | Mutabi'
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  const [doctor, setDoctor] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)
  const isAdmin = currentUser?.role === 'admin'

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${API_BASE_URL}/api/v1/upload/avatar/${id}`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      if (res.ok) {
        const data = await res.json()
        setDoctor(prev => ({ ...prev, profile_picture_url: data.url }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const [dRes, pRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/users/${id}`, { credentials: 'include' }),
          fetch(`${API_BASE_URL}/api/v1/users/${id}/patients`, { credentials: 'include' }),
        ])
        const [dData, pData] = await Promise.all([dRes.json(), pRes.json()])
        setDoctor(dData)
        setPatients(Array.isArray(pData) ? pData : [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#2c78bb', borderTopColor: 'transparent' }} />
      </div>
    </div>
  )

  const fullName = doctor ? `${doctor.first_name} ${doctor.second_name}` : '—'
  const initials = doctor ? `${doctor.first_name[0]}${doctor.second_name[0]}`.toUpperCase() : '?'
  const color = avatarColor(fullName)

    return (
        <div className="flex h-screen bg-gray-50" dir="ltr">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto p-8">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <button onClick={() => navigate('/doctors')} className="hover:text-gray-600 transition">
                Doctors Management
                </button>
                <ChevronRightIcon className="w-3 h-3" />
                <span className="text-gray-700 font-medium">Dr. {fullName}</span>
            </div>

            <div className="flex gap-6 items-start">

                {/* Doctor Card */}
                <div className="w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                    {/* Banner */}
                    <div className="h-24 bg-gradient-to-r from-blue-50 to-blue-100" />

                    {/* Content */}
                    <div className="px-6 pb-6">
                    <div className="relative w-20 h-20 -mt-10 mb-4">
                      {doctor?.profile_picture_url ? (
                        <img src={doctor.profile_picture_url} alt={fullName}
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm" />
                      ) : (
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-sm"
                          style={{ background: color }}>
                          {initials}
                        </div>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm disabled:opacity-60"
                          style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
                        >
                          {uploadingAvatar ? (
                            <div className="w-3 h-3 rounded-full border border-white border-t-transparent animate-spin" />
                          ) : (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                        </button>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                        className="hidden" onChange={handleAvatarUpload} />
                    </div>

                    <h2 className="text-lg font-bold text-gray-800">Dr. {fullName}</h2>
                    <p className="text-sm font-medium mt-0.5" style={{ color: '#2c78bb' }}>
                        {doctor?.specialty || '—'}
                    </p>

                    <div className="mt-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        doctor?.is_active ? 'bg-orange-50 text-orange-500' : 'bg-gray-100 text-gray-400'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${doctor?.is_active ? 'bg-orange-500' : 'bg-gray-400'}`} />
                        {doctor?.is_active ? 'Active Status' : 'Inactive'}
                        </span>
                    </div>

                    <div className="border-t border-gray-100 mt-5 pt-5 space-y-4">
                        <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                        <p className="text-sm text-gray-700">{doctor?.email || '—'}</p>
                        </div>
                        <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                        <p className="text-sm text-gray-700">{doctor?.phone || '—'}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/progress')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Review Progress
                    </button>
                    </div>
                </div>
                </div>

                {/* Patients Table */}
                <div className="flex-1">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-800">Assigned Patients</h2>
                    <span className="text-sm text-gray-400">{patients.length} patients</span>
                    </div>

                    <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Child Name</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Parent Name</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {patients.length === 0 && (
                        <tr>
                            <td colSpan={3} className="text-center py-10 text-sm text-gray-400">
                            No patients assigned
                            </td>
                        </tr>
                        )}
                        {patients.map(p => {
                        const childName = `${p.first_name} ${p.second_name}`
                        const childInitials = `${p.first_name[0]}${p.second_name[0]}`.toUpperCase()
                        const childColor = avatarColor(childName)
                        return (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/patients/${p.id}`)}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                    style={{ background: childColor }}>
                                    {childInitials}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{childName}</p>
                                    <p className="text-xs text-gray-400">Age: {getAge(p.date_of_birth)}</p>
                                </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{p.parent_name}</td>
                            <td className="px-6 py-4">
                                <PlanBadge status={p.plan_status} />
                            </td>
                            </tr>
                        )
                        })}
                    </tbody>
                    </table>

                    <div className="px-6 py-4 border-t border-gray-100">
                    <p className="text-sm text-gray-400">Showing {patients.length} patients</p>
                    </div>
                </div>
                </div>

            </div>
            </main>
        </div>
        </div>
  )
}