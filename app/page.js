"use client"

// base imports
import { createContext, useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, Grid, Autocomplete, Divider, AppBar, Toolbar, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { firestore, auth, provider, signInWithPopup, signOut } from './firebase';
import { collection, getDocs, query, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
// light/dark theme
import { createTheme, ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
// import icons
import { FitnessCenter, Person, CalendarToday, Group } from '@mui/icons-material';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import HomeIcon from '@mui/icons-material/Home';
// import pages
import MyInfoPage from './pages/MyInfoPage';
import EquipmentPage from './pages/EquipmentPage';
import TrainerGPTPage from './pages/TrainerGPTPage';
import PlanPage from './pages/PlanPage';
import FriendsPage from './pages/FriendsPage';
import NutritionPage from './pages/NutritionPage';
// use translation
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
// demo slides
import DemoSlides from './pages/DemoSlides';
// clerk
import { useUser, redirectToSignIn } from "@clerk/nextjs";
// stripe
import getStripe from "@/utils/get-stripe"; // Ensure you use this if necessary, or remove the import
// router
import { useRouter, useSearchParams } from 'next/navigation';

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

// guest mode
export const GuestContext = createContext();

export default function Home() {
  // router
  const router = useRouter();
  const searchParams = useSearchParams();
  // demo slides
  const [showDemoSlides, setShowDemoSlides] = useState(false);
  // use translation
  const { t } = useTranslation();
  // user
  const { user, isLoaded } = useUser(); // Clerk hook to get the current user
  // guest mode
  const [guestData, setGuestData] = useState({});
  const [guestImage, setGuestImage] = useState('');
  const [guestEquipment, setGuestEquipment] = useState([])
  const [guestMessages, setGuestMessages] = useState([])
  const [guestPlan, setGuestPlan] = useState('')
  // guest mode hooks
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

  // light/dark theme
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);
  const currentTheme = darkMode ? darkTheme : lightTheme;

  // bottom nav helper
  const [value, setValue] = useState(0);

  // premium mode
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  // handle payment, check if user has premium
  useEffect(() => {
    if (isLoaded && user) {
      const fetchPremiumMode = async () => {
        const userDocRef = doc(firestore, 'users', user.id);
        const userDoc = await getDoc(userDocRef);
        setHasPremiumAccess(userDoc.exists() && userDoc.data().premium === true);
      };
      fetchPremiumMode();

      const checkSession = async () => {
        const session_id = searchParams.get('session_id');
        if (session_id) {
          try {
            const response = await fetch(`/api/checkout_sessions?session_id=${session_id}`);
            const session = await response.json();
            if (session && session.payment_status === 'paid') {
              await setPremiumMode();
              setHasPremiumAccess(true);
            }
          } catch (error) {
            console.error("Error checking session:", error);
          }
        }
      };
      checkSession();
    }
    else{
      setHasPremiumAccess(false)
    }
  }, [isLoaded, user, searchParams]);

  // handle user purchase
  const handleSubmit = async () => {
    if (!user) {
      await saveGuestDataToFirebase();
      router.push('/sign-in');
      return;
    }
    try {
      const checkoutSession = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000'
        },
      });
  
      const checkoutSessionJson = await checkoutSession.json();
  
      if (checkoutSessionJson.statusCode === 500) {
        console.error(checkoutSessionJson.message);
        return;
      }
  
      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSessionJson.id,
      });
  
      if (error) {
        console.warn(error.message);
        return;
      }
    } catch (error) {
      console.error('Error during the payment process:', error);
    }
  };

  // set premium mode in firebase after purchase
  const setPremiumMode = async () => {
    if (user) {
      try {
        const userDocRef = doc(firestore, 'users', user.id);
        await setDoc(userDocRef, { premium: true }, { merge: true });
      } catch (error) {
      }
    } else {
      console.warn('No user found, unable to update premium status');
    }
  };

  const saveGuestDataToFirebase = async () => {
    const guestDocRef = doc(firestore, 'users', 'guest');
    // Save guest user data and profile picture
    await setDoc(guestDocRef, { userData: guestData }, { merge: true });
    await setDoc(guestDocRef, { profilePic: guestImage }, { merge: true });
  
    try {
      // Save guest equipment data
      const equipmentCollectionRef = collection(guestDocRef, 'equipment');
      for (const item of guestEquipment) {
        const equipmentDocRef = doc(equipmentCollectionRef, item.name);
        await setDoc(equipmentDocRef, {
          count: item.count || 0,
          image: item.image || null,
        });
      }
  
      // Save guest chat data
      const chatCollectionRef = collection(guestDocRef, 'chat');
      const chatDocRef = doc(chatCollectionRef, 'en'); // Assuming 'en' is the language
      await setDoc(chatDocRef, {
        messages: guestMessages || [],
        timestamp: new Date().toISOString(),
      });
  
      
  
      console.log('Guest data saved to Firebase.');
    } catch (error) {
      console.error("Error saving guest data to Firebase:", error);
    }
  };
  
  // pages
  const pages = [
    <MyInfoPage key="myInfo" />,
    <EquipmentPage key="equipment" />,
    <TrainerGPTPage key="trainerGPT" />,
    // <NutritionPage key = "nutrition" />,
    hasPremiumAccess ? <NutritionPage key="nutrition" /> : <PaywallPage key="paywall" />,
    hasPremiumAccess ? <PlanPage key="plan" /> : <PaywallPage key="paywall" />,
  ];

  // paywall page (NOT DONE)
  function PaywallPage() {
    const { t } = useTranslation();
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h5" textAlign="center">
          {t("This feature is available to premium users only.")}
          <br />
          <Button 
          variant="contained" 
          color="primary"
          onClick={handleSubmit}
          > 
            {t("Upgrade Now")}
          </Button>
        </Typography>
      </Box>
    );
  }

  // demo slides
  const handleDemoFinish = () => {
    setShowDemoSlides(false);
  };

  return (
    // guest mode
    <GuestContext.Provider value={{ guestData, setGuestData, guestImage, setGuestImage, guestEquipment, setGuestEquipment, guestMessages, setGuestMessages, guestPlan, setGuestPlan}}>
      {/* light/dark mode */}
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        {/* demo slides */}
        {showDemoSlides ? (
          <DemoSlides onFinish={handleDemoFinish} />
        ) : (
          // main box
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
              {/* get page from import */}
              <Box display="flex" justifyContent="center" alignItems="center">
                {pages[value]}
              </Box>

              {/* bottom navigation */}
              <Toolbar />
              <BottomNavigation
                showLabels
                value={value}
                onChange={(event, newValue) => {
                  setValue(newValue);
                }}
                sx={{ width: '100%', position: 'fixed', bottom: 0 }}
              >
                <BottomNavigationAction label={t("My Info")} icon={<HomeIcon />} />
                <BottomNavigationAction label={t("myEquipment")} icon={<FitnessCenter />} />
                <BottomNavigationAction label={t("trainerGPT")} icon={<Person />} />
                <BottomNavigationAction label={t("myPantry")} icon={<LocalDiningIcon />} />
                <BottomNavigationAction label={t("Plan")} icon={<CalendarToday />} />
              </BottomNavigation>
            </Box>
          </Box>
        )}
      </ThemeProvider>
    </GuestContext.Provider>
  );
}
