'use client';
import { User } from '@/modules/auth/types';
import useSWR from 'swr';

type MeResponse = { user: User | null };

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json() as Promise<MeResponse>);

export default function useUser() {
  const { data, error, mutate } = useSWR('/api/auth/me', fetcher);
  console.log('%%%%%%', data);
  return {
    user: data?.user ?? null,
    loading: !error && !data,
    error,
    mutate,
  };
}
