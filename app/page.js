"use client"

import { Box, Stack, Typography, Button, Modal, TextField, Grid, Autocomplete, Divider, AppBar, Toolbar, BottomNavigation, BottomNavigationAction } from '@mui/material'
import { useEffect, useState, useRef } from 'react'

// theme imports
import { createTheme, ThemeProvider, useTheme, CssBaseline, useMediaQuery, IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

// icon imports
import {FitnessCenter, Person, CalendarToday, Group } from '@mui/icons-material';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import HomeIcon from '@mui/icons-material/Home';

// pages import
import MyInfoPage from './pages/MyInfoPage';
import EquipmentPage from './pages/EquipmentPage';
import TrainerGPTPage from './pages/TrainerGPTPage';
import PlanPage from './pages/PlanPage';
import FriendsPage from './pages/FriendsPage';
import NutritionPage from './pages/NutritionPage';



const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#ffffff',
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
    },
    text: {
      primary: '#ffffff',
    },
  },
});

export default function Home() {
  // toggle dark mode
  // Detect user's preferred color scheme
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);

  // Update dark mode state when the user's preference changes
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);
  const currentTheme = darkMode ? darkTheme : lightTheme;

  // declareables for user and guest mode
  const [user, setUser] = useState(null);
  const [guestMode, setGuestMode] = useState(false);

  // page nav
  const [value, setValue] = useState(0);
  const pages = [
    <MyInfoPage key="myInfo" />,
    <EquipmentPage key="equipment" />,
    <TrainerGPTPage key="trainerGPT" />,
    <NutritionPage key="nutrition" />,
    <PlanPage key="plan" />,
    // <FriendsPage key="friends" />
  ];  
  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box 
      width="100vw" 
      height="100vh"
      display="flex" 
      justifyContent="center" 
      alignItems="center"
      flexDirection="column"
      gap={2}
      bgcolor="background.default"
      fontFamily="sans-serif"
    >
      <Box width="100%" height="100%" bgcolor="background.default">
        
        <Box flexGrow={1} display="flex" justifyContent="center" alignItems="center" >
        {pages[value]}
        </Box>

    
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
          sx={{ width: '100%', position: 'fixed', bottom: 0 }}
        >
          <BottomNavigationAction label="My Info" icon = {<HomeIcon />} />
          <BottomNavigationAction label="Equipment" icon={<FitnessCenter />} />
          <BottomNavigationAction label="TrainerGPT" icon={<Person />} />
          <BottomNavigationAction label="Nutrition" icon={<LocalDiningIcon />} />
          <BottomNavigationAction label="Plan" icon={<CalendarToday />} />
          {/* <BottomNavigationAction label="Friends" icon={<Group />} /> */}
        </BottomNavigation>
      </Box>
    </Box>
   </ThemeProvider>
  );
}
