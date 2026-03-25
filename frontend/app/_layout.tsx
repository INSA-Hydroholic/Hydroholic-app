import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserContext';


function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoggedIn } = useAuth();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        
        <Stack.Screen 
          name="login" 
          redirect={isLoggedIn} // Si connecté, ne pas autoriser le login
        />
        <Stack.Screen name="register" 
          redirect={isLoggedIn} />
        <Stack.Screen name="recommendations"
          redirect={isLoggedIn}  />

        <Stack.Screen 
          name="(tabs)" 
          redirect={!isLoggedIn} // Si déconnecté, ne pas autoriser les tabs
        />
       
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <RootLayoutNav />
      </UserProvider>
    </AuthProvider>
  );
}
