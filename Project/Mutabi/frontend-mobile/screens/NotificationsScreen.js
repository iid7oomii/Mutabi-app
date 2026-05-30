import { useState, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { apiGet, apiPut } from '../utils/api'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

function iconForType(type) {
  switch (type) {
    case 'new_plan':       return { name: 'document-text-outline', bg: '#EEF3FA', color: BLUE }
    case 'feedback_reply': return { name: 'person',                bg: '#FFF3E8', color: ORANGE }
    case 'feedback_report':return { name: 'clipboard-outline',     bg: '#E8F5E9', color: '#2E7D32' }
    default:               return { name: 'notifications-outline', bg: '#F5F5F5', color: '#888' }
  }
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
}

export default function NotificationsScreen() {
  const navigation                          = useNavigation()
  const [notifications, setNotifications]   = useState([])
  const [loading, setLoading]               = useState(true)
  const [markingAll, setMarkingAll]         = useState(false)

  useFocusEffect(
    useCallback(() => {
      let active = true
      async function load() {
        setLoading(true)
        try {
          const res  = await apiGet('/notifications/')
          const data = await res.json()
          if (active && res.ok) setNotifications(Array.isArray(data) ? data : [])
        } catch {}
        finally { if (active) setLoading(false) }
      }
      load()
      return () => { active = false }
    }, [])
  )

  const markOne = async (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
    try { await apiPut(`/notifications/${id}/read`, {}) } catch {}
  }

  const markAll = async () => {
    setMarkingAll(true)
    try {
      await apiPut('/notifications/read-all', {})
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch {}
    setMarkingAll(false)
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const renderItem = ({ item }) => {
    const ic = iconForType(item.type)
    return (
      <TouchableOpacity
        style={[styles.item, !item.is_read && styles.itemNew]}
        activeOpacity={0.8}
        onPress={() => markOne(item.id)}
      >
        <View style={[styles.iconWrap, { backgroundColor: ic.bg }]}>
          <Ionicons name={ic.name} size={20} color={ic.color} />
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            {!item.is_read && (
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>جديد</Text>
              </View>
            )}
          </View>
          <Text style={styles.itemBody} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.itemTime}>{formatDate(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الإشعارات</Text>
        <Ionicons name="notifications" size={22} color={ORANGE} style={{ marginLeft: 'auto' }} />
      </View>

      {/* Subheader */}
      <View style={styles.subHeader}>
        <Text style={styles.pageSubtitle}>
          {unreadCount > 0 ? `لديك ${unreadCount} رسائل غير مقروءة` : 'لا توجد رسائل غير مقروءة'}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAll} disabled={markingAll}>
            <Text style={styles.markAll}>
              {markingAll ? '...' : 'تحديد الكل كمقروء'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={BLUE} style={{ marginTop: 40 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>لا توجد إشعارات</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f8f9fb' },

  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 10 },
  backBtn:      { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },

  subHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  pageSubtitle: { fontSize: 13, color: '#888' },
  markAll:      { fontSize: 13, color: ORANGE, fontWeight: '600' },

  list:         { padding: 16, gap: 10 },

  item:         { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  itemNew:      { borderLeftWidth: 3, borderLeftColor: ORANGE },
  iconWrap:     { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemContent:  { flex: 1, gap: 4 },
  itemHeader:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemTitle:    { fontSize: 14, fontWeight: '700', color: '#1a1a2e', flex: 1 },
  newBadge:     { backgroundColor: '#FFF3E8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  newBadgeText: { fontSize: 11, color: ORANGE, fontWeight: '700' },
  itemBody:     { fontSize: 13, color: '#666', lineHeight: 18 },
  itemTime:     { fontSize: 11, color: '#aaa', marginTop: 2 },

  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText:    { fontSize: 14, color: '#aaa' },
})
