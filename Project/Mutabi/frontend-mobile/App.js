import { I18nManager } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
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
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_left' }}>
        <Stack.Screen name="Login"           component={Login} />
        <Stack.Screen name="Main"            component={MainTabs} />
        <Stack.Screen name="ExerciseDetail"  component={ExerciseDetailScreen} />
        <Stack.Screen name="LogSession"      component={LogSessionScreen} />
        <Stack.Screen name="Notifications"    component={NotificationsScreen} />
        <Stack.Screen name="ForgotPassword"   component={ForgotPasswordScreen} />
        <Stack.Screen name="SetPassword"      component={SetPasswordScreen} />
        <Stack.Screen name="DoctorNotes"      component={DoctorNotesScreen} />
        <Stack.Screen name="Articles"         component={ArticlesScreen} />
        <Stack.Screen name="EditProfile"      component={EditProfileScreen} />
        <Stack.Screen name="AddChild"         component={AddChildScreen} />
        <Stack.Screen name="EditChild"        component={EditChildScreen} />
        <Stack.Screen name="ChangePassword"   component={ChangePasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
