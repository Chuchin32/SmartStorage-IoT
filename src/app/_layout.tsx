import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Bienvenida' }} />
      <Stack.Screen name="dashboard" options={{ title: 'Panel SmartStorage' }} />
    </Stack>
  );
}