import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { colors, radius, space, type, icon } from './tokens'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'mutabi-theme'

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light')
  const [preferencesReady, setPreferencesReady] = useState(false)
  const [fontsReady, fontError] = useFonts({
    'PlexArabic-Regular': require('./fonts/IBMPlexSansArabic-Regular.ttf'),
    'PlexArabic-Medium': require('./fonts/IBMPlexSansArabic-Medium.ttf'),
    'PlexArabic-SemiBold': require('./fonts/IBMPlexSansArabic-SemiBold.ttf'),
    'PlexArabic-Bold': require('./fonts/IBMPlexSansArabic-Bold.ttf'),
  })

  useEffect(() => {
    let active = true
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (active && saved === 'dark') setMode('dark')
    }).catch(() => {}).finally(() => {
      if (active) setPreferencesReady(true)
    })
    return () => { active = false }
  }, [])

  const value = useMemo(() => ({
    mode,
    colors: colors[mode],
    radius,
    space,
    type,
    icon,
    fontsReady: Boolean(fontsReady),
    setMode: next => {
      const resolved = next === 'dark' ? 'dark' : 'light'
      setMode(resolved)
      AsyncStorage.setItem(STORAGE_KEY, resolved).catch(() => {})
    },
    toggleMode: () => {
      const next = mode === 'light' ? 'dark' : 'light'
      setMode(next)
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {})
    },
  }), [mode, fontsReady])

  if ((!fontsReady && !fontError) || !preferencesReady) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.light.canvas }}>
      <ActivityIndicator color={colors.light.blue} />
    </View>
  }
  return <ThemeContext.Provider value={value}>
    <StatusBar style={mode === 'dark' ? 'light' : 'dark'} backgroundColor={colors[mode].canvas} />
    {children}
  </ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
