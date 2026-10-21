import { useState } from 'react'
import DoctorsView from './components/DoctorsView'
import '../../design-system/notes.css'
import '../../design-system/doctors.css'
const sampleDoctors = [
  { id: 'doctor-1', first_name: 'نورة', second_name: 'العتيبي', email: 'noura@example.com', specialty: 'علاج وظيفي', is_active: true },
  { id: 'doctor-2', first_name: 'محمد', second_name: 'القحطاني', email: 'mohammed@example.com', specialty: 'علاج طبيعي', is_active: true },
  { id: 'doctor-3', first_name: 'ريم', second_name: 'الحربي', email: 'reem@example.com', specialty: 'علاج النطق', is_active: false },
]
export default function DoctorsDesignPreview({ filled }) {
  const [doctors, setDoctors] = useState(filled ? sampleDoctors : [])
  return <DoctorsView doctors={doctors} onOpenDoctor={() => {}} onAddDoctor={async form => { setDoctors(current => [...current, { ...form, id: `doctor-${Date.now()}`, is_active: true }]); return 'Temp1234' }} onToggleStatus={async doctor => setDoctors(current => current.map(item => item.id === doctor.id ? { ...item, is_active: !item.is_active } : item))} onDeleteDoctor={async id => setDoctors(current => current.filter(doctor => doctor.id !== id))} />
}
