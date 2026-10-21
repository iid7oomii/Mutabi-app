import { useCallback, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Bell, CalendarDays, CircleCheck, MessageCircle } from 'lucide-react-native'
import ScreenHeader from '../../components/ui/ScreenHeader'
import { AppText, EmptyState, SurfaceCard } from '../../components/ui/design-system/components'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { apiGet, apiPut } from '../../services/api/client'

const iconForType = type => type === 'new_plan' ? CalendarDays : type === 'feedback_reply' ? MessageCircle : type === 'feedback_report' ? CircleCheck : Bell

export default function NotificationsScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [error, setError] = useState('')
  useFocusEffect(useCallback(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try { const response = await apiGet('/notifications/'); if (!response.ok) throw new Error(); const data = await response.json(); if (active) setNotifications(Array.isArray(data) ? data : []) }
      catch { if (active) setError('تعذر تحميل الإشعارات.') }
      finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, []))
  const markOne = async id => { try { const response = await apiPut(`/notifications/${id}/read`, {}); if (!response.ok) throw new Error(); setNotifications(current => current.map(item => item.id === id ? { ...item, is_read: true } : item)) } catch { setError('تعذر تحديث الإشعار.') } }
  const markAll = async () => { setMarkingAll(true); try { const response = await apiPut('/notifications/read-all', {}); if (!response.ok) throw new Error(); setNotifications(current => current.map(item => ({ ...item, is_read: true }))) } catch { setError('تعذر تحديث الإشعارات.') } finally { setMarkingAll(false) } }
  const unread = notifications.filter(item => !item.is_read).length
  return <View style={{ flex: 1, backgroundColor: colors.canvas }}><ScreenHeader title="الإشعارات" onBack={() => navigation.goBack()} />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28, gap: 12 }}><View><AppText variant="page" weight="bold">الإشعارات</AppText><AppText variant="support" color="muted">آخر التحديثات المتعلقة بخطة الطفل.</AppText></View>
      {unread > 0 && <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}><AppText variant="support" weight="semibold">{unread} غير مقروء</AppText><Pressable onPress={markAll} disabled={markingAll}><AppText variant="support" color="orangeText" weight="semibold">{markingAll ? 'جارٍ التحديث…' : 'تحديد الكل كمقروء'}</AppText></Pressable></View>}
      {error && <AppText variant="support" color="error" accessibilityRole="alert">{error}</AppText>}
      {loading ? <ActivityIndicator color={colors.blue} style={{ marginTop: 50 }} /> : !notifications.length ? <EmptyState icon={Bell} title="لا توجد إشعارات" description="ستظهر هنا التحديثات الجديدة المرتبطة بالطفل." /> : <SurfaceCard style={{ paddingHorizontal: 13 }}>{notifications.map((item, index) => { const Icon = iconForType(item.type); return <Pressable key={item.id} accessibilityRole="button" onPress={() => markOne(item.id)} style={{ paddingVertical: 13, flexDirection: 'row-reverse', gap: 10, borderTopWidth: index ? 1 : 0, borderTopColor: colors.border }}><View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: item.is_read ? colors.blueSoft : colors.orangeSoft, alignItems: 'center', justifyContent: 'center' }}><Icon size={18} color={item.is_read ? colors.blue : colors.orangeText} /></View><View style={{ flex: 1, gap: 3 }}><AppText variant="support" weight="semibold">{item.title}</AppText><AppText variant="tiny" color="muted">{item.body}</AppText><AppText variant="tiny" color="muted">{item.created_at ? new Date(item.created_at).toLocaleDateString('ar-SA-u-ca-gregory', { day: 'numeric', month: 'short' }) : ''}</AppText></View>{!item.is_read && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.orange, marginTop: 5 }} />}</Pressable> })}</SurfaceCard>}
    </ScrollView>
  </View>
}
