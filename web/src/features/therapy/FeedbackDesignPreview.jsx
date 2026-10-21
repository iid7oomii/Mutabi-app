import { useState } from 'react'
import FeedbackView from './components/FeedbackView'
import '../../design-system/feedback.css'

const sampleDate = daysAgo => new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10)
const sampleFeedbacks = [
  { id: 'feedback-1', doctor_id: 'noura', parent_name: 'أحمد العتيبي', parent_relationship: 'father', child_id: 'child-1', child_name: 'ليان العتيبي', exercise_title: 'توازن الوقوف', completion_status: 'completed', pain_level: 1, feedback_date: sampleDate(1), parent_notes: 'نفذت ليان التمرين بمساعدة بسيطة، واستطاعت الحفاظ على توازنها مدة أطول من الأسبوع الماضي.', doctor_reply: 'تحسن جيد في التوازن. استمروا على المدة نفسها هذا الأسبوع.' },
  { id: 'feedback-2', doctor_id: 'noura', parent_name: 'سارة القحطاني', parent_relationship: 'mother', child_id: 'child-2', child_name: 'عبدالله القحطاني', exercise_title: 'نقل الكرات الملونة', completion_status: 'partially_completed', pain_level: 0, feedback_date: sampleDate(2), parent_notes: 'أكمل نصف التكرارات ثم احتاج إلى استراحة. هل نقلل العدد في الجلسة القادمة؟', doctor_reply: null },
  { id: 'feedback-3', doctor_id: 'mohammed', parent_name: 'محمد السالم', parent_relationship: 'father', child_id: 'child-3', child_name: 'ريم السالم', exercise_title: 'المسار الحركي', completion_status: 'skipped', pain_level: 0, feedback_date: sampleDate(4), parent_notes: 'لم يكن الوقت مناسبًا اليوم. سنحاول تنفيذ التمرين غدًا.', doctor_reply: null },
]

export default function FeedbackDesignPreview({ filled, role }) {
  const [feedbacks, setFeedbacks] = useState(filled ? sampleFeedbacks.filter(item => role === 'admin' || item.doctor_id === 'noura') : [])
  return <FeedbackView feedbacks={feedbacks} isAdmin={role === 'admin'}
    onReply={async (id, reply) => setFeedbacks(current => current.map(item => item.id === id ? { ...item, doctor_reply: reply } : item))}
    onOpenPatient={() => {}} />
}
