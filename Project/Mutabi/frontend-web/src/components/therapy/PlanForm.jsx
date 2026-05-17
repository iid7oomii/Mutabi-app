import Select from '../ui/Select'
import Label from '../ui/Label'

const STATUS_OPTS = ['active', 'completed', 'cancelled']

function getAge(dob) {
  if (!dob) return ''
  const yrs = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000))
  return `${yrs} yrs`
}

const DoctorFieldIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

export default function PlanForm({ form, setForm, patients, doctors, isAdmin }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-800 mb-5">Plan Details</h2>
      <div className="space-y-4">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Patient</Label>
            <Select value={form.patient_id} onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))}>
              <option value="">Select patient…</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.second_name}{p.date_of_birth ? ` (${getAge(p.date_of_birth)})` : ''}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Plan Title</Label>
            <input type="text" placeholder="e.g. Sensory Integration Focus – Q3"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700
                focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Start Date</Label>
            <input type="date" value={form.start_date}
              onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700
                focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
          </div>
          <div>
            <Label>End Date</Label>
            <input type="date" value={form.end_date}
              onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700
                focus:outline-none focus:ring-2 focus:ring-blue-100 transition" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {STATUS_OPTS.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </Select>
          </div>
        </div>

        {isAdmin && (
          <div>
            <Label>Assign Primary Doctor</Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2"><DoctorFieldIcon /></span>
              <select value={form.doctor_id} onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))}
                className="w-full appearance-none border border-gray-200 rounded-xl pl-10 pr-8 py-2.5
                  text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition">
                <option value="">Select a specialist</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.first_name} {d.second_name}{d.specialty ? ` – ${d.specialty}` : ''}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}