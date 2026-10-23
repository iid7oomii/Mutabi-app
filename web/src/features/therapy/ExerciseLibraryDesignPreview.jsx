import { useState } from 'react'
import ExerciseLibraryView from './components/ExerciseLibraryView'
import '../../design-system/exercises.css'

const sampleExercises = [
  { id: '1', title: 'توازن الوقوف', description: 'يقف الطفل على قدم واحدة مع دعم خفيف، ثم يبدّل القدم بعد عدة ثوانٍ.', icon: 'walk-outline', difficulty: 'easy', goal: 'Initial Exercise' },
  { id: '2', title: 'نقل الكرات الملونة', description: 'ينقل الطفل الكرات من وعاء إلى آخر حسب اللون مع التركيز على حركة اليد الدقيقة.', icon: 'hand-left-outline', difficulty: 'medium', goal: 'Core Exercise', steps_json: '["اختيار كرة","نقلها"]' },
  { id: '3', title: 'تقليد الأصوات', description: 'يستمع الطفل إلى صوت قصير ثم يحاول تكراره بوضوح وبالوتيرة نفسها.', icon: 'mic-outline', difficulty: 'easy', goal: 'Reinforcement Exercise' },
  { id: '4', title: 'المسار الحركي', description: 'اتبع مسارًا بسيطًا يتضمن المشي والقفز وتغيير الاتجاه.', icon: 'body-outline', difficulty: 'hard', goal: 'Assessment Exercise' },
]

export default function ExerciseLibraryDesignPreview({ filled }) {
  const [exercises, setExercises] = useState(filled ? sampleExercises : [])
  return <ExerciseLibraryView exercises={exercises} onCreate={async payload => { setExercises(current => [...current, { ...payload, id: String(Date.now()) }]) }}
    onDelete={async id => { setExercises(current => current.filter(exercise => exercise.id !== id)) }}
    onUpload={async file => URL.createObjectURL(file)} />
}
