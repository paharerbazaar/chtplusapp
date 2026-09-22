export type RootStackParamList = {
  MainTabs: undefined;

  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };

  ServicesList: { categoryId?: string } | undefined;
  ServiceDetail: { id: string };
  ServiceForm: { id?: string };

  MarketplaceList: { categoryId?: string } | undefined;
  ListingDetail: { id: string };
  ListingForm: { id?: string };

  DonorsList: undefined;
  DonorDetail: { id: string };
  DonorForm: undefined;

  DoctorsList: undefined;
  DoctorDetail: { id: string };
  BookAppointment: { doctorId: string; doctorName: string; chamberId: string; organizationName: string };

  BiodataList: undefined;
  BiodataDetail: { id: string };
  BiodataForm: { id?: string };

  Conversation: { conversationId: string; otherUserId: string; otherUserName: string; otherUserPhotoUrl?: string | null };

  PublicProfile: { id: string };
  EditProfile: undefined;
  Followers: { userId: string; initialTab?: 'followers' | 'following' };
  MyServices: undefined;
  MyListings: undefined;
  MyBiodata: undefined;
  MyAppointments: undefined;
  Saved: undefined;
  Notifications: undefined;
  Settings: undefined;
  PrivacyPolicy: undefined;
  DeleteAccount: undefined;
  ChatSettings: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
