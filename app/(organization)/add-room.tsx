import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Button, Input, LoadingSpinner, MultiChoiceChips, SingleChoiceGroup } from '../../src/components/ui';
import { roomAmenityOptions } from '../../src/constants/amenityOptions';
import { roomTypeOptions } from '../../src/constants/profileOptions';
import { colors, radius, spacing, typography } from '../../src/constants/theme';
import { getMyOrganization } from '../../src/services/organizationService';
import { createRoom, getPropertiesForOrganization } from '../../src/services/roomService';
import { pickAndUploadImage } from '../../src/services/storageService';
import { Organization, Property, RoomType } from '../../src/types';

export default function AddRoomScreen() {
  const router = useRouter();
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const [org, setOrg] = useState<Organization | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>(propertyId);
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState<RoomType | undefined>();
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [availableSpaces, setAvailableSpaces] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const handlePickPhoto = async () => {
    if (!org) return;
    setUploading(true);
    try {
      const url = await pickAndUploadImage('property-images', `${org.id}/rooms/${Date.now()}.jpg`);
      if (url) setImageUrl(url);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const myOrg = await getMyOrganization();
      setOrg(myOrg ?? null);
      const orgProperties = myOrg ? await getPropertiesForOrganization(myOrg.id) : [];
      setProperties(orgProperties);
      if (!selectedPropertyId && orgProperties.length > 0) setSelectedPropertyId(orgProperties[0].id);
      setLoading(false);
    })();
  }, []);

  const canSubmit =
    !!selectedPropertyId && name.trim().length > 0 && !!roomType && !!price && !!capacity && !!availableSpaces;

  const handleSubmit = async () => {
    if (!selectedPropertyId || !roomType) return;
    setSaving(true);
    await createRoom({
      propertyId: selectedPropertyId,
      name: name.trim(),
      roomType,
      pricePerMonth: Number(price),
      currency: 'KSh',
      capacity: Number(capacity),
      availableSpaces: Number(availableSpaces),
      amenities,
      images: imageUrl ? [imageUrl] : [],
      status: Number(availableSpaces) > 0 ? 'available' : 'full',
    });
    setSaving(false);
    router.back();
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading properties..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Add Room" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {properties.length > 0 && (
          <>
            <Text style={styles.fieldLabel}>Property</Text>
            <SingleChoiceGroup
              options={properties.map((p) => ({ value: p.id, label: p.name }))}
              value={selectedPropertyId}
              onChange={setSelectedPropertyId}
            />
          </>
        )}

        <Input label="Room Name / Number" placeholder="Room 105" value={name} onChangeText={setName} />

        <Text style={styles.fieldLabel}>Room Type</Text>
        <SingleChoiceGroup options={roomTypeOptions} value={roomType} onChange={setRoomType} />

        <View style={styles.row}>
          <Input
            label="Price per Month (KSh)"
            placeholder="8500"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            containerStyle={styles.rowInput}
          />
          <Input
            label="Capacity"
            placeholder="4"
            keyboardType="numeric"
            value={capacity}
            onChangeText={setCapacity}
            containerStyle={styles.rowInput}
          />
        </View>
        <Input
          label="Available Spaces"
          placeholder="2"
          keyboardType="numeric"
          value={availableSpaces}
          onChangeText={setAvailableSpaces}
        />

        <Text style={styles.fieldLabel}>Amenities</Text>
        <MultiChoiceChips options={roomAmenityOptions} values={amenities} onChange={setAmenities} />

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

        <Button label="Add Room" onPress={handleSubmit} loading={saving} disabled={!canSubmit} style={styles.submitButton} />
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowInput: {
    flex: 1,
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
