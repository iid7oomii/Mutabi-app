import DoctorProfileView from './components/DoctorProfileView'
import '../../design-system/notes.css'
import '../../design-system/progress.css'
import '../../design-system/profiles.css'
const doctor = { id: 'doctor-1', first_name: 'نورة', second_name: 'العتيبي', specialty: 'علاج وظيفي', is_active: true, email: 'noura@example.com', phone: '0501234567' }
const patients = [{ id: 'child-1', first_name: 'ليان', second_name: 'العتيبي', date_of_birth: '2020-04-12', parent_name: 'أحمد العتيبي', plan_status: 'active' }, { id: 'child-2', first_name: 'عبدالله', second_name: 'القحطاني', date_of_birth: '2019-06-03', parent_name: 'سارة القحطاني', plan_status: null }]
export default function DoctorProfileDesignPreview({ filled }) { return <DoctorProfileView doctor={doctor} patients={filled ? patients : []} onBack={() => {}} onOpenPatient={() => {}} onOpenProgress={() => {}} /> }
