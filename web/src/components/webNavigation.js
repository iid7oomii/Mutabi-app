import { BookOpen, CalendarDays, ChartNoAxesCombined, ClipboardList, FileText, House, MessageSquareText, NotebookPen, UserPlus, UsersRound } from 'lucide-react'

const commonItems = [
  { label: 'الرئيسية', path: '/dashboard', icon: House, end: true },
  { label: 'الأطفال', path: '/patients', icon: UsersRound },
  { label: 'تسجيل طفل', path: '/registration', icon: UserPlus },
  { label: 'مكتبة التمارين', path: '/exercises', icon: BookOpen },
  { label: 'الخطط العلاجية', path: '/plans', icon: ClipboardList },
  { label: 'ملاحظات الأسرة', path: '/feedback', icon: MessageSquareText },
  { label: 'ملاحظات الأخصائي', path: '/notes', icon: NotebookPen },
  { label: 'المواعيد', path: '/appointments', icon: CalendarDays },
  { label: 'المقالات', path: '/articles', icon: FileText },
]

const adminItems = [
  { label: 'الأخصائيون', path: '/doctors', icon: UsersRound },
  { label: 'التقدم', path: '/progress', icon: ChartNoAxesCombined },
]

export function getWebNavItems({ role, isSpecialist = false }) {
  return role === 'admin'
    ? [...commonItems, ...adminItems.filter(item => !(isSpecialist && item.path === '/doctors'))]
    : commonItems
}
