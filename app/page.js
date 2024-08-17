"use client"

import { createContext, useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, Grid, Autocomplete, Divider, AppBar, Toolbar, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { firestore, auth, provider, signInWithPopup, signOut } from './firebase';
import { collection, getDocs, query, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { createTheme, ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { FitnessCenter, Person, CalendarToday, Group } from '@mui/icons-material';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import HomeIcon from '@mui/icons-material/Home';
import MyInfoPage from './pages/MyInfoPage';
import EquipmentPage from './pages/EquipmentPage';
import TrainerGPTPage from './pages/TrainerGPTPage';
import PlanPage from './pages/PlanPage';
import FriendsPage from './pages/FriendsPage';
import NutritionPage from './pages/NutritionPage';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import DemoSlides from './pages/DemoSlides';

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

// Create the context
export const GuestContext = createContext();

export default function Home() {
  const [showDemoSlides, setShowDemoSlides] = useState(false);
  const [guestData, setGuestData] = useState({});
  const [guestImage, setGuestImage] = useState('');
  const [guestEquipment, setGuestEquipment] = useState([])
  const [guestMessages, setGuestMessages] = useState([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = sessionStorage.getItem('guestData');
      if (savedData) {
        setGuestData(JSON.parse(savedData));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('guestData', JSON.stringify(guestData));
    }
  }, [guestData]);

  useEffect(() => {
    const handleUnload = () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('guestData');
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);

  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  const currentTheme = darkMode ? darkTheme : lightTheme;

  const [user, setUser] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  const [value, setValue] = useState(0);
  const pages = [
    <MyInfoPage key="myInfo" />,
    <EquipmentPage key="equipment" />,
    <TrainerGPTPage key="trainerGPT" />,
    hasPremiumAccess ? <NutritionPage key="nutrition" /> : <PaywallPage key="paywall" />,
    hasPremiumAccess ? <PlanPage key="plan" /> : <PaywallPage key="paywall" />,
  ];

  function PaywallPage() {
    const { t } = useTranslation();
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5" textAlign="center">
          {t("This feature is available to premium users only.")}
          <br />
          <Button variant="contained" color="primary">
            {t("Upgrade Now")}
          </Button>
        </Typography>
      </Box>
    );
  }

  const handleDemoFinish = () => {
    setShowDemoSlides(false);
  };

  return (
    <GuestContext.Provider value={{ guestData, setGuestData, guestImage, setGuestImage, guestEquipment, setGuestEquipment, guestMessages, setGuestMessages}}>
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        {showDemoSlides ? (
          <DemoSlides onFinish={handleDemoFinish} />
        ) : (
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
              <Box display="flex" justifyContent="center" alignItems="center">
                {pages[value]}
              </Box>

              <Toolbar />

              <BottomNavigation
                showLabels
                value={value}
                onChange={(event, newValue) => {
                  setValue(newValue);
                }}
                sx={{ width: '100%', position: 'fixed', bottom: 0 }}
              >
                <BottomNavigationAction label="My Info" icon={<HomeIcon />} />
                <BottomNavigationAction label="My Equipment" icon={<FitnessCenter />} />
                <BottomNavigationAction label="Trainer GPT" icon={<Person />} />
                <BottomNavigationAction label="My Pantry" icon={<LocalDiningIcon />} />
                <BottomNavigationAction label="Plan" icon={<CalendarToday />} />
              </BottomNavigation>
            </Box>
          </Box>
        )}
      </ThemeProvider>
    </GuestContext.Provider>
  );
}
