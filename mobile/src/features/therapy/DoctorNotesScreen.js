import { useCallback, useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { Heart, MessageSquareText } from 'lucide-react-native'
import ScreenHeader from '../../components/ui/ScreenHeader'
import { AppText, EmptyState, SurfaceCard } from '../../components/ui/design-system/components'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { apiGet } from '../../services/api/client'

export default function DoctorNotesScreen() {
  const navigation = useNavigation()
  const route = useRoute()
  const { colors } = useTheme()
  const childId = route.params?.childId
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useFocusEffect(useCallback(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try { if (!childId) throw new Error('اختر الطفل أولًا.'); const response = await apiGet(`/doctor-notes/child/${childId}`); if (!response.ok) throw new Error('تعذر تحميل الملاحظات.'); const data = await response.json(); if (active) setNotes(Array.isArray(data) ? data : []) }
      catch (cause) { if (active) setError(cause.message || 'تعذر الاتصال بالخادم.') }
      finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, [childId]))
  return <View style={{ flex: 1, backgroundColor: colors.canvas }}><ScreenHeader title="ملاحظات الأخصائي" onBack={() => navigation.goBack()} />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28, gap: 11 }}><View><AppText variant="page" weight="bold">ملاحظات الأخصائي</AppText><AppText variant="support" color="muted">توجيهات مرتبطة بخطة الطفل.</AppText></View>
      {loading ? <ActivityIndicator color={colors.blue} style={{ marginTop: 50 }} /> : error ? <EmptyState icon={MessageSquareText} title="تعذر تحميل الملاحظات" description={error} /> : !notes.length ? <EmptyState icon={MessageSquareText} title="لا توجد ملاحظات بعد" description="ستظهر ملاحظات الأخصائي هنا عند إضافتها." /> : notes.map(note => <SurfaceCard key={note.id} style={{ padding: 15, gap: 8 }}><View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}><View style={{ width: 35, height: 35, borderRadius: 10, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' }}><Heart size={17} color={colors.blue} /></View><View style={{ flex: 1 }}><AppText variant="support" weight="semibold">{note.doctor_name || 'الأخصائي'}</AppText><AppText variant="tiny" color="muted">{note.created_at ? new Date(note.created_at).toLocaleDateString('ar-SA-u-ca-gregory', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</AppText></View></View><View style={{ borderRightWidth: 2, borderRightColor: colors.orange, paddingRight: 9 }}><AppText variant="support">{note.content}</AppText></View></SurfaceCard>)}
    </ScrollView>
  </View>
}
