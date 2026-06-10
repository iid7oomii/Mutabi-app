import { I18nManager } from 'react-native'
import { useEffect, useRef } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ChildProvider } from './contexts/ChildContext'
import * as Notifications from 'expo-notifications'
import { setupNotificationHandler, createAndroidChannel } from './utils/notifications'
import Login                  from './login'
import MainTabs               from './screens/MainTabs'
import ExerciseDetailScreen   from './screens/ExerciseDetailScreen'
import LogSessionScreen       from './screens/LogSessionScreen'
import NotificationsScreen    from './screens/NotificationsScreen'
import ForgotPasswordScreen   from './screens/ForgotPasswordScreen'
import SetPasswordScreen      from './screens/SetPasswordScreen'
import DoctorNotesScreen      from './screens/DoctorNotesScreen'
import ArticlesScreen         from './screens/ArticlesScreen'
import EditProfileScreen      from './screens/EditProfileScreen'
import AddChildScreen         from './screens/AddChildScreen'
import EditChildScreen        from './screens/EditChildScreen'
import ChangePasswordScreen   from './screens/ChangePasswordScreen'

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
      </Stack.Navigator>
    </NavigationContainer>
    </ChildProvider>
  )
}
