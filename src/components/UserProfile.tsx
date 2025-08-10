"use client";

import {
  Avatar,
  Menu,
  Text,
  Group,
  UnstyledButton,
  Box,
} from "@mantine/core";
import { IconLogout, IconChevronDown } from "@tabler/icons-react";
import { useAuth } from "@/contexts/AuthContext";

export function UserProfile() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const userInitial = user.email?.charAt(0).toUpperCase() || "U";

  return (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <UnstyledButton>
          <Group gap={7}>
            <Avatar
              radius="xl"
              size={32}
              color="blue"
              variant="filled"
              styles={(theme) => ({
                root: {
                  backgroundColor: theme.colors.blue[6],
                },
              })}
            >
              {userInitial}
            </Avatar>
            <Text fw={500} size="sm" style={{ lineHeight: 1 }} mr={3}>
              {user.email}
            </Text>
            <Box style={{ display: "flex" }}>
              <IconChevronDown size={16} />
            </Box>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Account</Menu.Label>
        <Menu.Item
          leftSection={<IconLogout size={14} />}
          onClick={() => signOut()}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
