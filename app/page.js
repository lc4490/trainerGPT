"use client"

import { Box, Stack, Typography, Button, Modal, TextField, Grid, Autocomplete, Divider, AppBar, Toolbar, BottomNavigation, BottomNavigationAction } from '@mui/material'
import { useEffect, useState, useRef } from 'react'
import { firestore, auth, provider, signInWithPopup, signOut } from './firebase'
import { collection, getDocs, query, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

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

// translations
import { useTranslation } from 'react-i18next';
import i18n from './i18n'; // Adjust the path as necessary

// demo slides
import DemoSlides from './pages/DemoSlides';

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
  const [showDemoSlides, setShowDemoSlides] = useState(false); // State to control demo slides visibility
  // Implementing multi-languages
  const { t, i18n } = useTranslation();
  // change languages
  const getPreferredLanguage = async () => {
    if (auth.currentUser) {
      const userUID = auth.currentUser.uid;
      const userDocRef = doc(firestore, 'users', userUID);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().preferredLanguage : null;
    }
    return null;
  };
  // fetch/set languages at all tiimes
  useEffect(() => {
    const fetchAndSetLanguage = async () => {
      const preferredLanguage = await getPreferredLanguage();
      if (preferredLanguage) {
        i18n.changeLanguage(preferredLanguage);
      }
    };

    fetchAndSetLanguage();
  }, []);

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
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false); // New state for payment status

  // page nav
  const [value, setValue] = useState(0);
  const pages = [
    <MyInfoPage key="myInfo" />,
    <EquipmentPage key="equipment" />,
    <TrainerGPTPage key="trainerGPT" />,
    hasPremiumAccess ? <NutritionPage key="nutrition" /> : <PaywallPage key="paywall" />, // Check payment status
    hasPremiumAccess ? <PlanPage key="plan" /> : <PaywallPage key="paywall" />, // Check payment status
    // <FriendsPage key="friends" />
  ];
  // Fetch user payment status when component mounts
  // useEffect(() => {
  //   const fetchPaymentStatus = async () => {
  //     if (auth.currentUser) {
  //       const userUID = auth.currentUser.uid;
  //       const userDocRef = doc(firestore, 'users', userUID);
  //       const userDoc = await getDoc(userDocRef);
  //       if (userDoc.exists()) {
  //         setHasPremiumAccess(userDoc.data().hasPremiumAccess || false);
  //       }
  //     }
  //   };

  //   fetchPaymentStatus();
  // }, []);
  function PaywallPage() {
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
    setShowDemoSlides(false); // Hide demo slides and show main content
  };
  
  return (
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
        
        <Box 
        // flexGrow={1} 
        display="flex" 
        justifyContent="center" 
        alignItems="center" >
        {pages[value]}
        </Box>

        <Toolbar />

        {/* <Box backgroundColor = "red" height = "100px"></Box> */}
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
          sx={{ width: '100%', position: 'fixed', bottom: 0 }}
        >
          <BottomNavigationAction label={t("My Info")} icon = {<HomeIcon />} />
          <BottomNavigationAction label={t("myEquipment")} icon={<FitnessCenter />} />
          <BottomNavigationAction label={t("trainerGPT")} icon={<Person />} />
          <BottomNavigationAction label={t("myPantry")} icon={<LocalDiningIcon />} />
          <BottomNavigationAction label={t("Plan")} icon={<CalendarToday />} />
          {/* <BottomNavigationAction label="Friends" icon={<Group />} /> */}
        </BottomNavigation>
      </Box>
    </Box>
      )}
   </ThemeProvider>
  );
}
