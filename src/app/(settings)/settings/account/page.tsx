'use client';

import { useState } from 'react';
import { Card, CardContent, Divider, List, TextField } from '@mui/material';
import { toast } from 'sonner';
import cn from 'classnames';

const SETTINGS_SECONDARY_COLOR = 'bg-blue-400';

import Button from '@/components/common/buttons/Button';
import Link from 'next/link';
import { ErrorMessage } from '@/components/common/notifications/ErrorMessage';
import { useRouter } from 'next/navigation';

type SettingItem = {
  active?: boolean;
  id: string;
  title: string;
  description: string;
};

function isStrongPassword(pw: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(pw);
}

const menuItems: SettingItem[] = [
  {
    active: true,
    id: 'account',
    title: 'Account & Security',
    description: 'Choose a unique password to protect your account',
  },
  { id: 'theme', title: 'Theme', description: 'Appearance and theme settings' },
];

const items: SettingItem[] = [
  {
    id: 'password',
    title: 'Change Password',
    description: 'Choose a unique password to protect your account',
  },
];

export default function Page() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const newStrong = isStrongPassword(newPassword);
  const match = newPassword === confirmNewPassword;
  const canSubmit = newStrong && match && oldPassword.length > 0 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;

    setLoading(true);
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message ?? 'Failed to change password');
        toast.error('Error occured changing password');
        return;
      }

      // success
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      toast.success('Successfully changed password!');
    } catch (err) {
      console.error(err);
      setError('Network error');
      toast.error('Error occured changing password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-4xl p-4">
        <div className="mb-4">
          <span
            className="hover:underline hover:cursor-pointer"
            onClick={() => {
              router.back();
            }}
          >
            Back to EPROC
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
          <div className="col-span-1">
            <Card className="w-full max-w-lg">
              <div className="px-4 py-3">
                <h4>Settings</h4>
              </div>
              <CardContent>
                <List>
                  {menuItems.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 list-none hover:underline hover:cursor-pointer mb-2"
                    >
                      {item.active && (
                        <div
                          className={cn(
                            'h-6 w-[3px]',
                            SETTINGS_SECONDARY_COLOR,
                          )}
                        />
                      )}
                      <Link href={'/settings/' + item.id}>{item.title}</Link>
                    </li>
                  ))}
                </List>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 md:col-span-2">
            <Card className="w-full max-w-3xl">
              <div className="px-4 py-3">
                <h3>Account & Security</h3>
              </div>
              <div
                className={cn(
                  'h-[2px] mx-auto max-w-[90%]',
                  SETTINGS_SECONDARY_COLOR,
                )}
              />
              <CardContent>
                <div key={items[0].id} className="flex gap-4 items-center mb-4">
                  <div className="flex-3/4">
                    <div className="font-semibold">{items[0].title}</div>
                    <div className="text-sm text-slate-500">
                      {items[0].description}
                    </div>
                  </div>
                  <div className="flex-1/4">
                    <div
                      onClick={() => setShowChangePassword((s) => !s)}
                      className="font-light hover:cursor-pointer select-none"
                    >
                      {showChangePassword ? 'Close' : 'Change'}
                    </div>
                    <div className="text-sm text-slate-500">
                      Last Changed: N/A
                    </div>
                  </div>
                </div>

                {showChangePassword && (
                  <form onSubmit={handleSubmit}>
                    {error && <ErrorMessage errorMessage={error} />}
                    <TextField
                      margin="dense"
                      size="small"
                      className="w-full"
                      placeholder="Current Password"
                      value={oldPassword}
                      type="password"
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                    <TextField
                      margin="dense"
                      size="small"
                      className="w-full"
                      placeholder="New Password"
                      value={newPassword}
                      type="password"
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />

                    <div className="text-sm text-slate-500">
                      {newStrong ? (
                        <span className="text-green-600">
                          Password requirements met!
                        </span>
                      ) : (
                        <span className="text-red-600">
                          Password must be at least 6 characters with 1
                          uppercase, 1 lowercase, 1 digit and 1 special
                          character (!@#$%^&*()_+)
                        </span>
                      )}
                    </div>

                    <TextField
                      margin="dense"
                      size="small"
                      className="w-full"
                      placeholder="Confirm New Password"
                      value={confirmNewPassword}
                      type="password"
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />

                    <div className="text-sm text-slate-500">
                      {newPassword !== confirmNewPassword && (
                        <span className="text-red-600">
                          New passwords do not match.
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        disabled={!canSubmit}
                        type="submit"
                        className="w-full h-8 py-5 my-2 text-white font-semibold bg-blue-700 hover:bg-blue-600"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={() => setShowChangePassword(false)}
                        type="button"
                        className="w-full h-8 py-5 my-2 text-white font-semibold bg-gray-700 hover:bg-gray-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
