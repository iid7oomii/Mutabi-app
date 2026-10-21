import { Activity, AudioLines, Dumbbell, Ear, Eye, Footprints, Hand, Mic, Music2, Palette, Puzzle, Smile, CircleDot } from 'lucide-react'

export const iconOptions = [
  { value: 'walk-outline', label: 'حركة', Icon: Footprints },
  { value: 'fitness-outline', label: 'لياقة', Icon: Dumbbell },
  { value: 'mic-outline', label: 'نطق', Icon: Mic },
  { value: 'happy-outline', label: 'تعبير', Icon: Smile },
  { value: 'musical-notes-outline', label: 'موسيقى', Icon: Music2 },
  { value: 'hand-left-outline', label: 'مهارات يدوية', Icon: Hand },
  { value: 'eye-outline', label: 'بصر', Icon: Eye },
  { value: 'ear-outline', label: 'سمع', Icon: Ear },
  { value: 'body-outline', label: 'حركة الجسم', Icon: Activity },
  { value: 'extension-puzzle-outline', label: 'ألعاب', Icon: Puzzle },
  { value: 'color-palette-outline', label: 'فن', Icon: Palette },
  { value: 'basketball-outline', label: 'رياضة', Icon: CircleDot },
]

export const goalOptions = [
  ['Initial Exercise', 'تمرين تمهيدي'], ['Core Exercise', 'تمرين أساسي'],
  ['Additional Exercise', 'تمرين إضافي'], ['Key Exercise', 'تمرين رئيسي'],
  ['Assessment Exercise', 'تمرين تقييم'], ['Reinforcement Exercise', 'تمرين تعزيز'],
]

export const difficultyOptions = [
  ['easy', 'سهل'], ['medium', 'متوسط'], ['hard', 'متقدم'],
]

export const emptyExerciseForm = {
  title: '', description: '', doctor_media_url: '', icon: '', difficulty: '', goal: '',
  useSteps: false, steps: [''],
}

export function exerciseIcon(value) {
  return iconOptions.find(item => item.value === value)?.Icon || AudioLines
}
export function goalLabel(value) {
  return goalOptions.find(item => item[0] === value)?.[1] || value
}
export function difficultyLabel(value) {
  return difficultyOptions.find(item => item[0] === value)?.[1] || value
}
export function mediaKind(url) {
  if (!url) return null
  if (/\.(mp4|mov|webm)(\?|$)/i.test(url)) return 'video'
  if (/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url)) return 'image'
  return null
}
