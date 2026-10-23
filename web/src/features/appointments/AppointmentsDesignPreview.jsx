import { useState } from 'react'
import AppointmentsView from './components/AppointmentsView'
import '../../design-system/notes.css'
import '../../design-system/appointments.css'
const childrenData = [
  { id: 'child-1', first_name: 'ليان', second_name: 'العتيبي', doctor_id: 'noura' },
  { id: 'child-2', first_name: 'عبدالله', second_name: 'القحطاني', doctor_id: 'noura' },
  { id: 'child-3', first_name: 'ريم', second_name: 'السالم', doctor_id: 'mohammed' },
]
const sampleAppointments = [
  { id: 'appt-1', child_id: 'child-1', appointment: '2026-11-03T10:30:00', notes: 'جلسة متابعة التوازن' },
  { id: 'appt-2', child_id: 'child-1', appointment: '2026-09-28T09:00:00', notes: 'تقييم التقدم' },
  { id: 'appt-3', child_id: 'child-2', appointment: '2026-11-05T11:00:00', notes: 'جلسة علاج وظيفي' },
]
export default function AppointmentsDesignPreview({ filled, role }) {
  const children = filled ? childrenData.filter(child => role === 'admin' || child.doctor_id === 'noura') : []
  const [selectedId, setSelectedId] = useState(children[0]?.id || '')
  const [appointments, setAppointments] = useState(filled ? sampleAppointments : [])
  return <AppointmentsView children={children} selectedId={selectedId} appointments={appointments.filter(item => item.child_id === selectedId)} onSelectChild={setSelectedId} onAddAppointment={async (appointment, notes) => setAppointments(current => [...current, { id: `appt-${Date.now()}`, child_id: selectedId, appointment, notes }])} onDeleteAppointment={async id => setAppointments(current => current.filter(item => item.id !== id))} />
}
