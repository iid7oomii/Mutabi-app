import { useEffect, useState } from 'react'
import { AppState, View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import BottomTabBar from '../components/ui/BottomTabBar'
import { useTheme } from '../components/ui/design-system/ThemeProvider'
import HomeScreen from '../features/children/HomeScreen'
import TherapyScreen from '../features/therapy/TherapyScreen'
import ProgressScreen from '../features/progress/ProgressScreen'
import ProfileScreen from '../features/auth/ProfileScreen'
import { syncGoalReminderTimezone } from '../services/notifications'

export default function MainTabs({ navigation }) {
  const [activeTab, setActiveTab] = useState('Home')
  const { colors } = useTheme()

  useEffect(() => {
    syncGoalReminderTimezone()
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') syncGoalReminderTimezone() })
    return () => subscription.remove()
  }, [])

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.canvas }]} edges={[]}>
      <View style={styles.content}>
        <View style={[styles.tab, activeTab === 'Home'     && styles.visible]}>
          <HomeScreen onTabPress={setActiveTab} activeTab={activeTab} />
        </View>
        <View style={[styles.tab, activeTab === 'Therapy'  && styles.visible]}>
          <TherapyScreen onTabPress={setActiveTab} activeTab={activeTab} />
        </View>
        <View style={[styles.tab, activeTab === 'Progress' && styles.visible]}>
          <ProgressScreen onTabPress={setActiveTab} activeTab={activeTab} />
        </View>
        <View style={[styles.tab, activeTab === 'Profile'  && styles.visible]}>
          <ProfileScreen onTabPress={setActiveTab} activeTab={activeTab} />
        </View>
      </View>
      <BottomTabBar active={activeTab} onTabPress={setActiveTab} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { flex: 1 },
  tab:       { flex: 1, display: 'none' },
  visible:   { display: 'flex' },
})
