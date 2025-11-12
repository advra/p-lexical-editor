'use client';

import { createContext, useContext, ReactNode } from 'react';
import useSWR from 'swr';
import { Session } from '@/modules/auth/types';

type MeResponse = { session: Session | null };

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json() as Promise<MeResponse>);

type UserContextType = {
  session: Session | null;
  user: Session['user'] | null;
  isAdmin: boolean;
  loading: boolean;
  error: any;
  mutate: () => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data, error, mutate } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const session = data?.session ?? null;
  const user = session?.user ?? null;
  const isAdmin =
    user?.roles?.some((role) => role.toLowerCase() === 'admin') ?? false;
  const loading = !error && !data;

  const value = {
    session,
    user,
    isAdmin,
    loading,
    error,
    mutate,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
