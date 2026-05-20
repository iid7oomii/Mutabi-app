import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Login                 from './login'
import CreateAccountScreen   from './screens/CreateAccountScreen'
import MainTabs              from './screens/MainTabs'
import ExerciseDetailScreen  from './screens/ExerciseDetailScreen'
import LogSessionScreen      from './screens/LogSessionScreen'
import NotificationsScreen   from './screens/NotificationsScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Login"           component={Login} />
        <Stack.Screen name="CreateAccount"   component={CreateAccountScreen} />
        <Stack.Screen name="Main"            component={MainTabs} />
        <Stack.Screen name="ExerciseDetail"  component={ExerciseDetailScreen} />
        <Stack.Screen name="LogSession"      component={LogSessionScreen} />
        <Stack.Screen name="Notifications"   component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
