import { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity, Linking, Image,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { apiGet } from '../utils/api'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

export default function ArticlesScreen() {
  const navigation = useNavigation()
  const insets     = useSafeAreaInsets()
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)

  useFocusEffect(useCallback(() => {
    let active = true
    async function load() {
      setLoading(true)
      try {
        const res  = await apiGet('/articles/')
        const json = await res.json()
        if (active && res.ok) setArticles(Array.isArray(json) ? json : [])
      } catch {}
      finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, []))

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>مقالات التوعية</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={BLUE} size="large" />
        </View>
      ) : articles.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="library-outline" size={52} color="#ccc" />
          <Text style={styles.emptyTitle}>لا توجد مقالات بعد</Text>
          <Text style={styles.emptySubTitle}>ستظهر المقالات هنا بمجرد إضافتها</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {articles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.card}
              activeOpacity={0.88}
              onPress={() => article.article_url && Linking.openURL(article.article_url)}
            >
              {article.image_url ? (
                <Image
                  source={{ uri: article.image_url }}
                  style={styles.cardImg}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={['#EEF3FA', '#dbeafe']}
                  style={[styles.cardImg, styles.cardImgFallback]}
                >
                  <Ionicons name="document-text-outline" size={36} color="#93c5fd" />
                </LinearGradient>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={2}>{article.title}</Text>
                {article.summary ? (
                  <Text style={styles.cardSummary} numberOfLines={3}>{article.summary}</Text>
                ) : null}
                <View style={styles.readMore}>
                  <Text style={styles.readMoreText}>اقرأ المقال</Text>
                  <Ionicons name="arrow-back" size={13} color={ORANGE} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f7f9fc' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn:        { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle:     { fontSize: 15, fontWeight: '700', color: '#aaa' },
  emptySubTitle:  { fontSize: 12, color: '#ccc', textAlign: 'center' },
  scroll:         { padding: 20, paddingBottom: 40 },
  card:           { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  cardImg:        { width: '100%', height: 160 },
  cardImgFallback:{ alignItems: 'center', justifyContent: 'center' },
  cardBody:       { padding: 16 },
  cardTitle:      { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 6, lineHeight: 22 },
  cardSummary:    { fontSize: 13, color: '#666', lineHeight: 19, marginBottom: 12 },
  readMore:       { flexDirection: 'row', alignItems: 'center', gap: 5 },
  readMoreText:   { fontSize: 13, color: ORANGE, fontWeight: '600' },
})
