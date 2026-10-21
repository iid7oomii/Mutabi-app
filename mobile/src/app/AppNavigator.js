import { I18nManager } from 'react-native'
import { useEffect, useRef } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ChildProvider } from '../store/ChildContext'
import { ThemeProvider } from '../components/ui/design-system/ThemeProvider'
import * as Notifications from 'expo-notifications'
import { setupNotificationHandler, createAndroidChannel } from '../services/notifications'
import Login                  from '../features/auth/Login'
import MainTabs               from '../navigation/MainTabs'
import ExerciseDetailScreen   from '../features/exercises/ExerciseDetailScreen'
import LogSessionScreen       from '../features/exercises/LogSessionScreen'
import NotificationsScreen    from '../features/notifications/NotificationsScreen'
import ForgotPasswordScreen   from '../features/auth/ForgotPasswordScreen'
import SetPasswordScreen      from '../features/auth/SetPasswordScreen'
import DoctorNotesScreen      from '../features/therapy/DoctorNotesScreen'
import ArticlesScreen         from '../features/therapy/ArticlesScreen'
import EditProfileScreen      from '../features/auth/EditProfileScreen'
import AddChildScreen         from '../features/children/AddChildScreen'
import EditChildScreen        from '../features/children/EditChildScreen'
import ChangePasswordScreen   from '../features/auth/ChangePasswordScreen'
import GoalReminderSettingsScreen from '../features/notifications/GoalReminderSettingsScreen'

I18nManager.allowRTL(true)
I18nManager.forceRTL(true)

const Stack = createNativeStackNavigator()

export default function App() {
  const notificationListener = useRef()
  const responseListener     = useRef()

  useEffect(() => {
    setupNotificationHandler()
    createAndroidChannel()

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {})
    responseListener.current     = Notifications.addNotificationResponseReceivedListener(() => {})

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])

  return (
    <ThemeProvider>
    <ChildProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_left' }}>
        <Stack.Screen name="Login"           component={Login}                options={{ title: 'تسجيل الدخول | متابع' }} />
        <Stack.Screen name="Main"            component={MainTabs}             options={{ title: 'متابع' }} />
        <Stack.Screen name="ExerciseDetail"  component={ExerciseDetailScreen} options={{ title: 'تفاصيل التمرين | متابع' }} />
        <Stack.Screen name="LogSession"      component={LogSessionScreen}     options={{ title: 'تسجيل الجلسة | متابع' }} />
        <Stack.Screen name="Notifications"   component={NotificationsScreen}  options={{ title: 'الإشعارات | متابع' }} />
        <Stack.Screen name="ForgotPassword"  component={ForgotPasswordScreen} options={{ title: 'نسيت كلمة المرور | متابع' }} />
        <Stack.Screen name="SetPassword"     component={SetPasswordScreen}    options={{ title: 'تفعيل الحساب | متابع' }} />
        <Stack.Screen name="DoctorNotes"     component={DoctorNotesScreen}    options={{ title: 'ملاحظات الطبيب | متابع' }} />
        <Stack.Screen name="Articles"        component={ArticlesScreen}       options={{ title: 'مقالات التوعية | متابع' }} />
        <Stack.Screen name="EditProfile"     component={EditProfileScreen}    options={{ title: 'تعديل الملف الشخصي | متابع' }} />
        <Stack.Screen name="AddChild"        component={AddChildScreen}       options={{ title: 'إضافة طفل | متابع' }} />
        <Stack.Screen name="EditChild"       component={EditChildScreen}      options={{ title: 'تعديل بيانات الطفل | متابع' }} />
        <Stack.Screen name="ChangePassword"  component={ChangePasswordScreen} options={{ title: 'تغيير كلمة المرور | متابع' }} />
        <Stack.Screen name="GoalReminderSettings" component={GoalReminderSettingsScreen} options={{ title: 'تذكيرات الأهداف | متابع' }} />
      </Stack.Navigator>
    </NavigationContainer>
    </ChildProvider>
    </ThemeProvider>
  )
}
