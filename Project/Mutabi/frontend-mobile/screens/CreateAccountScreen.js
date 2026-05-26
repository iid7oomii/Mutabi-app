import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { apiPost } from '../utils/api'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

const RELATIONSHIP_TYPES = ['mother', 'father', 'guardian', 'other']

function Field({ icon, placeholder, field, keyboard, secure, showToggle, value, onChangeText, showPassword, onTogglePassword }) {
  return (
    <View style={styles.inputWrap}>
      <Ionicons name={icon} size={16} color="#aaa" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboard || 'default'}
        autoCapitalize="none"
        secureTextEntry={secure && !showPassword}
      />
      {showToggle && (
        <TouchableOpacity onPress={onTogglePassword}>
          <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={18} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  )
}

export default function CreateAccountScreen() {
  const navigation = useNavigation()

  const [form, setForm] = useState({
    first_name:        '',
    second_name:       '',
    phone:             '',
    email:             '',
    password:          '',
    relationship_type: 'mother',
    clinic_id:         '',
  })
  const [showPassword, setShowPassword]     = useState(false)
  const [showRelPicker, setShowRelPicker]   = useState(false)
  const [loading, setLoading]               = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleCreate = async () => {
    const { first_name, second_name, phone, email, password, clinic_id, relationship_type } = form
    if (!first_name || !second_name || !phone || !email || !password || !clinic_id) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.')
      return
    }
    setLoading(true)
    try {
      const res  = await apiPost('/auth/parent/signup', {
        first_name,
        second_name,
        phone,
        email,
        password,
        relationship_type,
        clinic_id,
      })
      const json = await res.json()
      if (!res.ok) {
        Alert.alert('Error', json.error || 'Could not create account')
        return
      }
      // If signup returns a token, save it
      if (json.token) {
        await AsyncStorage.setItem('token', json.token)
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] })
      } else {
        Alert.alert('Account Created!', 'You can now sign in.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ])
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Logo / Header */}
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>م</Text>
            </View>
            <View>
              <Text style={styles.brandName}>Mutabi</Text>
              <Text style={styles.brandSub}>Therapy Platform</Text>
            </View>
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Please fill in your details to get started.</Text>

          {/* Form */}
          <Text style={styles.label}>First Name</Text>
          <Field icon="person-outline" placeholder="Khalid" value={form.first_name} onChangeText={v => set('first_name', v)} />

          <Text style={styles.label}>Last Name</Text>
          <Field icon="person-outline" placeholder="Al omari" value={form.second_name} onChangeText={v => set('second_name', v)} />

          <Text style={styles.label}>Phone Number</Text>
          <Field icon="call-outline" placeholder="+966 500 000 000" keyboard="phone-pad" value={form.phone} onChangeText={v => set('phone', v)} />

          <Text style={styles.label}>Email Address</Text>
          <Field icon="mail-outline" placeholder="jane@example.com" keyboard="email-address" value={form.email} onChangeText={v => set('email', v)} />

          <Text style={styles.label}>Password</Text>
          <Field icon="lock-closed-outline" placeholder="••••••••" secure showToggle showPassword={showPassword} onTogglePassword={() => setShowPassword(p => !p)} value={form.password} onChangeText={v => set('password', v)} />
          <Text style={styles.hint}>Must be at least 8 characters long.</Text>

          {/* Relationship Type */}
          <Text style={styles.label}>Relationship to Child</Text>
          <TouchableOpacity style={styles.inputWrap} onPress={() => setShowRelPicker(p => !p)}>
            <Ionicons name="people-outline" size={16} color="#aaa" style={styles.inputIcon} />
            <Text style={[styles.input, { paddingVertical: 4, color: '#333' }]}>
              {form.relationship_type.charAt(0).toUpperCase() + form.relationship_type.slice(1)}
            </Text>
            <Ionicons name={showRelPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#aaa" />
          </TouchableOpacity>
          {showRelPicker && (
            <View style={styles.picker}>
              {RELATIONSHIP_TYPES.map(r => (
                <TouchableOpacity
                  key={r}
                  style={styles.pickerItem}
                  onPress={() => { set('relationship_type', r); setShowRelPicker(false) }}
                >
                  <Text style={[styles.pickerText, form.relationship_type === r && styles.pickerTextActive]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Clinic ID */}
          <Text style={styles.label}>Clinic ID</Text>
          <Field icon="business-outline" placeholder="Provided by your clinic" value={form.clinic_id} onChangeText={v => set('clinic_id', v)} />
          <Text style={styles.hint}>Ask your clinic admin for the Clinic ID.</Text>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createBtn, loading && { opacity: 0.7 }]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.createBtnText}>Create Account  →</Text>
            }
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signinRow}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.signinLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll:    { paddingHorizontal: 28, paddingBottom: 32 },

  logoRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 32, marginBottom: 32 },
  logoBox:    { width: 44, height: 44, borderRadius: 10, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  logoLetter: { fontSize: 22, fontWeight: '700', color: '#fff' },
  brandName:  { fontSize: 16, fontWeight: '700', color: BLUE },
  brandSub:   { fontSize: 12, color: '#aaa' },

  title:    { fontSize: 24, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 24 },
  label:    { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 14 },
  hint:     { fontSize: 11, color: '#aaa', marginTop: 4 },

  inputWrap:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, height: 48, backgroundColor: '#fafafa' },
  inputIcon:  { marginRight: 8 },
  input:      { flex: 1, fontSize: 14, color: '#333' },

  /* Picker */
  picker:         { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, overflow: 'hidden', marginTop: 4 },
  pickerItem:     { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  pickerText:     { fontSize: 14, color: '#555' },
  pickerTextActive:{ color: BLUE, fontWeight: '700' },

  createBtn:      { backgroundColor: BLUE, borderRadius: 10, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 28 },
  createBtnText:  { color: '#fff', fontSize: 15, fontWeight: '700' },

  signinRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  signinText: { fontSize: 13, color: '#888' },
  signinLink: { fontSize: 13, color: ORANGE, fontWeight: '600' },
})
