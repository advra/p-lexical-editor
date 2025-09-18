'use client';

import { useState } from 'react';
import { Card, CardContent, Divider, List, TextField } from '@mui/material';
import { Toaster, toast } from 'sonner';
import cn from 'classnames';

const SETTINGS_SECONDARY_COLOR = 'bg-blue-400';

import Link from 'next/link';
import Button from '@/components/common/buttons/Button';
import { useTheme } from 'next-themes';
import { WarnMessage } from '@/components/common/notifications/WarnMessage';
import { useRouter } from 'next/navigation';

type SettingItem = {
  active?: boolean;
  id: string;
  title: string;
  description: string;
};

const menuItems: SettingItem[] = [
  {
    id: 'account',
    title: 'Account & Security',
    description: 'Choose a unique password to protect your account',
  },
  {
    active: true,
    id: 'theme',
    title: 'Theme',
    description: 'Appearance and theme settings',
  },
];

const items: SettingItem[] = [
  {
    id: 'theme',
    title: 'Change default theme',
    description: 'Select a theme to better fit your personal preferences',
  },
];

export default function Page() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <Card className="w-full max-w-lg dark:bg-gray-700">
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
                <h3>Theme & Appearance</h3>
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
                      onClick={() => setShowThemeMenu((s) => !s)}
                      className="font-light hover:cursor-pointer select-none"
                    >
                      {showThemeMenu ? 'Close' : 'Set Default'}
                    </div>
                    <span className="text-sm text-slate-500">
                      Current: {resolvedTheme}
                    </span>
                  </div>
                </div>

                {showThemeMenu && (
                  <>
                    <div className="text-sm text-slate-500">
                      Select a theme below:
                      {/* <ThemeSwitch /> */}
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <Button
                            onClick={() => setTheme('light')}
                            className="grid-cols-1 bg-blue-500 text-white hover:bg-blue-400 mx-2 px-4 py-1 w-full"
                          >
                            Light
                          </Button>
                        </div>
                        <div>
                          <Button
                            onClick={() => setTheme('dark')}
                            className="grid-cols-1 bg-black text-white hover:bg-gray-800 mx-2 px-4 py-1 w-full"
                          >
                            Dark
                          </Button>
                        </div>
                      </div>
                      <div>
                        <WarnMessage message="Themes are not fully implemented and will result in many graphical issues when toggling to dark mode." />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
