import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const { tempCart } = useCart();
  return (
    <>
      <StatusBar style={'light'} backgroundColor={colors.statusBarColor} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: colors.tabBarBackground,
          },
          headerStyle: {
            backgroundColor: colors.headerBackground,
          },
          headerTintColor: colors.headerText,
          headerShown: false,
        }}>
        <Tabs.Screen
          name='(tab1)'
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} size={23} />,
          }}
        />
        <Tabs.Screen
          name='(tab2)'
          options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'search' : 'search-outline'} color={color} size={23} />,
          }}
        />
        {/* <Tabs.Screen
          name='(tab3)'
          options={{
            title: 'Scan',
            tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'scan' : 'scan-outline'} color={color} size={23} />,
          }}
        /> */}
        <Tabs.Screen
          name='(tab4)'
          options={{
            title: 'Cart',
            tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'cart' : 'cart-outline'} color={color} size={25} />,
            tabBarBadge: tempCart?.lineItems?.length ? tempCart.lineItems.length : undefined,
            tabBarBadgeStyle: {
              backgroundColor: 'red',
              minWidth: 18,
              height: 18,
              borderRadius: 10,
              fontSize: 10,
              fontFamily: 'NotoSansBold',
              color: 'white',
            },
          }}
        />
        <Tabs.Screen
          name='(tab5)'
          options={{
            title: 'Account',
            tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'person-outline' : 'person-outline'} color={color} size={23} />,
          }}
        />
      </Tabs>
    </>
  );
}
