"use client";

import { Inter } from "next/font/google";
import {
  MantineProvider,
  ColorSchemeScript,
  createTheme,
  Button,
  Box,
  Group,
  Text,
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme
} from "@mantine/core";
import { IconLogin, IconLogout, IconSun, IconMoon, IconRefresh } from "@tabler/icons-react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { errorMonitor } from "@/utils/errorMonitoring";

// Import Mantine CSS
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Create theme with custom colors
const theme = createTheme({
  primaryColor: "indigo",
  defaultRadius: "md",
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
});

function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  return (
    <ActionIcon
      onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
      variant="subtle"
      size="lg"
      aria-label="Toggle color scheme"
    >
      {computedColorScheme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
    </ActionIcon>
  );
}

function Footer() {
  const { user } = useAuth();
  
  return (
    <Box 
      component="footer" 
      py="md" 
      px="xl"
      style={{ 
        borderTop: "1px solid var(--mantine-color-gray-3)",
        marginTop: "auto"
      }}
    >
      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          © 2025 Undrtone · undrt.one
        </Text>
        {!user && (
          <Text size="xs" c="dimmed">
            Sign in to sync your progress across devices
          </Text>
        )}
      </Group>
    </Box>
  );
}

function SyncButton() {
  const { performSync, syncing, user } = useAuth();
  
  // Debug: Log auth values in header with more detail
  console.log('SyncButton render:', {
    user: user ? `User: ${user.email}` : 'No user',
    syncing,
    hasPerformSync: !!performSync,
    performSyncType: typeof performSync,
    timestamp: new Date().toISOString()
  });
  
  // Log when button is hidden due to no user
  if (!user) {
    console.log('SyncButton hidden: No user logged in');
    return null;
  }
  
  // Log when button is visible
  console.log('SyncButton visible: User logged in, rendering button');
  
  return (
    <Button
      variant="subtle"
      size="sm"
      onClick={() => {
        console.log('Sync button clicked, calling performSync');
        performSync();
      }}
      loading={syncing}
      leftSection={<IconRefresh size={16} />}
    >
      {syncing ? 'Syncing...' : 'Sync'}
    </Button>
  );
}

function LoginButton() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (user) {
    return (
      <Button
        variant="subtle"
        size="sm"
        onClick={async () => {
          await signOut();
          router.push("/");
        }}
        rightSection={<IconLogout size={16} />}
      >
        {user.email?.split("@")[0]}
      </Button>
    );
  }

  return (
    <Button
      component={Link}
      href="/login"
      variant="light"
      size="sm"
      rightSection={<IconLogin size={16} />}
    >
      Sign In
    </Button>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Start error monitoring when the app loads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      errorMonitor.start();
      console.log('📊 Error monitoring initialized. Use window.getErrorSummary() in console to view errors.');
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.className}>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <AuthProvider>
            <Notifications position="top-right" />
            <Box style={{ 
              display: "flex", 
              flexDirection: "column", 
              minHeight: "100vh" 
            }}>
              {/* Top bar with login and theme toggle */}
              <Group justify="space-between" p="md" style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000 }}>
                <Box />
                <Group gap="sm">
                  <ColorSchemeToggle />
                  <SyncButton />
                  <LoginButton />
                </Group>
              </Group>
              
              {/* Main content */}
              <Box style={{ flex: 1, paddingTop: "60px", paddingBottom: "20px" }} p="md">
                {children}
              </Box>
              
              {/* Footer */}
              <Footer />
            </Box>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
