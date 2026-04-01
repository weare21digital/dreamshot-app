import React from 'react';
import { Redirect } from 'expo-router';

export default function AuthIndexRedirect(): React.JSX.Element {
  return <Redirect href="/(tabs)" />;
}
