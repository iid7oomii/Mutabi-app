import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Linking, Modal, Pressable, ScrollView, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { BookOpen, CalendarDays, CheckCircle2, Clock3, Heart, Play, Repeat2, Target, X } from 'lucide-react-native'
import Header from '../../components/ui/Header'
import { ActionButton, AppText, EmptyState, Message, SurfaceCard } from '../../components/ui/design-system/components'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { apiGet, getLocalSessions, todayString, localDayName } from '../../services/api/client'
import { useChild } from '../../store/ChildContext'

const formatDate = value => value ? new Date(value).toLocaleDateString('ar-SA-u-ca-gregory', { day: 'numeric', month: 'short' }) : 'لا يوجد'

export default function HomeScreen({ onTabPress, activeTab }) {
  const navigation = useNavigation()
  const { colors, radius } = useTheme()
  const { selectedChildId, ready } = useChild()
  const [data, setData] = useState(null)
  const [articles, setArticles] = useState([])
  const [goals, setGoals] = useState([])
  const [goalsError, setGoalsError] = useState(false)
  const [completedIds, setCompletedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [appointmentOpen, setAppointmentOpen] = useState(false)

  useEffect(() => {
    if (!ready || activeTab !== 'Home') return
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      setGoalsError(false)
      try {
        const suffix = selectedChildId ? `&child_id=${selectedChildId}` : ''
        const [dashboardResponse, articleResponse, sessions] = await Promise.all([
          apiGet(`/dashboard/parent?day=${localDayName()}${suffix}`),
          apiGet('/articles/'),
          getLocalSessions(),
        ])
        const dashboard = await dashboardResponse.json()
        if (!dashboardResponse.ok) throw new Error(dashboard.error || 'تعذر تحميل الرئيسية')
        const articleData = articleResponse.ok ? await articleResponse.json() : []
        if (!active) return
        setData(dashboard)
        setArticles(Array.isArray(articleData) ? articleData : [])
        setCompletedIds(sessions.filter(item => item.date === todayString() && item.completion_status === 'completed').map(item => item.plan_exercise_id))
        const childId = selectedChildId || dashboard.child?.id
        if (childId) {
          try {
            const response = await apiGet(`/goals/child/${childId}`)
            if (!response.ok) throw new Error()
            const list = await response.json()
            if (active) setGoals(Array.isArray(list) ? list : [])
          } catch { if (active) { setGoals([]); setGoalsError(true) } }
        } else setGoals([])
      } catch (cause) { if (active) setError(cause.message || 'تعذر الاتصال بالخادم') }
      finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, [ready, selectedChildId, activeTab, retry])

  const firstName = data?.child?.name?.split(' ')[0] || 'الطفل'
  const nextExercise = (data?.today_exercises || []).find(item => !completedIds.includes(item.id))
  const remaining = (data?.today_exercises || []).filter(item => !completedIds.includes(item.id)).length
  const appointment = data?.upcoming_appointment
  const activeGoal = goals.find(item => item.status === 'active')
  const goalDays = activeGoal?.remaining_days
  const goalTime = goalDays === 0 ? 'آخر يوم' : Number.isInteger(goalDays) ? [Math.floor(goalDays / 7) && `${Math.floor(goalDays / 7)} أسبوع`, goalDays % 7 && `${goalDays % 7} يوم`].filter(Boolean).join(' و ') : null

  return <View style={{ flex: 1, backgroundColor: colors.canvas }}>
    <Header clinicName={data?.clinic_name} onBellPress={() => navigation.navigate('Notifications')} />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 26, gap: 16 }} showsVerticalScrollIndicator={false}>
      <View><AppText variant="tiny" color="muted">المتابعة اليومية</AppText><AppText variant="page" weight="bold">الرئيسية</AppText><AppText variant="support" color="muted">خطة {firstName} ومواعيد المتابعة في مكان واحد.</AppText></View>
      {loading ? <ActivityIndicator color={colors.blue} style={{ marginTop: 60 }} /> : error ?
        <EmptyState icon={Target} title="تعذر تحميل الرئيسية" description={error} action={<ActionButton title="إعادة المحاولة" variant="secondary" onPress={() => setRetry(value => value + 1)} />} /> : <>
        <View style={{ paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row-reverse', alignItems: 'center', gap: 9 }}>
          <CalendarDays size={20} color={colors.blue} /><View style={{ flex: 1 }}><AppText variant="support" weight="semibold">خطة اليوم</AppText><AppText variant="tiny" color="muted">{remaining ? `${remaining} تمارين متبقية` : 'لا توجد تمارين متبقية اليوم'}</AppText></View>
        </View>
        {nextExercise ? <SurfaceCard style={{ padding: 16, borderRightWidth: 3, borderRightColor: colors.blue, gap: 10 }}>
          <View style={{ alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 99, backgroundColor: colors.blueSoft }}><AppText variant="tiny" weight="semibold" color="blue">التمرين التالي</AppText></View>
          <AppText variant="card" weight="bold">{nextExercise.exercise_title}</AppText>
          <View style={{ flexDirection: 'row-reverse', gap: 14 }}>{nextExercise.duration_minutes ? <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}><Clock3 size={15} color={colors.muted} /><AppText variant="tiny" color="muted">{nextExercise.duration_minutes} دقائق</AppText></View> : null}{nextExercise.reps ? <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}><Repeat2 size={15} color={colors.muted} /><AppText variant="tiny" color="muted">{nextExercise.reps} تكرارات</AppText></View> : null}</View>
          <ActionButton title="عرض التمارين" icon={Play} onPress={() => onTabPress('Therapy')} />
        </SurfaceCard> : <EmptyState icon={CheckCircle2} title={(data?.today_exercises || []).length ? 'اكتملت تمارين اليوم' : 'لا توجد تمارين لليوم'} description={(data?.today_exercises || []).length ? 'يمكن مراجعة الجلسات المسجلة في صفحة التقدم.' : 'ستظهر التمارين هنا عند إضافتها إلى خطة الطفل.'} />}
        {goalsError && <Message tone="error">تعذر تحميل الأهداف. حاول مجددًا لاحقًا.</Message>}
        {activeGoal && <SurfaceCard style={{ padding: 14, gap: 5 }}><View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 7 }}><Target size={17} color={colors.blue} /><AppText variant="support" weight="bold">هدف قيد المتابعة</AppText></View><AppText variant="support">{activeGoal.title}</AppText><AppText variant="tiny" color="muted">{activeGoal.success_criteria}</AppText>{goalTime && <AppText variant="tiny" color="blue">{goalTime} متبقية</AppText>}<Pressable onPress={() => onTabPress('Progress')} accessibilityRole="button"><AppText variant="tiny" weight="semibold" color="orangeText">عرض الأهداف والتقدم</AppText></Pressable></SurfaceCard>}
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}><AppText variant="section" weight="bold">ملاحظة الأخصائي</AppText><Pressable onPress={() => navigation.navigate('DoctorNotes', { childId: data?.child?.id })}><AppText variant="support" color="orangeText" weight="semibold">عرض الكل</AppText></Pressable></View>
        {data?.latest_note ? <View style={{ padding: 13, borderRadius: radius.card, backgroundColor: colors.blueSoft, flexDirection: 'row-reverse', gap: 8 }}><Heart size={18} color={colors.blue} /><View style={{ flex: 1 }}><AppText variant="tiny" weight="bold">{data.latest_note.doctor_name || 'الأخصائي'}</AppText><AppText variant="support">{data.latest_note.content}</AppText></View></View> : <AppText variant="support" color="muted">لا توجد ملاحظات بعد.</AppText>}
        <View style={{ flexDirection: 'row-reverse', gap: 10 }}><SurfaceCard style={{ flex: 1, padding: 12, gap: 4 }}><AppText variant="tiny" color="muted">الانتظام الأسبوعي</AppText><AppText variant="card" weight="bold">{data?.weekly_streak || 0} أيام</AppText></SurfaceCard><Pressable onPress={() => appointment && setAppointmentOpen(true)} style={{ flex: 1 }}><SurfaceCard style={{ flex: 1, padding: 12, gap: 4 }}><AppText variant="tiny" color="muted">الموعد القادم</AppText><AppText variant="card" weight="bold">{formatDate(appointment?.appointment)}</AppText></SurfaceCard></Pressable></View>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}><AppText variant="section" weight="bold">مقالات التوعية</AppText><Pressable onPress={() => navigation.navigate('Articles')}><AppText variant="support" color="orangeText" weight="semibold">استكشف المكتبة</AppText></Pressable></View>
        {articles.length ? articles.slice(0, 2).map(article => <Pressable key={article.id} onPress={() => article.article_url && Linking.openURL(article.article_url)}><SurfaceCard style={{ padding: 12, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}><View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: colors.orangeSoft, alignItems: 'center', justifyContent: 'center' }}>{article.image_url ? <Image source={{ uri: article.image_url }} style={{ width: 38, height: 38, borderRadius: 11 }} /> : <BookOpen size={18} color={colors.orangeText} />}</View><View style={{ flex: 1 }}><AppText variant="support" weight="semibold">{article.title}</AppText><AppText variant="tiny" color="muted" numberOfLines={1}>{article.summary || 'مقال توعوي للأسرة'}</AppText></View></SurfaceCard></Pressable>) : <AppText variant="support" color="muted">لا توجد مقالات بعد.</AppText>}
      </>}
    </ScrollView>
    <Modal visible={appointmentOpen} transparent animationType="fade" onRequestClose={() => setAppointmentOpen(false)}><Pressable onPress={() => setAppointmentOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(14,27,45,.5)', justifyContent: 'center', padding: 24 }}><Pressable onPress={() => {}} style={{ padding: 20, borderRadius: 16, backgroundColor: colors.surface, gap: 12 }}><View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}><AppText variant="section" weight="bold">تفاصيل الموعد</AppText><Pressable onPress={() => setAppointmentOpen(false)} accessibilityLabel="إغلاق"><X size={20} color={colors.muted} /></Pressable></View><AppText variant="support">{appointment?.appointment ? new Date(appointment.appointment).toLocaleString('ar-SA-u-ca-gregory', { dateStyle: 'full', timeStyle: 'short' }) : ''}</AppText>{appointment?.notes && <AppText variant="support" color="muted">{appointment.notes}</AppText>}<ActionButton title="حسنًا" onPress={() => setAppointmentOpen(false)} /></Pressable></Pressable></Modal>
  </View>
}
