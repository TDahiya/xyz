import { DriverProvider } from '@/contexts/DriverContext';
import { Stack } from 'expo-router';

export default function DriverLayout() {
  return (
    <DriverProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </DriverProvider>
  );
}
