'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TextInput, 
  Button, 
  Title, 
  Text, 
  Container, 
  Alert, 
  Box, 
  Divider, 
  Stack,
  Card,
  rem,
  Input,
  InputBase
} from '@mantine/core';
import { 
  IconMail, 
  IconArrowRight,
  IconDeviceFloppy
} from '@tabler/icons-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(null);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setMessage(null);

    const { error } = await signIn(email);
    
    if (error) {
      setMessage({ type: 'error', content: error.message });
    } else {
      setMessage({
        type: 'success',
        content: 'Check your email for the magic link to log in!',
      });
    }
    
    setLoading(false);
  };

  return (
    <Container size={460} my={40}>
      <Box mb="xl" ta="center">
        <Title order={2} fw={800}>
          Welcome to Undrtone
        </Title>
        <Text c="dimmed" fz="sm">
          Your personal reading tracker. Sync across devices or use locally.
        </Text>
      </Box>

      <Card withBorder shadow="md" radius="md" p={0}>
        <Box p="lg">
          <Title order={3} mb="md" ta="center">
            Sign in to sync your data
          </Title>
          
          {message && (
            <Alert
              color={message.type === 'success' ? 'green' : 'red'}
              mb="md"
              onClose={() => setMessage(null)}
              withCloseButton
            >
              {message.content}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Stack>
              <Input.Wrapper label="Email address" required>
                <Input
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftSection={<IconMail size={18} />}
                  disabled={loading}
                  radius="md"
                  size="md"
                />
              </Input.Wrapper>
              
              <Button
                type="submit"
                size="md"
                loading={loading}
                rightSection={<IconArrowRight size={18} />}
                fullWidth
                radius="md"
                variant="filled"
                color="indigo"
              >
                Send Magic Link
              </Button>
            </Stack>
          </form>
        </Box>

        <Divider my="sm" label="OR" labelPosition="center" />

        <Box p="lg" pt={0}>
          <Stack gap="sm">
            <Button
              variant="default"
              leftSection={<IconDeviceFloppy size={18} />}
              onClick={() => router.push('/')}
              fullWidth
              size="md"
              radius="md"
            >
              Continue with Local Storage
            </Button>
          </Stack>

          <Text size="xs" c="dimmed" ta="center" mt="lg">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </Box>
      </Card>

      <Box mt="lg" ta="center">
        <Text size="sm" c="dimmed">
          New to Undrtone? Just start using it - no account needed!
        </Text>
      </Box>
    </Container>
  );
}
