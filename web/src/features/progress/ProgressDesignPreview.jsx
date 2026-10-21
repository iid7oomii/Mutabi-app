import { useState } from 'react'
import ProgressView from './components/ProgressView'
import '../../design-system/notes.css'
import '../../design-system/progress.css'
const sampleFeedback = [
  { id: 'feedback-1', child_id: 'child-1', child_name: 'ليان العتيبي', parent_name: 'أحمد العتيبي', exercise_title: 'توازن الوقوف', completion_status: 'completed', pain_level: 1, feedback_date: '2026-10-15', target_days: 'thursday', parent_notes: 'نفذت ليان التمرين بمساعدة بسيطة.' },
  { id: 'feedback-2', child_id: 'child-1', child_name: 'ليان العتيبي', parent_name: 'أحمد العتيبي', exercise_title: 'نقل الكرات الملونة', completion_status: 'partially_completed', pain_level: 0, feedback_date: '2026-10-13', target_days: 'tuesday', parent_notes: 'احتاجت إلى استراحة قصيرة.' },
  { id: 'feedback-3', child_id: 'child-2', child_name: 'عبدالله القحطاني', parent_name: 'سارة القحطاني', exercise_title: 'المسار الحركي', completion_status: 'skipped', pain_level: 0, feedback_date: '2026-10-11', target_days: 'sunday' },
]
export default function ProgressDesignPreview({ filled, mode = 'all' }) {
  const [goals, setGoals] = useState(filled && mode === 'child' ? [{ id: 'goal-1', title: 'زيادة مدة الوقوف المتوازن', success_criteria: 'الوقوف دون مساعدة لمدة 60 ثانية في 3 محاولات', status: 'active', target_date: '2026-12-31' }, { id: 'goal-2', title: 'نقل الكرات بين اليدين باستقلالية', success_criteria: 'نقل 5 كرات متتالية دون مساعدة', status: 'awaiting_review' }] : [])
  const feedback = filled ? mode === 'child' ? sampleFeedback.filter(item => item.child_id === 'child-1') : sampleFeedback : []
  return <ProgressView mode={mode} childName="ليان العتيبي" data={filled ? { adherence_rate: 58, total_patients: 12, pending_plans: 2 } : {}} feedback={feedback} goals={goals} onCreateGoal={mode === 'child' ? async form => setGoals(current => [{ ...form, id: `preview-${Date.now()}`, status: 'active' }, ...current]) : undefined} onBack={() => {}} onOpenFeedback={() => {}} onOpenChild={() => {}} />
}
