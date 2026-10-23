import { useState } from 'react'
import { Alert, Image, Pressable, ScrollView, TextInput, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ImagePicker from 'expo-image-picker'
import { BatteryLow, Check, CircleCheck, CircleDashed, CircleMinus, CloudRain, Minus, Paperclip, Sparkles, ThumbsUp, Video, X } from 'lucide-react-native'
import ScreenHeader from '../../components/ui/ScreenHeader'
import { ActionButton, AppText, Message, SurfaceCard } from '../../components/ui/design-system/components'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { API_BASE } from '../../services/api/config'
import { apiPost, saveSessionLocally, todayString } from '../../services/api/client'

const outcomes = [
  { value: 'completed', title: 'اكتمل التمرين', Icon: CircleCheck },
  { value: 'partially_completed', title: 'اكتمل جزئيًا', Icon: CircleDashed },
  { value: 'skipped', title: 'لم يُنفذ اليوم', Icon: CircleMinus },
]
const moods = [
  { title: 'انزعاج', Icon: CloudRain, pain: 9 }, { title: 'تعب', Icon: BatteryLow, pain: 7 },
  { title: 'عادي', Icon: Minus, pain: 5 }, { title: 'راحة', Icon: ThumbsUp, pain: 3 },
  { title: 'راحة تامة', Icon: Sparkles, pain: 1 },
]
export default function LogSessionScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { colors, fontsReady } = useTheme()
  const { planExerciseId, exerciseTitle } = route.params || {}
  const [outcome, setOutcome] = useState('completed')
  const [moodIndex, setMoodIndex] = useState(3)
  const [notes, setNotes] = useState('')
  const [media, setMedia] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (permission.status !== 'granted') { Alert.alert('إذن مطلوب', 'يرجى السماح بالوصول إلى الصور والمقاطع.'); return }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: .8 })
    if (!result.canceled && result.assets?.[0]) setMedia(result.assets[0])
  }
  const uploadMedia = async () => {
    if (!media) return null
    const token = await AsyncStorage.getItem('token')
    const ext = media.uri.split('.').pop()?.toLowerCase() || 'jpg'
    const type = media.type === 'video' ? `video/${ext === 'mov' ? 'quicktime' : ext}` : `image/${ext}`
    const form = new FormData()
    form.append('file', { uri: media.uri, name: `session.${ext}`, type })
    form.append('folder', 'feedback')
    const response = await fetch(`${API_BASE}/api/v1/upload/media`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form })
    if (!response.ok) throw new Error('تعذر رفع المرفق. حاول مجددًا.')
    const data = await response.json()
    return data.url || null
  }
  const save = async () => {
    setError('')
    if (!planExerciseId) { setError('معرّف التمرين غير متوفر.'); return }
    setSaving(true)
    try {
      const mediaUrl = await uploadMedia()
      const date = todayString()
      const response = await apiPost('/feedback/', { plan_exercise_id: planExerciseId, feedback_date: date, completion_status: outcome, pain_level: moods[moodIndex].pain, parent_notes: notes.trim() || null, parent_media_url: mediaUrl })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'تعذر حفظ الجلسة.')
      await saveSessionLocally({ plan_exercise_id: planExerciseId, exercise_title: exerciseTitle || 'التمرين', date, completion_status: outcome, pain_level: moods[moodIndex].pain, notes: notes.trim() })
      Alert.alert('تم حفظ الجلسة', 'سُجلت نتيجة التمرين بنجاح.', [{ text: 'حسنًا', onPress: () => navigation.goBack() }])
    } catch (cause) { setError(cause.message || 'تعذر الاتصال بالخادم.') }
    finally { setSaving(false) }
  }
  return <View style={{ flex: 1, backgroundColor: colors.canvas }}><ScreenHeader title="تسجيل الجلسة" onBack={() => navigation.goBack()} />
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 32, gap: 15 }}>
      <View><AppText variant="page" weight="bold">تسجيل الجلسة</AppText><AppText variant="support" color="muted">{exerciseTitle || 'التمرين'} · اليوم</AppText></View>
      <AppText variant="section" weight="bold">كيف سار التمرين؟</AppText>
      <View style={{ gap: 8 }}>{outcomes.map(item => <Pressable key={item.value} accessibilityRole="radio" accessibilityState={{ checked: outcome === item.value }} onPress={() => setOutcome(item.value)}><SurfaceCard style={{ minHeight: 46, paddingHorizontal: 12, paddingVertical: 9, borderColor: outcome === item.value ? colors.blue : colors.border, backgroundColor: outcome === item.value ? colors.blueSoft : colors.surface, flexDirection: 'row-reverse', alignItems: 'center', gap: 9 }}><item.Icon size={19} color={colors.blue} /><AppText variant="support" weight={outcome === item.value ? 'semibold' : 'regular'} style={{ flex: 1 }}>{item.title}</AppText>{outcome === item.value && <Check size={16} color={colors.blue} />}</SurfaceCard></Pressable>)}</View>
      <AppText variant="section" weight="bold">كيف كان شعور الطفل؟</AppText>
      <View style={{ flexDirection: 'row-reverse', gap: 5 }}>{moods.map((mood, index) => <Pressable key={mood.title} accessibilityRole="radio" accessibilityState={{ checked: moodIndex === index }} accessibilityLabel={mood.title} onPress={() => setMoodIndex(index)} style={{ flex: 1, minHeight: 66, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: moodIndex === index ? colors.blue : colors.border, backgroundColor: moodIndex === index ? colors.blueSoft : colors.surface, alignItems: 'center', justifyContent: 'center', gap: 3 }}><mood.Icon size={20} color={moodIndex === index ? colors.blue : colors.muted} strokeWidth={1.9} /><AppText variant="tiny" color={moodIndex === index ? 'blue' : 'muted'} style={{ textAlign: 'center' }}>{mood.title}</AppText></Pressable>)}</View>
      <View style={{ gap: 7 }}><AppText variant="support" weight="semibold">ملاحظات الجلسة (اختياري)</AppText><TextInput accessibilityLabel="ملاحظات الجلسة" multiline value={notes} onChangeText={setNotes} placeholder="ما الذي سار جيدًا؟ وهل ظهرت صعوبة؟" placeholderTextColor={colors.muted} style={{ minHeight: 90, borderWidth: 1, borderColor: colors.border, borderRadius: 11, backgroundColor: colors.surface, padding: 12, color: colors.text, textAlign: 'right', textAlignVertical: 'top', fontFamily: fontsReady ? 'PlexArabic-Regular' : undefined }} /></View>
      <AppText variant="support" weight="semibold">مرفق (اختياري)</AppText>
      {media ? <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 10, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>{media.type === 'image' ? <Image source={{ uri: media.uri }} style={{ width: 48, height: 48, borderRadius: 8 }} /> : <Video size={24} color={colors.blue} />}<AppText variant="support" style={{ flex: 1 }}>{media.type === 'video' ? 'مقطع مختار' : 'صورة مختارة'}</AppText><Pressable accessibilityRole="button" accessibilityLabel="حذف المرفق" onPress={() => setMedia(null)}><X size={20} color={colors.error} /></Pressable></View> : <Pressable onPress={pickMedia} accessibilityRole="button" style={{ minHeight: 68, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Paperclip size={19} color={colors.blue} /><AppText variant="support" color="blue">إرفاق صورة أو فيديو</AppText></Pressable>}
      {error && <Message tone="error">{error}</Message>}
      <ActionButton title="حفظ الجلسة" onPress={save} loading={saving} />
    </ScrollView>
  </View>
}
