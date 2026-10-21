import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Input, MultiChoiceChips, SingleChoiceGroup } from '../ui';
import {
  cleanlinessOptions,
  cookingOptions,
  guestOptions,
  hobbyOptions,
  noiseToleranceOptions,
  personalityTraitOptions,
  petOptions,
  roomTypeOptions,
  sleepScheduleOptions,
  smokingOptions,
  socialLifestyleOptions,
  studyHabitOptions,
} from '../../constants/profileOptions';
import { colors, spacing, typography } from '../../constants/theme';
import { LifestylePreferences, RoomType, UserProfile } from '../../types';

export interface ProfileFormState {
  fullName: string;
  age: string;
  university: string;
  course: string;
  yearOfStudy: string;
  location: string;
  budgetMin: string;
  budgetMax: string;
  preferredLocation: string;
  roomTypePreference?: RoomType;
  roommatesWanted: string;
  bio: string;
  lifestyle: Partial<LifestylePreferences>;
}

export const emptyProfileForm: ProfileFormState = {
  fullName: '',
  age: '',
  university: '',
  course: '',
  yearOfStudy: '',
  location: '',
  budgetMin: '',
  budgetMax: '',
  preferredLocation: '',
  roommatesWanted: '',
  bio: '',
  lifestyle: {},
};

export function profileFormFromUser(user: UserProfile): ProfileFormState {
  return {
    fullName: user.fullName ?? '',
    age: user.age?.toString() ?? '',
    university: user.university ?? '',
    course: user.course ?? '',
    yearOfStudy: user.yearOfStudy?.toString() ?? '',
    location: user.location ?? '',
    budgetMin: user.budgetMin?.toString() ?? '',
    budgetMax: user.budgetMax?.toString() ?? '',
    preferredLocation: user.preferredLocation ?? '',
    roomTypePreference: user.roomTypePreference,
    roommatesWanted: user.roommatesWanted?.toString() ?? '',
    bio: user.bio ?? '',
    lifestyle: { ...user.lifestyle },
  };
}

export function profileFormToUpdates(form: ProfileFormState, profileCompleted: boolean): Partial<UserProfile> {
  return {
    fullName: form.fullName.trim() || undefined,
    age: form.age ? Number(form.age) : undefined,
    university: form.university || undefined,
    course: form.course || undefined,
    yearOfStudy: form.yearOfStudy ? Number(form.yearOfStudy) : undefined,
    location: form.location || undefined,
    budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
    budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
    preferredLocation: form.preferredLocation || undefined,
    roomTypePreference: form.roomTypePreference,
    roommatesWanted: form.roommatesWanted ? Number(form.roommatesWanted) : undefined,
    bio: form.bio || undefined,
    lifestyle: form.lifestyle,
    profileCompleted,
  };
}

type UpdateField = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => void;
type UpdateLifestyle = <K extends keyof LifestylePreferences>(key: K, value: LifestylePreferences[K]) => void;

export function BasicInfoStep({
  form,
  updateField,
  showName = false,
}: {
  form: ProfileFormState;
  updateField: UpdateField;
  showName?: boolean;
}) {
  return (
    <View style={styles.step}>
      {showName && <Input label="Full Name" placeholder="Jane Doe" value={form.fullName} onChangeText={(v) => updateField('fullName', v)} />}
      <View style={styles.row}>
        <Input
          label="Age"
          placeholder="22"
          keyboardType="numeric"
          value={form.age}
          onChangeText={(v) => updateField('age', v)}
          containerStyle={styles.rowInput}
        />
        <Input
          label="Year of Study"
          placeholder="3"
          keyboardType="numeric"
          value={form.yearOfStudy}
          onChangeText={(v) => updateField('yearOfStudy', v)}
          containerStyle={styles.rowInput}
        />
      </View>
      <Input label="University" placeholder="University of Nairobi" value={form.university} onChangeText={(v) => updateField('university', v)} />
      <Input label="Course" placeholder="Computer Science" value={form.course} onChangeText={(v) => updateField('course', v)} />
      <Input label="Current Location" placeholder="Nairobi" value={form.location} onChangeText={(v) => updateField('location', v)} />
      <Input
        label="Preferred Location"
        placeholder="Nairobi CBD"
        value={form.preferredLocation}
        onChangeText={(v) => updateField('preferredLocation', v)}
      />
      <View style={styles.row}>
        <Input
          label="Budget Min (KSh)"
          placeholder="6000"
          keyboardType="numeric"
          value={form.budgetMin}
          onChangeText={(v) => updateField('budgetMin', v)}
          containerStyle={styles.rowInput}
        />
        <Input
          label="Budget Max (KSh)"
          placeholder="9000"
          keyboardType="numeric"
          value={form.budgetMax}
          onChangeText={(v) => updateField('budgetMax', v)}
          containerStyle={styles.rowInput}
        />
      </View>

      <Text style={styles.fieldLabel}>Preferred Room Type</Text>
      <SingleChoiceGroup
        options={roomTypeOptions}
        value={form.roomTypePreference}
        onChange={(value) => updateField('roomTypePreference', value)}
      />

      <Input
        label="Number of Roommates Wanted"
        placeholder="1"
        keyboardType="numeric"
        value={form.roommatesWanted}
        onChangeText={(v) => updateField('roommatesWanted', v)}
      />
      <Input
        label="Short Bio (optional)"
        placeholder="A little about you and what you're looking for"
        value={form.bio}
        onChangeText={(v) => updateField('bio', v)}
        multiline
      />
    </View>
  );
}

export function LifestyleEssentialsStep({
  lifestyle,
  updateLifestyle,
}: {
  lifestyle: Partial<LifestylePreferences>;
  updateLifestyle: UpdateLifestyle;
}) {
  return (
    <View style={styles.step}>
      <Text style={styles.fieldLabel}>Sleep Schedule</Text>
      <SingleChoiceGroup options={sleepScheduleOptions} value={lifestyle.sleepSchedule} onChange={(v) => updateLifestyle('sleepSchedule', v)} />

      <Text style={styles.fieldLabel}>Cleanliness</Text>
      <SingleChoiceGroup options={cleanlinessOptions} value={lifestyle.cleanliness} onChange={(v) => updateLifestyle('cleanliness', v)} />

      <Text style={styles.fieldLabel}>Noise Tolerance</Text>
      <SingleChoiceGroup options={noiseToleranceOptions} value={lifestyle.noiseTolerance} onChange={(v) => updateLifestyle('noiseTolerance', v)} />

      <Text style={styles.fieldLabel}>Study Habits</Text>
      <SingleChoiceGroup options={studyHabitOptions} value={lifestyle.studyHabits} onChange={(v) => updateLifestyle('studyHabits', v)} />
    </View>
  );
}

export function LifestyleExtrasStep({
  lifestyle,
  updateLifestyle,
}: {
  lifestyle: Partial<LifestylePreferences>;
  updateLifestyle: UpdateLifestyle;
}) {
  return (
    <View style={styles.step}>
      <Text style={styles.fieldLabel}>Smoking</Text>
      <SingleChoiceGroup options={smokingOptions} value={lifestyle.smoking} onChange={(v) => updateLifestyle('smoking', v)} />

      <Text style={styles.fieldLabel}>Pets</Text>
      <SingleChoiceGroup options={petOptions} value={lifestyle.pets} onChange={(v) => updateLifestyle('pets', v)} />

      <Text style={styles.fieldLabel}>Cooking</Text>
      <SingleChoiceGroup options={cookingOptions} value={lifestyle.cooking} onChange={(v) => updateLifestyle('cooking', v)} />

      <Text style={styles.fieldLabel}>Social Lifestyle</Text>
      <SingleChoiceGroup
        options={socialLifestyleOptions}
        value={lifestyle.socialLifestyle}
        onChange={(v) => updateLifestyle('socialLifestyle', v)}
      />

      <Text style={styles.fieldLabel}>Guests</Text>
      <SingleChoiceGroup options={guestOptions} value={lifestyle.guests} onChange={(v) => updateLifestyle('guests', v)} />
    </View>
  );
}

export function PersonalityStep({
  lifestyle,
  updateLifestyle,
}: {
  lifestyle: Partial<LifestylePreferences>;
  updateLifestyle: UpdateLifestyle;
}) {
  return (
    <View style={styles.step}>
      <Text style={styles.fieldLabel}>Personality traits</Text>
      <MultiChoiceChips
        options={personalityTraitOptions}
        values={lifestyle.personality ?? []}
        onChange={(v) => updateLifestyle('personality', v)}
      />

      <Text style={styles.fieldLabel}>Hobbies</Text>
      <MultiChoiceChips options={hobbyOptions} values={lifestyle.hobbies ?? []} onChange={(v) => updateLifestyle('hobbies', v)} />

      <Input
        label="Anything else? (optional)"
        placeholder="Other roommate preferences"
        value={lifestyle.otherPreferences ?? ''}
        onChangeText={(v) => updateLifestyle('otherPreferences', v)}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  step: {
    gap: spacing.md,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowInput: {
    flex: 1,
  },
});
