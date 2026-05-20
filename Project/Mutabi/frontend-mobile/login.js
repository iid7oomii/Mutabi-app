import { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import LogoMark from './assets/logo-mark.svg'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert,
} from 'react-native'
import { apiPost } from './utils/api'

const BLUE = '#1F6FEB'

export default function Login({ navigation }) {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res  = await apiPost('/auth/login', { email, password })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        return
      }

      if (data.role !== 'parent') {
        setError('This app is for parents only')
        return
      }

      if (data.token) {
        await AsyncStorage.setItem('token', data.token)
      }

      navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
    } catch {
      setError('Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Logo */}
        <View style={styles.logoRow}>
          <LogoMark width={44} height={44} />
          <View>
            <Text style={styles.brandName}>Mutabi</Text>
            <Text style={styles.brandSub}>Therapy Platform</Text>
          </View>
        </View>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Email */}
        <Text style={styles.label}>Email or Phone Number</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="user" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter Email or Phone number"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="lock" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
            <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={18} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Contact your clinic admin to reset your password.')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Sign In */}
        <TouchableOpacity
          style={[styles.loginButton, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.loginButtonText}>Sign In  →</Text>
          }
        </TouchableOpacity>

        {/* Create Account */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <TouchableOpacity
            style={styles.createAccountBtn}
            onPress={() => navigation.navigate('CreateAccount')}
          >
            <Text style={styles.createAccountText}>Create Account</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#fff' },
  inner:             { flex: 1, paddingHorizontal: 32, justifyContent: 'center' },
  logoRow:           { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 48 },
  brandName:         { fontSize: 16, fontWeight: '700', color: BLUE },
  brandSub:          { fontSize: 12, color: '#aaa' },
  errorBox:          { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText:         { color: '#dc2626', fontSize: 13, textAlign: 'center' },
  label:             { fontSize: 13, fontWeight: '500', color: '#444', marginBottom: 6, marginTop: 16 },
  inputContainer:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, height: 48, backgroundColor: '#fff' },
  inputIcon:         { fontSize: 15, marginRight: 8, color: '#999' },
  input:             { flex: 1, fontSize: 14, color: '#333' },
  forgotPassword:    { fontSize: 13, color: '#FF7A00', marginTop: 8, alignSelf: 'flex-end' },
  loginButton:       { backgroundColor: BLUE, borderRadius: 10, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  loginButtonText:   { color: '#fff', fontSize: 15, fontWeight: '600' },
  signupRow:         { alignItems: 'center', marginTop: 24, gap: 10 },
  signupText:        { fontSize: 13, color: '#888' },
  createAccountBtn:  { borderWidth: 1, borderColor: '#FF7A00', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 8 },
  createAccountText: { fontSize: 13, color: '#FF7A00', fontWeight: '600' },
})
