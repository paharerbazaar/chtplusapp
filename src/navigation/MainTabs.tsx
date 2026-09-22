import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { MarketplaceListScreen } from '@/screens/marketplace/MarketplaceListScreen';
import { ConversationsListScreen } from '@/screens/chat/ConversationsListScreen';
import { WalletScreen } from '@/screens/wallet/WalletScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { useChatUnreadCount } from '@/hooks/useChatUnreadCount';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, { filled: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap }> = {
  Home: { filled: 'home', outline: 'home-outline' },
  Marketplace: { filled: 'storefront', outline: 'storefront-outline' },
  Chat: { filled: 'chatbubble-ellipses', outline: 'chatbubble-ellipses-outline' },
  Wallet: { filled: 'wallet', outline: 'wallet-outline' },
  Profile: { filled: 'person-circle', outline: 'person-circle-outline' },
};

export function MainTabs() {
  const unread = useChatUnreadCount();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? ICONS[route.name].filled : ICONS[route.name].outline} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Marketplace" component={MarketplaceListScreen} />
      <Tab.Screen
        name="Chat"
        component={ConversationsListScreen}
        options={{ tabBarBadge: unread > 0 ? unread : undefined }}
      />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
