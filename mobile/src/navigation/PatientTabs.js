import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PatientMapScreen from '../screens/PatientMapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UnderDevelopment from '../screens/UnderDevelopment';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEMES } from '../constants/theme';
import { HospitalFacilitySvg, BloodDropSvg, UserProfileSvg } from '../components/icons';

const Tab = createBottomTabNavigator();

export default function PatientTabs() {
  const theme = THEMES.patient;
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 10);
  const tabHeight = 56 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Nearby Hospitals') {
            return <HospitalFacilitySvg size={size} color={color} crossColor={focused ? '#EF4444' : color} />;
          }
          if (route.name === 'Blood Bank') {
            return <BloodDropSvg size={size} color={color} secondaryColor={focused ? '#F87171' : color} />;
          }
          if (route.name === 'Profile') {
            return <UserProfileSvg size={size} color={color} />;
          }
          return <HospitalFacilitySvg size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Nearby Hospitals" 
        component={PatientMapScreen} 
      />
      <Tab.Screen 
        name="Blood Bank" 
        component={UnderDevelopment} 
        initialParams={{ title: 'Blood Bank' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        initialParams={{ theme }}
      />
    </Tab.Navigator>
  );
}
