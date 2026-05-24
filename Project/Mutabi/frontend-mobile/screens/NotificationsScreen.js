import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'doctor',
    title: 'Dr. Sarah Jenkins',
    body: "I've reviewed your latest progress log. Let's discuss the new coping strategies",
    time: '10:42 AM',
    isNew: true,
    icon: 'person',
    iconBg: '#FFF3E8',
    iconColor: ORANGE,
  },
  {
    id: '2',
    type: 'appointment',
    title: 'Upcoming Appointment',
    body: 'Reminder: You have a therapy session scheduled with Dr. Sarah Jenkins...',
    time: 'Yesterday',
    isNew: true,
    icon: 'calendar-outline',
    iconBg: '#EEF3FA',
    iconColor: BLUE,
  },
  {
    id: '3',
    type: 'milestone',
    title: 'Milestone Reached!',
    body: 'Congratulations on completing 7 consecutive days of mindfulness...',
    time: 'Oct 24',
    isNew: false,
    icon: 'trophy-outline',
    iconBg: '#E8F5E9',
    iconColor: '#2E7D32',
  },
  {
    id: '4',
    type: 'system',
    title: 'System Update',
    body: "We've updated our privacy policy and added new features to the Progress...",
    time: 'Oct 20',
    isNew: false,
    icon: 'shield-checkmark-outline',
    iconBg: '#F5F5F5',
    iconColor: '#888',
  },
]

export default function NotificationsScreen() {
  const navigation = useNavigation()

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.item, item.isNew && styles.itemNew]} activeOpacity={0.8}>
      <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={20} color={item.iconColor} />
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          )}
        </View>
        <Text style={styles.itemBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.itemTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a1a2e" />
        </TouchableOpacity>
        <View style={[styles.headerLogo, { backgroundColor: '#EEF3FA' }]}>
          <Ionicons name="person" size={14} color={BLUE} />
        </View>
        <Text style={styles.clinicName}>Clinic Name</Text>
        <Ionicons name="notifications" size={22} color={ORANGE} style={{ marginLeft: 'auto' }} />
      </View>

      {/* Subheader */}
      <View style={styles.subHeader}>
        <View>
          <Text style={styles.pageTitle}>Notifications</Text>
          <Text style={styles.pageSubtitle}>
            You have {MOCK_NOTIFICATIONS.filter(n => n.isNew).length} unread messages.
          </Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.markAll}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fb' },

  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 10 },
  backBtn:     { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerLogo:  { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  clinicName:  { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },

  subHeader:   { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  pageTitle:   { fontSize: 22, fontWeight: '700', color: '#1a1a2e' },
  pageSubtitle:{ fontSize: 13, color: '#888', marginTop: 2 },
  markAll:     { fontSize: 13, color: ORANGE, fontWeight: '600', paddingTop: 6 },

  list: { padding: 16, gap: 10 },

  item:        { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  itemNew:     { borderLeftWidth: 3, borderLeftColor: ORANGE },
  iconWrap:    { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemContent: { flex: 1, gap: 4 },
  itemHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemTitle:   { fontSize: 14, fontWeight: '700', color: '#1a1a2e', flex: 1 },
  newBadge:    { backgroundColor: '#FFF3E8', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  newBadgeText:{ fontSize: 11, color: ORANGE, fontWeight: '700' },
  itemBody:    { fontSize: 13, color: '#666', lineHeight: 18 },
  itemTime:    { fontSize: 11, color: '#aaa', marginTop: 2 },
})
