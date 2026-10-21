import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Avatar, Badge, Button, Card, LoadingSpinner, Rating } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getOrganizationById, setOrganizationVerified } from '../../src/services/organizationService';
import { getPropertiesForOrganization } from '../../src/services/roomService';
import { Organization, Property } from '../../src/types';

export default function AdminOrganizationDetailsScreen() {
  const { organizationId } = useLocalSearchParams<{ organizationId: string }>();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    const [org, props] = await Promise.all([
      getOrganizationById(organizationId),
      getPropertiesForOrganization(organizationId),
    ]);
    setOrganization(org ?? null);
    setProperties(props);
    setLoading(false);
  }, [organizationId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleToggleVerified = async () => {
    if (!organization) return;
    setUpdating(true);
    const updated = await setOrganizationVerified(organization.id, !organization.verified);
    if (updated) setOrganization(updated);
    setUpdating(false);
  };

  if (loading || !organization) {
    return <LoadingSpinner fullScreen message="Loading organization..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Organization Details" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <Avatar uri={organization.logoUrl} name={organization.name} size={80} />
          <Text style={styles.name}>{organization.name}</Text>
          <Badge label={organization.verified ? 'Verified' : 'Unverified'} tone={organization.verified ? 'success' : 'warning'} />
        </View>

        <Card style={styles.section}>
          <Text style={styles.description}>{organization.description}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.meta}>{organization.location}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="mail-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.meta}>{organization.contactEmail}</Text>
          </View>
          {organization.contactPhone && (
            <View style={styles.metaRow}>
              <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.meta}>{organization.contactPhone}</Text>
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Properties ({properties.length})</Text>
          {properties.map((p) => (
            <View key={p.id} style={styles.propertyRow}>
              <Text style={styles.propertyName}>{p.name}</Text>
              <Rating value={p.rating} reviewCount={p.reviewCount} />
            </View>
          ))}
        </Card>

        <Button
          label={organization.verified ? 'Revoke Verification' : 'Verify Organization'}
          variant={organization.verified ? 'outline' : 'primary'}
          onPress={handleToggleVerified}
          loading={updating}
        />
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
    gap: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  propertyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  propertyName: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
