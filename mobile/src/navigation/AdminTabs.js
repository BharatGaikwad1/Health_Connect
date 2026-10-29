import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminDashboard from '../screens/AdminDashboard';
import ProfileScreen from '../screens/ProfileScreen';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEMES } from '../constants/theme';
import { AdminShieldHqSvg, UserProfileSvg } from '../components/icons';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 10);
  const tabHeight = 56 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: THEMES.super_admin.primary,
        tabBarInactiveTintColor: THEMES.super_admin.textMuted,
        tabBarStyle: {
          backgroundColor: THEMES.super_admin.surface,
          borderTopColor: THEMES.super_admin.border,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'HQ Panel') {
            return <AdminShieldHqSvg size={size} color={color} badgeColor={focused ? '#2563EB' : color} />;
          }
          if (route.name === 'Profile') {
            return <UserProfileSvg size={size} color={color} />;
          }
          return <AdminShieldHqSvg size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="HQ Panel" 
        component={AdminDashboard} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        initialParams={{ theme: THEMES.super_admin }}
      />
    </Tab.Navigator>
  );
}
