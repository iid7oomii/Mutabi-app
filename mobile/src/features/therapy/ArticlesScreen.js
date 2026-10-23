import { useCallback, useState } from 'react'
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, View } from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { BookOpen, ChevronLeft } from 'lucide-react-native'
import ScreenHeader from '../../components/ui/ScreenHeader'
import { AppText, EmptyState, SurfaceCard } from '../../components/ui/design-system/components'
import { useTheme } from '../../components/ui/design-system/ThemeProvider'
import { apiGet } from '../../services/api/client'

export default function ArticlesScreen() {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useFocusEffect(useCallback(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError('')
      try { const response = await apiGet('/articles/'); if (!response.ok) throw new Error(); const data = await response.json(); if (active) setArticles(Array.isArray(data) ? data : []) }
      catch { if (active) setError('تعذر تحميل المقالات.') }
      finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, []))
  return <View style={{ flex: 1, backgroundColor: colors.canvas }}><ScreenHeader title="مقالات التوعية" onBack={() => navigation.goBack()} />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 28, gap: 11 }}>
      <View><AppText variant="page" weight="bold">مكتبة المقالات</AppText><AppText variant="support" color="muted">محتوى مختصر لدعم رحلة العلاج.</AppText></View>
      {loading ? <ActivityIndicator color={colors.blue} style={{ marginTop: 50 }} /> : error ? <EmptyState icon={BookOpen} title="تعذر تحميل المقالات" description={error} /> : !articles.length ? <EmptyState icon={BookOpen} title="لا توجد مقالات بعد" description="ستظهر المقالات هنا عند إضافتها." /> : articles.map(article => <Pressable key={article.id} accessibilityRole="link" onPress={() => article.article_url && Linking.openURL(article.article_url)}><SurfaceCard style={{ padding: 13, flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 11 }}><View style={{ width: 42, height: 42, borderRadius: 11, backgroundColor: colors.orangeSoft, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{article.image_url ? <Image source={{ uri: article.image_url }} style={{ width: 42, height: 42 }} /> : <BookOpen size={20} color={colors.orangeText} />}</View><View style={{ flex: 1, gap: 3 }}><AppText variant="support" weight="semibold">{article.title}</AppText>{article.summary && <AppText variant="tiny" color="muted" numberOfLines={3}>{article.summary}</AppText>}<AppText variant="tiny" color="blue">قراءة المقال</AppText></View><ChevronLeft size={17} color={colors.muted} /></SurfaceCard></Pressable>)}
    </ScrollView>
  </View>
}
