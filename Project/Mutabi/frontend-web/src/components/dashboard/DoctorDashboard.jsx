// src/components/dashboard/DoctorDashboard.jsx
import { useState, useEffect } from 'react'
import useAuthStore from '../../store/authStore'

export default function DoctorDashboard() {
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/v1/dashboard/doctor', {
          credentials: 'include',
        })
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-blue-600">جاري التحميل...</div>
    </div>
  )

  return (
    <div className="space-y-6" dir="ltr">


      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Good morning, Dr. {user?.first_name}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            You have {data?.patients_without_plan?.length || 0} patients without a therapy plan
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Exercise Library
          </button>
          <button
            className="px-4 py-2 text-sm rounded-lg text-white font-medium transition"
            style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}
          >
            + Create Plan
          </button>
        </div>
      </div>

      {data?.patients_without_plan?.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-orange-500 text-lg"></span>
          <p className="text-sm text-orange-700">
            <span className="font-semibold">{data.patients_without_plan.length} patients</span> don't have a therapy plan yet —
            {data.patients_without_plan.map(p => p.name).join(', ')}
          </p>
        </div>
      )}


      <div className="grid grid-cols-2 gap-4">


        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Assigned Patients</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0F4C81, #2c78bb)' }}>
              <span className="text-white text-xs"></span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{data?.assigned_patients || 0}</p>
          <p className="text-xs text-green-500 mt-1">↑ Active patients</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Skipped Sessions</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50">
              <span className="text-red-500 text-xs"></span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{data?.skipped_sessions || 0}</p>
        </div>

      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Recent Patient Feedback</h2>
          <button className="text-xs font-medium"
            style={{ color: '#0F4C81' }}>
            View All
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {data?.recent_feedback?.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No feedback yet</p>
          )}
          {data?.recent_feedback?.map((f) => (
            <div key={f.id} className="px-5 py-4 flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{ background: '#f0f4f8' }}>
                
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">{f.child}</p>
                  <p className="text-xs text-gray-400">{f.date}</p>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {f.exercise}
                </p>
                {f.notes && (
                  <p className="text-xs text-gray-500 mt-1 italic">"{f.notes}"</p>
                )}
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                  f.status === 'completed'
                    ? 'bg-green-50 text-green-600'
                    : f.status === 'skipped'
                    ? 'bg-red-50 text-red-500'
                    : 'bg-yellow-50 text-yellow-600'
                }`}>
                  {f.status === 'completed' ? '✓ Completed'
                    : f.status === 'skipped' ? '✗ Skipped'
                    : '~ Partial'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}