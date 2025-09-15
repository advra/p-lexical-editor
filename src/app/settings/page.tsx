'use client';

import { useState } from "react";
import { Card, CardContent, Divider, List, TextField } from "@mui/material";
import ErrorIcon from '@mui/icons-material/Error';

import Button from "@/components/common/buttons/Button";
import { Navbar } from "@/components/common/Navbar";

type SettingItem = {
  id: string;
  title: string;
  description: string;
};

function isStrongPassword(pw: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(pw);
}

const menuItems: SettingItem[] = [
  { id: "account", title: "Account & Security", description: "Choose a unique password to protect your account" },
  { id: "theme", title: "Theme", description: "Appearance and theme settings" },
];

const items: SettingItem[] = [
  { id: "password", title: "Change Password", description: "Choose a unique password to protect your account" },
];


export default function Page() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [error, setError] = useState<string | null>('Sample error here');
  const [loading, setLoading] = useState(false);

  const newStrong = isStrongPassword(newPassword);
  const match = newPassword === confirmNewPassword;
  // const canEnable = newStrong && match && oldPasswordVerified;
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
        return;
      }

      // success
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      // TODO: show success UI or toast
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-4xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <Card className="w-full max-w-lg">
              <div className="px-4 py-3">
                <h4>Settings</h4>
              </div>
              <CardContent>
                <List>
                  {menuItems.map((item, idx) => (
                    <li className="hover:underline hover:cursor-pointer">{item.title}</li>
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
              <CardContent>
                <div key={items[0].id} className="flex gap-4 items-center mb-4">
                  <div className="flex-3/4">
                    <div className="font-semibold">{items[0].title}</div>
                    <div className="text-sm text-slate-500">{items[0].description}</div>
                  </div>
                  <div className="flex-1/4">
                    <div
                      onClick={() => setShowChangePassword((s) => !s)}
                      className="font-semibold hover:cursor-pointer">
                      Change
                    </div>
                    <div className="text-sm text-slate-500">Last Changed: N/A</div>
                  </div>
                </div>

                {showChangePassword && (
                  <form onSubmit={handleSubmit}>
                    {true && (
                      <div className="w-full bg-red-200 my-2 rounded-sm">
                        <div className="p-2 text-sm text-red-500">
                          <ErrorIcon /> {error}
                        </div>
                      </div>
                    )}
                    {/* <p className="text-md">Choose a unique password which matches the password requirements: minimum 6 characters, 1 special character, 1 upper, 1 lower</p> */}
                    <TextField margin="dense" size="small" className="w-full" placeholder="Current Password"
                      value={oldPassword}
                      type="password"
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                    <TextField margin="dense" size="small" className="w-full" placeholder="New Password"
                      value={newPassword}
                      type="password"
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />

                    <div className="text-sm text-slate-500">
                      {newStrong ? (
                        <span className="text-green-600">Password requirements met!</span>
                      ) : (
                        <span className="text-red-600">Password must be at least 6 characters with 1 uppercase, 1 lowercase, 1 digit and 1 special character (!@#$%^&*()_+)</span>
                      )}
                    </div>

                    <TextField margin="dense" size="small" className="w-full" placeholder="Confirm New Password"
                      value={confirmNewPassword}
                      type="password"
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                    <div className="flex gap-2">
                      <Button
                        disabled={!canSubmit}
                        type="submit"
                        className="w-full h-8 py-5 my-2 text-white font-semibold bg-blue-700 hover:bg-blue-600">
                        {loading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={() => setShowChangePassword(false)}
                        type="submit"
                        className="w-full h-8 py-5 my-2 text-white font-semibold bg-gray-700 hover:bg-gray-600">
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

              </CardContent>
            </Card>
          </div>
        </div>
      </div >
    </>
  );
}
