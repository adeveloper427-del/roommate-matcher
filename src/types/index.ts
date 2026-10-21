export type UserRole = 'user' | 'organization' | 'admin';

export type SleepSchedule = 'early_bird' | 'flexible' | 'night_owl';
export type CleanlinessLevel = 'very_tidy' | 'moderate' | 'relaxed';
export type NoiseTolerance = 'low' | 'medium' | 'high';
export type StudyHabit = 'quiet_focus' | 'background_noise_ok' | 'group_study';
export type SmokingPreference = 'non_smoker' | 'occasional' | 'smoker';
export type PetPreference = 'no_pets' | 'okay_with_pets' | 'has_pets';
export type CookingHabit = 'rarely' | 'sometimes' | 'daily';
export type SocialLifestyle = 'introvert' | 'balanced' | 'extrovert';
export type GuestPreference = 'rarely' | 'occasionally' | 'frequently';
export type RoomType = 'single' | 'shared_double' | 'shared_triple' | 'dormitory';

export interface LifestylePreferences {
  sleepSchedule: SleepSchedule;
  cleanliness: CleanlinessLevel;
  noiseTolerance: NoiseTolerance;
  studyHabits: StudyHabit;
  smoking: SmokingPreference;
  pets: PetPreference;
  cooking: CookingHabit;
  socialLifestyle: SocialLifestyle;
  guests: GuestPreference;
  personality?: string[];
  hobbies?: string[];
  otherPreferences?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  profilePictureUrl?: string;
  age?: number;
  university?: string;
  course?: string;
  yearOfStudy?: number;
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocation?: string;
  roomTypePreference?: RoomType;
  roommatesWanted?: number;
  bio?: string;
  lifestyle: Partial<LifestylePreferences>;
  profileCompleted: boolean;
}

export interface Organization {
  id: string;
  ownerId: string;
  name: string;
  type: 'hostel' | 'university' | 'apartment_provider' | 'property_manager' | 'private';
  logoUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  location: string;
  description?: string;
  verified: boolean;
}

export interface Property {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  location: string;
  address?: string;
  images: string[];
  amenities: string[];
  rating: number;
  reviewCount: number;
  totalRooms: number;
  availableRooms: number;
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  roomType: RoomType;
  pricePerMonth: number;
  currency: string;
  capacity: number;
  availableSpaces: number;
  amenities: string[];
  images: string[];
  status: 'available' | 'almost_full' | 'full' | 'maintenance';
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  propertyId: string;
  status: BookingStatus;
  moveInDate: string;
  createdAt: string;
  notes?: string;
}

export interface CompatibilityBreakdown {
  sleepSchedule: number;
  cleanliness: number;
  studyHabits: number;
  socialLifestyle: number;
  noisePreference: number;
  budget: number;
  location: number;
}

export interface CompatibilityResult {
  userId: string;
  matchedUserId: string;
  compatibilityScore: number;
  breakdown: CompatibilityBreakdown;
  strengths: string[];
  potentialConflicts: string[];
  recommendation: string;
}

export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface Connection {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: ConnectionStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
}

export type NotificationType = 'match' | 'booking' | 'message' | 'connection' | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface Review {
  id: string;
  propertyId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
