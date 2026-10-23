import { useEffect, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { VideoView, useVideoPlayer } from 'expo-video'
import { Activity, BatteryLow, CheckCircle2, CirclePlay, Clock3, CloudRain, Minus, Repeat2, Sparkles, ThumbsUp, X } from 'lucide-react-native'
import ScreenHeader from '../../components/ui/ScreenHeader'
import { ActionButton, AppText, SurfaceCard } from '../../components/ui/design-system/components'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { getLocalSessions, todayString } from '../../services/api/client'

const moods = [
  { Icon: CloudRain, label: 'سيء جدًا', pain: 9 }, { Icon: BatteryLow, label: 'سيء', pain: 7 },
  { Icon: Minus, label: 'عادي', pain: 5 }, { Icon: ThumbsUp, label: 'جيد', pain: 3 },
  { Icon: Sparkles, label: 'ممتاز', pain: 1 },
]
const statusLabels = { completed: 'مكتمل', partially_completed: 'جزئي', skipped: 'لم يُنفذ' }
const difficultyLabels = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' }
export default function ExerciseDetailScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { colors } = useTheme()
  const exercise = route.params?.exercise || {}
  const isCompleted = Boolean(route.params?.isCompleted)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isCompleted)
  const [videoVisible, setVideoVisible] = useState(false)
  const player = useVideoPlayer(exercise.exercise_media_url || null, video => { video.loop = false })
  useEffect(() => {
    if (!isCompleted) return
    getLocalSessions().then(list => setSession(list.find(item => item.plan_exercise_id === exercise.id && item.date === todayString()) || null)).catch(() => setSession(null)).finally(() => setLoading(false))
  }, [isCompleted, exercise.id])
  let steps = null
  if (exercise.exercise_steps_json) { try { const value = JSON.parse(exercise.exercise_steps_json); if (Array.isArray(value)) steps = value } catch {} }
  const mood = moods.find(item => item.pain === session?.pain_level)
  const openVideo = () => { setVideoVisible(true); player.play() }
  const closeVideo = () => { player.pause(); setVideoVisible(false) }
  return <View style={{ flex: 1, backgroundColor: colors.canvas }}>
    <ScreenHeader title="تفاصيل التمرين" onBack={() => navigation.goBack()} />
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28, gap: 16 }}>
      <View><AppText variant="page" weight="bold">{exercise.exercise_title || 'التمرين'}</AppText><AppText variant="support" color="muted">{exercise.exercise_goal || 'تفاصيل وخطوات التمرين'}</AppText></View>
      <Pressable accessibilityRole="button" accessibilityLabel={exercise.exercise_media_url ? 'تشغيل شرح التمرين' : 'لا يتوفر شرح مرئي'} onPress={exercise.exercise_media_url ? openVideo : undefined} style={{ minHeight: 166, borderRadius: 15, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', gap: 6 }}><CirclePlay size={42} color={colors.blue} strokeWidth={1.7} /><AppText variant="support" color="blue">{exercise.exercise_media_url ? 'شاهد شرح التمرين' : 'لا يتوفر شرح مرئي'}</AppText></Pressable>
      <View style={{ flexDirection: 'row-reverse', gap: 8 }}>{[
        { Icon: Clock3, label: 'المدة', value: exercise.duration_minutes ? `${exercise.duration_minutes} دقائق` : '—' },
        { Icon: Repeat2, label: 'التكرار', value: exercise.reps ? `${exercise.reps} مرات` : '—' },
        { Icon: Activity, label: 'الشدة', value: difficultyLabels[exercise.exercise_difficulty] || '—' },
      ].map(item => <SurfaceCard key={item.label} style={{ flex: 1, paddingVertical: 11, paddingHorizontal: 5, alignItems: 'center', gap: 3 }}><item.Icon size={17} color={colors.blue} /><AppText variant="tiny" color="muted">{item.label}</AppText><AppText variant="tiny" weight="semibold" style={{ textAlign: 'center' }}>{item.value}</AppText></SurfaceCard>)}</View>
      {steps?.length ? <View style={{ gap: 10 }}><AppText variant="section" weight="bold">خطوات التمرين</AppText>{steps.map((step, index) => <View key={index} style={{ flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 9 }}><View style={{ width: 23, height: 23, borderRadius: 8, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' }}><AppText variant="tiny" color="blue" weight="semibold">{index + 1}</AppText></View><AppText variant="support" style={{ flex: 1 }}>{step}</AppText></View>)}</View> : exercise.exercise_description ? <View style={{ gap: 8 }}><AppText variant="section" weight="bold">وصف التمرين</AppText><SurfaceCard style={{ padding: 15 }}><AppText variant="support">{exercise.exercise_description}</AppText></SurfaceCard></View> : null}
      {isCompleted && <View style={{ gap: 10 }}><AppText variant="section" weight="bold">نتيجة الجلسة</AppText>{loading ? <ActivityIndicator color={colors.blue} /> : <SurfaceCard style={{ padding: 15, gap: 10 }}><View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}><CheckCircle2 size={19} color={colors.blue} /><AppText variant="support" weight="semibold">{statusLabels[session?.completion_status] || 'جلسة مسجلة'}</AppText></View>{mood && <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}><mood.Icon size={18} color={colors.blue} /><AppText variant="support">شعور الطفل: {mood.label}</AppText></View>}{session?.notes && <AppText variant="support" color="muted">{session.notes}</AppText>}</SurfaceCard>}</View>}
      {!isCompleted && <ActionButton title="تسجيل الجلسة" onPress={() => navigation.navigate('LogSession', { planExerciseId: exercise.id, exerciseTitle: exercise.exercise_title })} />}
    </ScrollView>
    {exercise.exercise_media_url && <Modal visible={videoVisible} animationType="slide" onRequestClose={closeVideo}><View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center' }}><Pressable accessibilityRole="button" accessibilityLabel="إغلاق الفيديو" onPress={closeVideo} style={{ position: 'absolute', top: 50, right: 20, zIndex: 5 }}><X size={26} color="#fff" /></Pressable><VideoView player={player} style={{ width: '100%', height: 300 }} contentFit="contain" allowsFullscreen allowsPictureInPicture /></View></Modal>}
  </View>
}
