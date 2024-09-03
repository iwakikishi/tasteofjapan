import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name='(tab1)'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name='(tab2)'
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'fast-food' : 'fast-food-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name='(tab3)'
        options={{
          title: 'Stage',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'calendar' : 'calendar-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name='(tab4)'
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'search' : 'search-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name='(tab5)'
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />,
        }}
      />
    </Tabs>
  );
}
