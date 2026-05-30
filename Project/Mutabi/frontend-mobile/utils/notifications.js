import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE } from '../config'

export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })
}

export async function createAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1F6FEB',
    })
  }
}

export async function registerDeviceToken(authToken) {
  if (!Device.isDevice) return

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return

  try {
    await createAndroidChannel()

    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    if (!projectId) {
      console.warn('[Notifications] No projectId found. Run "eas init" to configure.')
      return
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })
    const expoToken = tokenData.data

    const saved = await AsyncStorage.getItem('device_token')
    if (saved === expoToken) return

    const res = await fetch(`${API_BASE}/api/v1/notifications/device-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ device_token: expoToken }),
    })

    if (res.ok) {
      await AsyncStorage.setItem('device_token', expoToken)
      console.log('[Notifications] Expo push token registered:', expoToken)
    }
  } catch (e) {
    console.log('[Notifications] Failed to register token:', e)
  }
}
