'use client';
import { Session } from '@/modules/auth/types';
import useSWR from 'swr';

type MeResponse = { session: Session | null };

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json() as Promise<MeResponse>);

export default function useUser() {
  const { data, error, mutate } = useSWR('/api/auth/me', fetcher);

  const user = data?.session?.user;

  return {
    session: data?.session ?? null,
    user,
    loading: !error && !data,
    error,
    mutate,
  };
}
