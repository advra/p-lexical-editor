'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { LoginView } from '@/components/login/views/login-view';

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // include credentials only if your server sets/uses cookies for sessions
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      // try to parse JSON (guard in case server returns non-JSON)
      let data: { message?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok) {
        // handle 401 specifically if you want a custom UX
        if (res.status === 401) {
          setError('Invalid username or password');
        } else {
          setError(data?.message ?? 'Login failed');
        }
        setLoading(false);
        return;
      }

      setPassword('');
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error', err);
      setError('Network error, please try again');
      setLoading(false);
    }
  }

  return (
    <>
      <LoginView
        username={username}
        password={password}
        error={error}
        isLoading={isLoading}
        setUsername={setUsername}
        setPassword={setPassword}
        handleSubmit={handleSubmit}
      />
    </>
  );
}
