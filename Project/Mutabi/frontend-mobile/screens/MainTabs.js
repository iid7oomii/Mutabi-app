import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import BottomTabBar from '../components/BottomTabBar'
import HomeScreen from './HomeScreen'
import TherapyScreen from './TherapyScreen'
import ProgressScreen from './ProgressScreen'
import ProfileScreen from './ProfileScreen'

export default function MainTabs({ navigation }) {
  const [activeTab, setActiveTab] = useState('Home')

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Render all tabs but show only the active one */}
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
  container: { flex: 1, backgroundColor: '#f8f9fb' },
  content:   { flex: 1 },
  tab:       { flex: 1, display: 'none' },
  visible:   { display: 'flex' },
})
