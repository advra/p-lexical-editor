'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginView } from '@/components/ui/login/login-view';

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    setError(null);

    // check username and password from app\api\login\route.ts
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push('/toc');
    } else {
      const data = await res.json();
      setError(data.message || 'Login failed');
    }
  }

  return (
    <main className="min-h-screen border-b border-red-600 flex items-center justify-center bg-gray-100 px-4">
      <LoginView username={username} password={password} error={error} event={event} setUsername={setUsername} setPassword={setPassword} handleSubmit={handleSubmit} />
    </main>
  );
}
