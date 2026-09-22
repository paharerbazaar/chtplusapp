export type PrivacyLevel = 'public' | 'followers' | 'only_me';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  area: string | null;
  photoUrl: string | null;
  onboardingCompleted: boolean;
  homeInterests: string[];
  blueBadge: boolean;
}

export interface MeResponse {
  user: User & {
    coverPhotoUrl: string | null;
    bio: string | null;
    currentCity: string | null;
    hometown: string | null;
    relationshipStatus: string | null;
    currentCityPrivacy: PrivacyLevel;
    hometownPrivacy: PrivacyLevel;
    relationshipStatusPrivacy: PrivacyLevel;
    createdAt: string;
    coinBalance: number;
  };
  donor: Donor | null;
  work: WorkItem[];
  education: EducationItem[];
  stats: {
    servicesCount: number;
    donorProfileExists: boolean;
    biodataCount: number;
    marketplaceCount: number;
    reviewsCount: number;
    savedCount: number;
  };
}

export interface WorkItem {
  id: number;
  company: string;
  position: string | null;
  location: string | null;
  isCurrent: boolean;
  startDate: string | null;
  endDate: string | null;
}

export interface EducationItem {
  id: number;
  institution: string;
  level: 'school' | 'college' | 'university';
  fieldOfStudy: string | null;
  passingYear: string | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  parentId?: string | null;
}

export interface ServiceItem {
  id: string;
  categoryId?: string;
  categoryName: string;
  categoryIcon: string;
  providerName: string;
  description: string;
  descriptionText: string;
  area: string;
  district?: string | null;
  phone: string;
  rating: number;
  ratingCount: number;
  paid: boolean;
  photos: string[];
  createdAt?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface MarketplaceListing {
  id: string;
  categoryId?: string;
  categoryName: string;
  categoryIcon: string;
  title: string;
  description?: string;
  price: number;
  condition: string;
  area: string;
  district?: string | null;
  sellerName?: string;
  sellerPhone: string;
  paid: boolean;
  negotiable?: boolean;
  photos: string[];
  adNumber?: string;
  createdAt?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface Donor {
  id: string;
  userId?: string | null;
  name: string;
  bloodGroup: string;
  phone: string;
  area: string;
  district?: string | null;
  lastDonationDate: string | null;
  rating: number;
  ratingCount: number;
  photoUrl: string | null;
  likeCount: number;
  eligible: boolean;
  likedByMe?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string | null;
  photoUrl: string | null;
  phone?: string | null;
  likeCount: number;
  likedByMe?: boolean;
}

export interface Chamber {
  id: string;
  organizationId: string;
  organizationName: string;
  type: string;
  district: string | null;
  area: string | null;
  address?: string | null;
  organizationPhone?: string | null;
  consultationFee: number | null;
  serialFee: number | null;
  notes: string | null;
  nextAvailable: AvailableDate | null;
}

export interface DoctorDetail extends Doctor {
  services: { id: string; name: string }[];
  chambers: Chamber[];
}

export interface AvailableDate {
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  remainingCapacity: number;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  district?: string | null;
  area?: string | null;
  address?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
}

export interface Serial {
  id: string;
  chamberId: string;
  doctorId: string;
  organizationId: string;
  doctorName?: string;
  organizationName?: string;
  patientName: string;
  patientPhone: string;
  patientAge: number | null;
  patientGender: 'male' | 'female' | 'other' | null;
  appointmentDate: string;
  serialNumber: number | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  note: string | null;
  createdAt: string;
}

export interface BiodataTeaser {
  id: string;
  biodataNo: string;
  gender: string;
  maritalStatus: string;
  age: number;
  height: string;
  profession: string;
  area: string;
  permanentDistrict?: string;
  photos?: string[];
  locked?: boolean;
}

export interface BiodataDetail extends BiodataTeaser {
  locked: boolean;
  loginRequired?: boolean;
  walletAvailable?: boolean;
  coinBalance?: number;
  packages?: BiodataPackage[];
  [key: string]: unknown;
}

export interface BiodataPackage {
  id: string;
  name: string;
  biodataCount: number;
  coinCost: number;
}

export interface CoinPackage {
  id: string;
  takaAmount: number;
  coinAmount: number;
}

export interface CoinPurchaseRequest {
  id: number;
  packageId: string;
  method: 'bkash' | 'nagad';
  transactionId: string;
  phone: string;
  coinAmount: number;
  takaAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface ChatConversation {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPhotoUrl: string | null;
  otherUserBlueBadge: boolean;
  lastMessageAt: string | null;
  lastMessageBody: string | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: number;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  link: string | null;
  createdAt: string;
  readAt: string | null;
  read: boolean;
}

export interface Review {
  id: number;
  targetType: 'service' | 'donor' | 'doctor';
  targetId: string;
  reviewerName: string;
  reviewerUserId?: string | null;
  reviewerBlueBadge?: boolean;
  rating: number;
  comment: string;
  createdAt?: string;
  date?: string;
  loveCount: number;
  lovedByMe?: boolean;
  replyCount: number;
}

export interface ReviewReply {
  id: number;
  userId: string;
  userName: string;
  userPhotoUrl?: string | null;
  userBlueBadge?: boolean;
  replyText: string;
  createdAt?: string;
  date?: string;
}

export interface PublicProfile {
  id: string;
  name: string;
  photoUrl: string | null;
  coverPhotoUrl: string | null;
  area: string | null;
  bio: string | null;
  chatEnabled: boolean;
  blueBadge: boolean;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  work: WorkItem[];
  education: EducationItem[];
  services: ServiceItem[];
  listings: MarketplaceListing[];
  donor: Donor | null;
}

export interface Banner {
  id: string;
  title: string;
  url?: string | null;
  imageUrl: string | null;
}

export interface District {
  id: string | number;
  name: string;
  bnName: string;
  divisionName?: string;
  divisionBnName?: string;
}
