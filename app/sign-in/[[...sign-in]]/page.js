'use client'

import { SignIn } from '@clerk/nextjs';
import { AppBar, Container, Toolbar, Typography, Button, Link, Box, IconButton } from '@mui/material';
import { createTheme, ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { light, dark } from '@clerk/themes'

// light/dark themes
const lightTheme = createTheme({
    palette: {
      mode: 'light',
      background: {
        default: '#ffffff',
        paper: '#ffffff',
        bubbles: 'lightgray',
        userBubble: '#95EC69',
        link: 'darkblue',
      },
      text: {
        primary: '#000000',
      },
    },
  });
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#121212',
        paper: '#121212',
        bubbles: '#2C2C2C',
        userBubble: '#29B560',
        link: 'lightblue',
      },
      text: {
        primary: '#ffffff',
      },
    },
  });

export default function SignUpPage() {
  // light/dark mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = prefersDarkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ padding: 2 }}
      >
        {/* <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{ padding: 3, borderRadius: 2, boxShadow: 3 }}
        >
          <Typography variant="h4" gutterBottom>
            Sign In
          </Typography> */}
          <SignIn
            appearance={{
                baseTheme: prefersDarkMode ? dark: light,
            }}
            />
        {/* </Box> */}
      </Box>
    </ThemeProvider>
  );
}
