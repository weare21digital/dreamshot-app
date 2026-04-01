import React from 'react';
import { Redirect } from 'expo-router';

export default function WelcomeRedirect(): React.JSX.Element {
  return <Redirect href="/(tabs)" />;
}
