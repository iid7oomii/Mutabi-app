import { useState } from 'react'
import RegistrationView from './components/RegistrationView'
import { emptyRegistrationForm } from './components/registrationForm'
import '../../design-system/registration.css'

const sampleForm = {
  parent_first_name: 'أحمد', parent_second_name: 'العتيبي', parent_email: 'ahmad@gmail.com',
  parent_phone: '0501234567', parent_relationship: 'father', child_first_name: 'ليان',
  child_second_name: 'العتيبي', child_dob: '2020-04-12',
  child_diagnosis: 'تحتاج إلى متابعة التوازن والمهارات الحركية الدقيقة.', doctor_id: '1',
}
const sampleDoctors = [{ id: '1', first_name: 'نورة', second_name: 'العتيبي', specialty: 'علاج وظيفي' },
  { id: '2', first_name: 'محمد', second_name: 'القحطاني', specialty: 'علاج النطق' }]

export default function RegistrationDesignPreview({ role, filled }) {
  const [form, setForm] = useState(filled ? sampleForm : emptyRegistrationForm)
  const [customRelationship, setCustomRelationship] = useState('')

  return <RegistrationView form={form} onFieldChange={(key, value) => setForm(current => ({ ...current, [key]: value }))}
    customRelationship={customRelationship} onCustomRelationshipChange={setCustomRelationship}
    doctors={filled ? sampleDoctors : []} isAdmin={role === 'admin'} preview
    onSubmit={event => event.preventDefault()}
    onReset={() => { setForm({ ...emptyRegistrationForm }); setCustomRelationship('') }} />
}
