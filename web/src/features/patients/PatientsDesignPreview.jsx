import { useState } from 'react'
import PatientsView from './components/PatientsView'

const patients = [
  { id: 1, first_name: 'ليان', second_name: 'العتيبي', date_of_birth: '2020-03-14', parent: { name: 'أمل العتيبي' }, plan: { status: 'active', title: 'تحسين التوازن' }, doctor: { name: 'نورة العتيبي' } },
  { id: 2, first_name: 'عبدالله', second_name: 'القحطاني', date_of_birth: '2018-08-09', parent: { name: 'محمد القحطاني' }, plan: { status: 'active', title: 'تقوية عضلات اليد' }, doctor: { name: 'نورة العتيبي' } },
  { id: 3, first_name: 'سارة', second_name: 'الحربي', date_of_birth: '2021-06-20', parent: { name: 'أمل الحربي' }, plan: null, doctor: null },
]
const requests = [
  { id: 1, first_name: 'راشد', second_name: 'العتيبي', parent_name: 'فاطمة العتيبي', date_of_birth: '2020-10-14', status: 'pending' },
  { id: 2, first_name: 'مريم', second_name: 'السالم', parent_name: 'خالد السالم', date_of_birth: '2021-05-12', status: 'pending' },
]

export default function PatientsDesignPreview({ role, filled }) {
  const [activeTab, setActiveTab] = useState('patients')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const visiblePatients = role === 'admin' ? patients : patients.filter(patient => patient.doctor?.name === 'نورة العتيبي')
  return <PatientsView isAdmin={role === 'admin'} patients={filled ? visiblePatients : []} requests={filled ? requests : []}
    activeTab={activeTab} onTabChange={setActiveTab} search={search} onSearchChange={setSearch}
    statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
    onRegister={() => {}} onOpenPatient={() => {}} onDeletePatient={() => {}} onAssignDoctor={() => {}}
    onApproveRequest={() => {}} onRejectRequest={() => {}} />
}
