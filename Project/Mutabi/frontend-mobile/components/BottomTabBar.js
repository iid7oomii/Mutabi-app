import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const ORANGE = '#FF7A00'

const TABS = [
  { key: 'Home',     label: 'الرئيسية', icon: 'home-outline',      activeIcon: 'home' },
  { key: 'Therapy',  label: 'العلاج',   icon: 'medical-outline',   activeIcon: 'medical' },
  { key: 'Progress', label: 'التقدم',   icon: 'bar-chart-outline', activeIcon: 'bar-chart' },
  { key: 'Profile',  label: 'الملف',    icon: 'person-outline',    activeIcon: 'person' },
]

export default function BottomTabBar({ active, onTabPress }) {
  return (
    <View style={styles.bar}>
      {TABS.map(tab => {
        const isActive = active === tab.key
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.item}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            {isActive ? (
              <View style={styles.activeWrap}>
                <Ionicons name={tab.activeIcon} size={22} color="#fff" />
              </View>
            ) : (
              <Ionicons name={tab.icon} size={22} color="#888" />
            )}
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 10,
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  activeWrap: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    padding: 6,
  },
  label: { fontSize: 11, color: '#888' },
  labelActive: { color: ORANGE, fontWeight: '600' },
})
