import {
  CleanlinessLevel,
  CookingHabit,
  GuestPreference,
  NoiseTolerance,
  PetPreference,
  RoomType,
  SleepSchedule,
  SmokingPreference,
  SocialLifestyle,
  StudyHabit,
} from '../types';

export interface OptionItem<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export const sleepScheduleOptions: OptionItem<SleepSchedule>[] = [
  { value: 'early_bird', label: 'Early Bird', description: 'Asleep before 10pm' },
  { value: 'flexible', label: 'Flexible', description: 'Varies day to day' },
  { value: 'night_owl', label: 'Night Owl', description: 'Up past midnight' },
];

export const cleanlinessOptions: OptionItem<CleanlinessLevel>[] = [
  { value: 'very_tidy', label: 'Very Tidy', description: 'Clean daily' },
  { value: 'moderate', label: 'Moderate', description: 'Tidy most of the time' },
  { value: 'relaxed', label: 'Relaxed', description: 'Not too fussed' },
];

export const noiseToleranceOptions: OptionItem<NoiseTolerance>[] = [
  { value: 'low', label: 'Prefer Quiet' },
  { value: 'medium', label: 'Moderate Noise OK' },
  { value: 'high', label: "Don't Mind Noise" },
];

export const studyHabitOptions: OptionItem<StudyHabit>[] = [
  { value: 'quiet_focus', label: 'Need Quiet Focus' },
  { value: 'background_noise_ok', label: 'Background Noise OK' },
  { value: 'group_study', label: 'Group Study' },
];

export const smokingOptions: OptionItem<SmokingPreference>[] = [
  { value: 'non_smoker', label: 'Non-Smoker' },
  { value: 'occasional', label: 'Occasional' },
  { value: 'smoker', label: 'Smoker' },
];

export const petOptions: OptionItem<PetPreference>[] = [
  { value: 'no_pets', label: 'No Pets' },
  { value: 'okay_with_pets', label: 'Okay with Pets' },
  { value: 'has_pets', label: 'Has Pets' },
];

export const cookingOptions: OptionItem<CookingHabit>[] = [
  { value: 'rarely', label: 'Rarely Cooks' },
  { value: 'sometimes', label: 'Sometimes Cooks' },
  { value: 'daily', label: 'Cooks Daily' },
];

export const socialLifestyleOptions: OptionItem<SocialLifestyle>[] = [
  { value: 'introvert', label: 'Introvert' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'extrovert', label: 'Extrovert' },
];

export const guestOptions: OptionItem<GuestPreference>[] = [
  { value: 'rarely', label: 'Rarely' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'frequently', label: 'Frequently' },
];

export const roomTypeOptions: OptionItem<RoomType>[] = [
  { value: 'single', label: 'Single Room' },
  { value: 'shared_double', label: '2-Person Room' },
  { value: 'shared_triple', label: '3-Person Room' },
  { value: 'dormitory', label: 'Dormitory' },
];

export const personalityTraitOptions = [
  'Organized',
  'Laid-back',
  'Friendly',
  'Independent',
  'Creative',
  'Outgoing',
  'Calm',
  'Ambitious',
  'Humorous',
  'Thoughtful',
];

export const hobbyOptions = [
  'Reading',
  'Gaming',
  'Sports',
  'Music',
  'Movies',
  'Cooking',
  'Fitness',
  'Art & Design',
  'Photography',
  'Travel',
];
