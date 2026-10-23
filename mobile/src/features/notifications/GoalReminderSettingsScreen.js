import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Switch, TextInput, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { ChevronRight } from 'lucide-react-native'
import { ActionButton, AppText, Message, SurfaceCard } from '../../components/ui/design-system/components'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { apiGet, apiPut } from '../../services/api/client'

const deviceTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Riyadh'

export default function GoalReminderSettingsScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const [time, setTime] = useState('16:00')
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useFocusEffect(useCallback(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const response = await apiGet('/goals/reminder-settings')
        const body = await response.json()
        if (!response.ok) throw new Error(body.error || 'تعذر تحميل الإعدادات')
        if (active) { setTime(body.time); setEnabled(body.enabled); setError('') }
      } catch (cause) { if (active) setError(cause.message) }
      finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, []))

  const save = async () => {
    setSaved(false)
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) { setError('أدخل الوقت بصيغة 24 ساعة، مثل 16:00.'); return }
    setSaving(true); setError('')
    try {
      const response = await apiPut('/goals/reminder-settings', { time, enabled, timezone: deviceTimezone() })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'تعذر حفظ الإعدادات')
      setSaved(true)
    } catch (cause) { setError(cause.message) }
    finally { setSaving(false) }
  }

  return <View style={{ flex: 1, backgroundColor: colors.canvas }}>
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
      <Pressable accessibilityRole="button" accessibilityLabel="رجوع" onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-end', minHeight: 40, justifyContent: 'center', flexDirection: 'row-reverse', alignItems: 'center', gap: 5 }}><ChevronRight size={18} color={colors.blue} /><AppText color="blue">رجوع</AppText></Pressable>
      <View><AppText variant="page" weight="bold">تذكيرات الأهداف</AppText><AppText variant="support" color="muted">الأخصائي يحدد عدد التذكيرات لكل هدف، وأنت تختار وقت وصولها.</AppText></View>
      {loading ? <ActivityIndicator color={colors.blue} /> : <>
        <SurfaceCard style={{ padding: 16, gap: 16 }}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><View style={{ flex: 1 }}><AppText variant="support" weight="semibold">تفعيل تذكيرات الأهداف</AppText><AppText variant="tiny" color="muted">يمكن إيقافها في أي وقت.</AppText></View><Switch accessibilityLabel="تفعيل تذكيرات الأهداف" value={enabled} onValueChange={setEnabled} trackColor={{ true: colors.blue }} /></View>
          <View style={{ gap: 6 }}><AppText variant="support" weight="semibold">وقت التذكير</AppText><TextInput accessibilityLabel="وقت التذكير" value={time} onChangeText={setTime} placeholder="16:00" keyboardType="numbers-and-punctuation" maxLength={5} style={{ padding: 12, borderColor: colors.border, borderWidth: 1, borderRadius: 10, backgroundColor: colors.surface, color: colors.text, textAlign: 'right' }} /><AppText variant="tiny" color="muted">صيغة 24 ساعة حسب توقيت جهازك ({deviceTimezone()}). الوقت الافتراضي 16:00.</AppText></View>
        </SurfaceCard>
        {error ? <Message tone="error">{error}</Message> : saved ? <Message>تم حفظ إعدادات التذكير.</Message> : null}
        <ActionButton title="حفظ الإعدادات" loading={saving} onPress={save} />
      </>}
    </ScrollView>
  </View>
}
