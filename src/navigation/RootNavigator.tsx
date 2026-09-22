import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@/auth/AuthContext';
import { LoadingView } from '@/components/Common';
import { colors } from '@/constants/theme';
import type { RootStackParamList } from './types';
import { MainTabs } from './MainTabs';
import { navigationRef } from './navigationRef';

import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { OnboardingScreen } from '@/screens/auth/OnboardingScreen';

import { ServicesListScreen } from '@/screens/services/ServicesListScreen';
import { ServiceDetailScreen } from '@/screens/services/ServiceDetailScreen';
import { ServiceFormScreen } from '@/screens/services/ServiceFormScreen';

import { ListingDetailScreen } from '@/screens/marketplace/ListingDetailScreen';
import { ListingFormScreen } from '@/screens/marketplace/ListingFormScreen';

import { DonorsListScreen } from '@/screens/donors/DonorsListScreen';
import { DonorDetailScreen } from '@/screens/donors/DonorDetailScreen';
import { DonorFormScreen } from '@/screens/donors/DonorFormScreen';

import { DoctorsListScreen } from '@/screens/doctors/DoctorsListScreen';
import { DoctorDetailScreen } from '@/screens/doctors/DoctorDetailScreen';
import { BookAppointmentScreen } from '@/screens/doctors/BookAppointmentScreen';

import { BiodataListScreen } from '@/screens/biodata/BiodataListScreen';
import { BiodataDetailScreen } from '@/screens/biodata/BiodataDetailScreen';
import { BiodataFormScreen } from '@/screens/biodata/BiodataFormScreen';

import { ConversationScreen } from '@/screens/chat/ConversationScreen';

import { PublicProfileScreen } from '@/screens/profile/PublicProfileScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { FollowersScreen } from '@/screens/profile/FollowersScreen';
import { MyServicesScreen } from '@/screens/profile/MyServicesScreen';
import { MyListingsScreen } from '@/screens/profile/MyListingsScreen';
import { MyBiodataScreen } from '@/screens/profile/MyBiodataScreen';
import { MyAppointmentsScreen } from '@/screens/profile/MyAppointmentsScreen';
import { SavedScreen } from '@/screens/profile/SavedScreen';
import { NotificationsScreen } from '@/screens/profile/NotificationsScreen';
import { SettingsScreen } from '@/screens/profile/SettingsScreen';
import { PrivacyPolicyScreen } from '@/screens/profile/PrivacyPolicyScreen';
import { DeleteAccountScreen } from '@/screens/profile/DeleteAccountScreen';
import { ChatSettingsScreen } from '@/screens/profile/ChatSettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.text },
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.surface },
};

export function RootNavigator() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={screenOptions}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
          </>
        ) : !user?.onboardingCompleted ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

            <Stack.Screen name="ServicesList" component={ServicesListScreen} options={{ title: 'Local Services' }} />
            <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: '' }} />
            <Stack.Screen name="ServiceForm" component={ServiceFormScreen} options={{ title: 'Add a service' }} />

            <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: '' }} />
            <Stack.Screen name="ListingForm" component={ListingFormScreen} options={{ title: 'Sell a product' }} />

            <Stack.Screen name="DonorsList" component={DonorsListScreen} options={{ title: 'Blood Donors' }} />
            <Stack.Screen name="DonorDetail" component={DonorDetailScreen} options={{ title: '' }} />
            <Stack.Screen name="DonorForm" component={DonorFormScreen} options={{ title: 'Blood donor profile' }} />

            <Stack.Screen name="DoctorsList" component={DoctorsListScreen} options={{ title: 'Doctor Appointments' }} />
            <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} options={{ title: '' }} />
            <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} options={{ title: 'Book appointment' }} />

            <Stack.Screen name="BiodataList" component={BiodataListScreen} options={{ title: 'Matrimony' }} />
            <Stack.Screen name="BiodataDetail" component={BiodataDetailScreen} options={{ title: '' }} />
            <Stack.Screen name="BiodataForm" component={BiodataFormScreen} options={{ title: 'Biodata' }} />

            <Stack.Screen
              name="Conversation"
              component={ConversationScreen}
              options={({ route }) => ({ title: route.params.otherUserName })}
            />

            <Stack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ title: '' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit profile' }} />
            <Stack.Screen name="Followers" component={FollowersScreen} options={{ title: 'Connections' }} />
            <Stack.Screen name="MyServices" component={MyServicesScreen} options={{ title: 'My services' }} />
            <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ title: 'My listings' }} />
            <Stack.Screen name="MyBiodata" component={MyBiodataScreen} options={{ title: 'My biodata' }} />
            <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} options={{ title: 'My appointments' }} />
            <Stack.Screen name="Saved" component={SavedScreen} options={{ title: 'Saved' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: 'Delete account' }} />
            <Stack.Screen name="ChatSettings" component={ChatSettingsScreen} options={{ title: 'Chat settings' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
