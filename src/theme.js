import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // Example: Blue for primary elements
    },
    secondary: {
      main: '#dc004e', // Example: Red for secondary elements
    },
    background: {
      default: '#f5f5f5', // Example: Light gray background
      paper: '#ffffff', // Example: White background for paper-like elements
    },
    text: {
      primary: '#212121', // Example: Dark text
      secondary: '#757575', // Example: Lighter gray text
    },
    // Add more color definitions as needed for other palette properties
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9', // Example: Lighter blue for primary elements in dark mode
    },
    secondary: {
      main: '#f48fb1', // Example: Lighter red for secondary elements in dark mode
    },
    background: {
      default: '#121212', // Example: Dark background
      paper: '#424242', // Example: Darker gray background for paper-like elements
    },
    text: {
      primary: '#ffffff', // Example: White text
      secondary: '#bdbdbd', // Example: Lighter gray text
    },
    // Add more color definitions as needed for other palette properties
  },
});
