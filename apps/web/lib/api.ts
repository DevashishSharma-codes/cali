import { ChatMessage } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_HTTP_URL || 'http://localhost:3001';

export async function signupUser(email: string, password: string, name: string) {
  const res = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Signup failed');
  }
  return data as { userId: string; token: string };
}

export async function signinUser(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Signin failed');
  }
  return data as { userId: string; token: string };
}

export async function createRoom(slug: string, token: string) {
  const res = await fetch(`${API_BASE_URL}/room`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ slug }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Create room failed');
  }
  return data as { roomId: number };
}

export async function getRoomBySlug(slug: string) {
  const res = await fetch(`${API_BASE_URL}/room/${slug}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Room not found');
  }
  return data.room as { id: number; slug: string; adminId: string; createdAt: string };
}

export async function getRoomChats(roomId: number | string): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/chats/${roomId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.messages || [];
  } catch (err) {
    console.error('Failed to fetch room chats:', err);
    return [];
  }
}
