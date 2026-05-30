import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Image,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { apiPost, saveSessionLocally, todayString } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE } from '../config'

const BLUE   = '#1F6FEB'
const ORANGE = '#FF7A00'

const COMPLETION_OPTIONS = [
  { key: 'completed',           label: 'مكتمل',      icon: 'checkmark-circle', color: '#2E7D32', bg: '#E8F5E9' },
  { key: 'partially_completed', label: 'جزئي',       icon: 'radio-button-on',  color: '#E65100', bg: '#FFF3E8' },
  { key: 'skipped',             label: 'تم التخطي',  icon: 'close-circle',     color: '#B71C1C', bg: '#FFEBEE' },
]

const MOODS = [
  { icon: 'sad-sharp',             color: '#B71C1C', bg: '#FFEBEE', label: 'سيء جداً', pain: 9 },
  { icon: 'sad-outline',           color: '#E65100', bg: '#FFF3E8', label: 'سيء',      pain: 7 },
  { icon: 'remove-circle-outline', color: '#888',    bg: '#F5F5F5', label: 'عادي',     pain: 5 },
  { icon: 'happy-outline',         color: '#1565C0', bg: '#EEF3FA', label: 'جيد',      pain: 3 },
  { icon: 'happy',                 color: '#2E7D32', bg: '#E8F5E9', label: 'ممتاز',    pain: 1 },
]

export default function LogSessionScreen() {
  const navigation = useNavigation()
  const route      = useRoute()
  const { planExerciseId, exerciseTitle } = route.params || {}

  const [completionStatus, setCompletionStatus] = useState('completed')
  const [moodIndex, setMoodIndex]               = useState(3)
  const [notes, setNotes]                       = useState('')
  const [mediaUri, setMediaUri]                 = useState(null)
  const [mediaType, setMediaType]               = useState(null)
  const [uploadingMedia, setUploadingMedia]     = useState(false)
  const [saving, setSaving]                     = useState(false)

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('إذن مطلوب', 'نحتاج إذن الوصول إلى الصور والمقاطع.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
    })
    if (!result.canceled && result.assets?.[0]) {
      setMediaUri(result.assets[0].uri)
      setMediaType(result.assets[0].type)
    }
  }

  const uploadMedia = async () => {
    if (!mediaUri) return null
    setUploadingMedia(true)
    try {
      const token = await AsyncStorage.getItem('token')
      const ext   = mediaUri.split('.').pop()
      const mime  = mediaType === 'video' ? `video/${ext === 'mov' ? 'quicktime' : ext}` : `image/${ext}`

      const form = new FormData()
      form.append('file', { uri: mediaUri, name: `media.${ext}`, type: mime })
      form.append('folder', 'feedback')

      const res  = await fetch(`${API_BASE}/api/v1/upload/media`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const json = await res.json()
      return res.ok ? json.url : null
    } catch {
      return null
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleSave = async () => {
    if (!planExerciseId) {
      Alert.alert('خطأ', 'معرّف التمرين مفقود.')
      return
    }
    setSaving(true)
    try {
      const mediaUrl = await uploadMedia()
      const today    = todayString()
      const body = {
        plan_exercise_id:  planExerciseId,
        feedback_date:     today,
        completion_status: completionStatus,
        pain_level:        MOODS[moodIndex].pain,
        parent_notes:      notes.trim() || null,
        parent_media_url:  mediaUrl,
      }

      const res  = await apiPost('/feedback/', body)
      const json = await res.json()

      if (!res.ok) {
        Alert.alert('خطأ', json.error || 'تعذر حفظ الجلسة')
        return
      }

      await saveSessionLocally({
        plan_exercise_id:  planExerciseId,
        exercise_title:    exerciseTitle || 'التمرين',
        date:              today,
        completion_status: completionStatus,
        pain_level:        MOODS[moodIndex].pain,
        notes:             notes.trim(),
      })

      Alert.alert('تم حفظ الجلسة!', 'أحسنت! تم تسجيل جلسة اليوم.', [
        { text: 'حسناً', onPress: () => navigation.goBack() },
      ])
    } catch {
      Alert.alert('خطأ', 'تعذر الاتصال بالخادم')
    } finally {
      setSaving(false)
    }
  }

  const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const activeMood = MOODS[moodIndex]

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تسجيل الجلسة</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Exercise Info */}
          <View style={styles.exerciseInfoCard}>
            <View style={styles.exerciseTag}>
              <Text style={styles.exerciseTagText}>علاج النطق</Text>
            </View>
            <Text style={styles.exerciseTitle}>{exerciseTitle || 'التمرين'}</Text>
            <View style={styles.exerciseTime}>
              <Ionicons name="calendar-outline" size={13} color="#888" />
              <Text style={styles.exerciseTimeText}>اليوم، {timeStr}</Text>
            </View>
          </View>

          {/* Completion Status */}
          <Text style={styles.sectionLabel}>حالة الإنجاز</Text>
          <View style={styles.completionOptions}>
            {COMPLETION_OPTIONS.map(opt => {
              const isActive = completionStatus === opt.key
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.completionOption, isActive && { backgroundColor: opt.bg, borderColor: opt.color }]}
                  onPress={() => setCompletionStatus(opt.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={opt.icon} size={28} color={isActive ? opt.color : '#ccc'} />
                  <Text style={[styles.completionLabel, isActive && { color: opt.color }]}>{opt.label}</Text>
                  {isActive && (
                    <View style={[styles.checkMark, { backgroundColor: opt.color }]}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Child's Mood */}
          <Text style={styles.sectionLabel}>مزاج الطفل</Text>
          <View style={styles.moodRow}>
            {MOODS.map((mood, i) => {
              const isActive = i === moodIndex
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setMoodIndex(i)}
                  style={[styles.moodBtn, isActive && { backgroundColor: mood.bg, borderColor: mood.color }]}
                  activeOpacity={0.8}
                >
                  <Ionicons name={mood.icon} size={28} color={isActive ? mood.color : '#ccc'} />
                  {isActive && (
                    <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Parent Notes */}
          <Text style={styles.sectionLabel}>
            ملاحظات الوالد <Text style={styles.optional}>(اختياري)</Text>
          </Text>
          <TextInput
            style={styles.notesInput}
            placeholder="كيف سارت الجلسة؟ دوّن أي تحديات أو إنجازات..."
            placeholderTextColor="#bbb"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />

          {/* Media Upload */}
          <Text style={styles.sectionLabel}>
            صور أو مقاطع <Text style={styles.optional}>(اختياري)</Text>
          </Text>

          {mediaUri ? (
            <View style={styles.previewBox}>
              {mediaType === 'video' ? (
                <View style={styles.videoPreview}>
                  <Ionicons name="videocam" size={40} color={BLUE} />
                  <Text style={styles.videoLabel}>مقطع مرئي مختار</Text>
                </View>
              ) : (
                <Image source={{ uri: mediaUri }} style={styles.imagePreview} resizeMode="cover" />
              )}
              <TouchableOpacity style={styles.removeMedia} onPress={() => { setMediaUri(null); setMediaType(null) }}>
                <Ionicons name="close-circle" size={24} color="#B71C1C" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadBox} onPress={pickMedia} activeOpacity={0.8}>
              <View style={styles.uploadIconRow}>
                <Ionicons name="camera-outline" size={28} color="#aaa" />
                <Ionicons name="videocam-outline" size={28} color="#aaa" />
              </View>
              <Text style={styles.uploadTitle}>إضافة صورة أو مقطع</Text>
              <Text style={styles.uploadSub}>اختر من المعرض</Text>
              <View style={styles.uploadBtn}>
                <Ionicons name="cloud-upload-outline" size={16} color={BLUE} />
                <Text style={styles.uploadBtnText}>اختيار وسائط</Text>
              </View>
            </TouchableOpacity>
          )}

        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, (saving || uploadingMedia) && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving || uploadingMedia}
            activeOpacity={0.85}
          >
            {saving || uploadingMedia
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Text style={styles.saveBtnText}>حفظ الجلسة</Text>
                  <Ionicons name="save-outline" size={18} color="#fff" />
                </>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  closeBtn:    { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e' },

  scroll: { padding: 20, paddingBottom: 16 },

  exerciseInfoCard: { backgroundColor: '#f8f9fb', borderRadius: 14, padding: 16, marginBottom: 24 },
  exerciseTag:      { backgroundColor: '#EEF3FA', alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
  exerciseTagText:  { fontSize: 10, color: BLUE, fontWeight: '700', letterSpacing: 0.5 },
  exerciseTitle:    { fontSize: 17, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  exerciseTime:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  exerciseTimeText: { fontSize: 12, color: '#888' },

  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },
  optional:     { fontWeight: '400', color: '#aaa' },

  completionOptions: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  completionOption:  { flex: 1, alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#e8e8e8', gap: 6, position: 'relative' },
  completionLabel:   { fontSize: 13, fontWeight: '600', color: '#aaa' },
  checkMark:         { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },

  moodRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  moodBtn:   { alignItems: 'center', justifyContent: 'center', width: 56, minHeight: 56, borderRadius: 16, borderWidth: 1.5, borderColor: 'transparent', gap: 4, paddingVertical: 8 },
  moodLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },

  notesInput: { borderWidth: 1, borderColor: '#e8e8e8', borderRadius: 12, padding: 14, fontSize: 14, color: '#333', minHeight: 100, marginBottom: 24, backgroundColor: '#fafafa' },

  uploadBox:     { borderWidth: 1, borderColor: '#e8e8e8', borderStyle: 'dashed', borderRadius: 12, padding: 24, alignItems: 'center', gap: 6, marginBottom: 8, backgroundColor: '#fafafa' },
  uploadIconRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  uploadTitle:   { fontSize: 14, fontWeight: '600', color: '#444' },
  uploadSub:     { fontSize: 12, color: '#aaa' },
  uploadBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, borderWidth: 1, borderColor: BLUE, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  uploadBtnText: { fontSize: 13, color: BLUE, fontWeight: '600' },

  previewBox:   { borderRadius: 12, overflow: 'hidden', marginBottom: 8, position: 'relative' },
  imagePreview: { width: '100%', height: 200, borderRadius: 12 },
  videoPreview: { height: 120, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center', gap: 8 },
  videoLabel:   { fontSize: 13, color: BLUE, fontWeight: '600' },
  removeMedia:  { position: 'absolute', top: 8, right: 8 },

  footer:      { padding: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' },
  saveBtn:     { backgroundColor: ORANGE, borderRadius: 12, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
