import { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { apiGet } from '../utils/api'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

export default function ArticlesScreen() {
  const navigation = useNavigation()
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const res  = await apiGet('/articles')
      const json = await res.json()
      if (res.ok) setArticles(Array.isArray(json) ? json : [])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(useCallback(() => { fetchArticles() }, []))

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
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
          {articles.map((article, i) => (
            <TouchableOpacity key={article.id || i} style={styles.card} activeOpacity={0.85}>
              <View style={styles.cardTop}>
                <View style={styles.iconBox}>
                  <Ionicons name="document-text-outline" size={22} color={BLUE} />
                </View>
                {article.tag && (
                  <View style={styles.tagBox}>
                    <Text style={styles.tagText}>{article.tag}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>{article.title}</Text>
              {article.summary && (
                <Text style={styles.cardSummary}>{article.summary}</Text>
              )}
              <View style={styles.readMore}>
                <Text style={styles.readMoreText}>اقرأ المزيد</Text>
                <Ionicons name="arrow-back" size={14} color={ORANGE} />
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
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backBtn:        { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyTitle:     { fontSize: 15, fontWeight: '700', color: '#aaa' },
  emptySubTitle:  { fontSize: 12, color: '#ccc', textAlign: 'center' },
  scroll:         { padding: 20, paddingBottom: 40 },
  card:           { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTop:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  iconBox:        { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center' },
  tagBox:         { backgroundColor: '#FFF3E8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText:        { fontSize: 11, color: ORANGE, fontWeight: '600' },
  cardTitle:      { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  cardSummary:    { fontSize: 13, color: '#666', lineHeight: 20, marginBottom: 14 },
  readMore:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readMoreText:   { fontSize: 13, color: ORANGE, fontWeight: '600' },
})
