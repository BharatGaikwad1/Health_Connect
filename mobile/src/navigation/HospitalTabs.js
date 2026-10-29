import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HospitalDashboard from '../screens/HospitalDashboard';
import HospitalBloodScreen from '../screens/HospitalBloodScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEMES } from '../constants/theme';
import { BedRosterGridSvg, BloodBagSvg, UserProfileSvg } from '../components/icons';

const Tab = createBottomTabNavigator();

export default function HospitalTabs({ route }) {
  // Pass down the hospitalId to all tabs
  const { hospitalId } = route.params || {};
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 10);
  const tabHeight = 56 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: THEMES.hospital_admin.primary,
        tabBarInactiveTintColor: THEMES.hospital_admin.textMuted,
        tabBarStyle: {
          backgroundColor: THEMES.hospital_admin.surface,
          borderTopColor: THEMES.hospital_admin.border,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Manage Beds') {
            return <BedRosterGridSvg size={size} color={color} />;
          }
          if (route.name === 'Manage Blood') {
            return <BloodBagSvg size={size} color={color} fluidColor={focused ? '#EF4444' : color} />;
          }
          if (route.name === 'Profile') {
            return <UserProfileSvg size={size} color={color} />;
          }
          return <BedRosterGridSvg size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Manage Beds" 
        component={HospitalDashboard} 
        initialParams={{ hospitalId }}
      />
      <Tab.Screen 
        name="Manage Blood" 
        component={HospitalBloodScreen} 
        initialParams={{ hospitalId }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        initialParams={{ theme: THEMES.hospital_admin, hospitalId }}
      />
    </Tab.Navigator>
  );
}

