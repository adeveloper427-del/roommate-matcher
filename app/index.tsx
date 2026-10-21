import { Redirect } from 'expo-router';
import React from 'react';
import { LoadingSpinner } from '../src/components/ui';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { session, isHydrating } = useAuth();

  if (isHydrating) {
    return <LoadingSpinner fullScreen />;
  }

  if (!session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (session.role === 'organization') {
    return <Redirect href="/(organization)/dashboard" />;
  }

  if (session.role === 'admin') {
    return <Redirect href="/(admin)/dashboard" />;
  }

  return <Redirect href="/(user)/home" />;
}
