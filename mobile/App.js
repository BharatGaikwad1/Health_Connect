import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterHospitalScreen from './src/screens/RegisterHospitalScreen';
import UnderDevelopment from './src/screens/UnderDevelopment';
import PatientTabs from './src/navigation/PatientTabs';
import AdminTabs from './src/navigation/AdminTabs';
import HospitalTabs from './src/navigation/HospitalTabs';
import HospitalDashboard from './src/screens/HospitalDashboard';

import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterHospitalScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HospitalTabs" component={HospitalTabs} options={{ headerShown: false }} />
        <Stack.Screen name="AdminTabs" component={AdminTabs} options={{ headerShown: false }} />
        <Stack.Screen name="PatientTabs" component={PatientTabs} options={{ headerShown: false }} />
        <Stack.Screen name="InspectWards" component={HospitalDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="Dashboard" component={HospitalDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="HospitalDashboard" component={HospitalDashboard} options={{ headerShown: false }} />
        <Stack.Screen name="UnderDevelopment" component={UnderDevelopment} options={{ title: 'Coming Soon' }} />
      </Stack.Navigator>
    </NavigationContainer>
  </SafeAreaProvider>
  );
}
