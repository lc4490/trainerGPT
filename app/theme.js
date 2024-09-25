// themes.js
import { createTheme } from '@mui/material';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      bubbles: 'lightgray',
      userBubble: '#95EC69',
      link: 'darkblue',
      calendar: "#FAF8F6",
    },
    text: {
      primary: '#000000',
    },
  },
  typography: {
    fontFamily: '"Gilroy", "Arial", sans-serif',
    fontWeightLight: 300, // Light weight
    fontWeightBold: 800,  // ExtraBold weight
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#121212',
      bubbles: '#2C2C2C',
      userBubble: '#29B560',
      link: 'lightblue',
      calendar: "#232323",
    },
    text: {
      primary: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Gilroy", "Arial", sans-serif',
    fontWeightLight: 300, // Light weight
    fontWeightBold: 800,  // ExtraBold weight
  },
});
