import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Button, Input, MultiChoiceChips } from '../../src/components/ui';
import { propertyAmenityOptions } from '../../src/constants/amenityOptions';
import { colors, radius, spacing, typography } from '../../src/constants/theme';
import { getMyOrganization } from '../../src/services/organizationService';
import { createProperty } from '../../src/services/roomService';
import { pickAndUploadImage } from '../../src/services/storageService';
import { Organization } from '../../src/types';

export default function AddPropertyScreen() {
  const router = useRouter();
  const [org, setOrg] = useState<Organization | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => setOrg((await getMyOrganization()) ?? null))();
  }, []);

  const canSubmit = name.trim().length > 0 && location.trim().length > 0 && description.trim().length > 0;

  const handlePickPhoto = async () => {
    if (!org) return;
    setUploading(true);
    try {
      const url = await pickAndUploadImage('property-images', `${org.id}/properties/${Date.now()}.jpg`);
      if (url) setImageUrl(url);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    if (!org) {
      setSaving(false);
      return;
    }
    await createProperty({
      organizationId: org.id,
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      images: imageUrl ? [imageUrl] : [],
      amenities,
    });
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Add Property" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Input label="Property Name" placeholder="University View Hostel" value={name} onChangeText={setName} />
        <Input
          label="Description"
          placeholder="Describe the property, its atmosphere, and who it suits"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Input label="Location" placeholder="Nairobi, near UoN main campus" value={location} onChangeText={setLocation} />
        <Input
          label="Contact Email"
          placeholder="info@yourorg.co.ke"
          value={contactEmail}
          onChangeText={setContactEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input label="Contact Phone" placeholder="+254 700 000 000" value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" />

        <Text style={styles.fieldLabel}>Amenities</Text>
        <MultiChoiceChips options={propertyAmenityOptions} values={amenities} onChange={setAmenities} />

        <Text style={styles.fieldLabel}>Photo</Text>
        {imageUrl ? (
          <Pressable onPress={handlePickPhoto}>
            <Image source={{ uri: imageUrl }} style={styles.photoPreview} />
            <View style={styles.changePhotoBadge}>
              <Ionicons name="camera" size={14} color={colors.textInverse} />
              <Text style={styles.changePhotoText}>Change photo</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable style={styles.photoPlaceholder} onPress={handlePickPhoto} disabled={uploading || !org}>
            <Ionicons name={uploading ? 'cloud-upload-outline' : 'camera-outline'} size={22} color={colors.textMuted} />
            <Text style={styles.photoPlaceholderText}>{uploading ? 'Uploading...' : 'Tap to add a photo'}</Text>
          </Pressable>
        )}

        <Button label="Add Property" onPress={handleSubmit} loading={saving} disabled={!canSubmit} style={styles.submitButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  photoPlaceholder: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  photoPlaceholderText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 160,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },
  changePhotoBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.overlay,
    borderRadius: radius.full,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  changePhotoText: {
    ...typography.small,
    color: colors.textInverse,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
