import { useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import LogoMark from './assets/logo-mark.svg'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ActivityIndicator
} from 'react-native'


const BLUE = '#0F4C81'

export default function Login({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://192.168.1.50:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'حدث خطأ')
        return
      }

      if (data.role !== 'parent') {
        setError('هذا التطبيق مخصص لأولياء الأمور فقط')
        return
      }

      await AsyncStorage.setItem('token', data.token)
      navigation.navigate('Home')

    } catch {
      setError('تعذر الاتصال بالخادم')
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
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

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
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome 
            name={showPassword ? 'eye' : 'eye-slash'} 
            size={18} 
            color="#999" 
            />
        </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.loginButtonText}>Sign In →</Text>
          }
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, paddingHorizontal: 32, justifyContent: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 48 },
  logoBox: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center' },
  logoIcon: { fontSize: 22, color:'#1F6FEB' },
  brandName: { fontSize: 16, fontWeight: '700', color: '#1F6FEB' },
  brandSub: { fontSize: 14, fontWeight: '700', color: '#1F6FEB' },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { color: '#dc2626', fontSize: 13, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '500', color: '#444', marginBottom: 6, marginTop: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, height: 48, backgroundColor: '#fff' },
  inputIcon: { fontSize: 15, marginRight: 8, color: '#999' },
  input: { flex: 1, fontSize: 14, color: '#333' },
  forgotPassword: { fontSize: 13, color: '#FF7A00', marginTop: 8 },
  loginButton: { backgroundColor: '#1F6FEB', borderRadius: 10, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  loginButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  signupRow: { alignItems: 'center', marginTop: 24 },
  signupText: { fontSize: 13, color: '#888' },
  createAccountBtn: { alignSelf: 'center', marginTop: 8, borderWidth: 1, borderColor: '#FF7A00', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 7 },
  createAccountText: { fontSize: 13, color: '#FF7A00', fontWeight: '500' },
})