// 'use client';

// import { ThemeProvider } from 'next-themes';
// import React from 'react';

// export function NextThemeProvider({ children }: { children: React.ReactNode }) {
//   return (
//     <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
//       {children}
//     </ThemeProvider>
//   );
// }

// src/app/layout.tsx (or _app.js for Pages Router)
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from '@/theme';
import { useTheme } from 'next-themes';

export const NextThemeProvider = ({ children }) => {
  const { theme: nextTheme } = useTheme();
  const muiTheme = nextTheme === 'dark' ? darkTheme : lightTheme;
  return (
    <>
      <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
        <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
      </NextThemesProvider>
    </>
  );
};
