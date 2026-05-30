import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE } from '../config'

const BASE = `${API_BASE}/api/v1`

async function getHeaders() {
  const token = await AsyncStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function apiGet(path) {
  const headers = await getHeaders()
  return fetch(`${BASE}${path}`, { headers })
}

export async function apiPost(path, body) {
  const headers = await getHeaders()
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
}

export async function apiPut(path, body) {
  const headers = await getHeaders()
  return fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
}

const SESSIONS_KEY = 'logged_sessions'

export async function saveSessionLocally(session) {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY)
  const sessions = raw ? JSON.parse(raw) : []
  sessions.push({ ...session, created_at: new Date().toISOString() })
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
}

export async function getLocalSessions() {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY)
  return raw ? JSON.parse(raw) : []
}

export function todayString() {
  return new Date().toISOString().split('T')[0]
}
