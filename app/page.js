"use client"

// base imports
import { createContext, useState, useEffect, useContext } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, Grid, Autocomplete, Divider, AppBar, Toolbar, BottomNavigation, BottomNavigationAction, FormControl, InputLabel, NativeSelect } from '@mui/material';
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
// tutorial
import JoyRide, { STATUS } from 'react-joyride';

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
  // local storage
  const [localData, setLocalData] = useState({});
  const [localImage, setLocalImage] = useState('');
  const [localEquipment, setLocalEquipment] = useState([])
  const [localMessages, setLocalMessages] = useState([])
  const [localPlan, setLocalPlan] = useState('')

  // light/dark theme
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);
  const currentTheme = darkMode ? darkTheme : lightTheme;

  // bottom nav helper
  const [value, setValue] = useState(2);

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

  // tutorial
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Multi-language implementation
  const [prefLanguage, setPrefLanguage] = useState('');
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setPrefLanguage(newLanguage);
    changeLanguage(newLanguage);
  };

  return (
    // guest mode
    <GuestContext.Provider value={{ guestData, setGuestData, guestImage, setGuestImage, guestEquipment, setGuestEquipment, guestMessages, setGuestMessages, guestPlan, setGuestPlan, localData, setLocalData, localImage, setLocalImage, localEquipment, setLocalEquipment, localMessages, setLocalMessages, localPlan, setLocalPlan}}>
      {/* light/dark mode */}
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        {/* tutorial */}
        {mounted && (
        // <></>
        <JoyRide 
        continuous
        callback={() => {}}
        run={!user}
        steps={[
          {
            title: t("Welcome to trainerGPT"),
            content: <FormControl id = {"language-button"} sx={{ width: '85px' }}>
            <InputLabel variant="standard" htmlFor="uncontrolled-native">
              {t('language')}
            </InputLabel>
            <NativeSelect
              defaultValue={t('en')}
              onChange={handleLanguageChange}
              inputProps={{
                name: t('language'),
                id: 'uncontrolled-native',
              }}
              sx={{
                '& .MuiNativeSelect-select': {
                  '&:focus': {
                    backgroundColor: 'transparent',
                  },
                },
                '&::before': {
                  borderBottom: 'none',
                },
                '&::after': {
                  borderBottom: 'none',
                },
              }}
              disableUnderline
            >
              <option value="en">English</option>
              <option value="cn">中文（简体）</option>
              <option value="tc">中文（繁體）</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="jp">日本語</option>
              <option value="kr">한국어</option>
            </NativeSelect>
          </FormControl>,
            locale: { skip: <strong>{t("Skip Tour")}</strong>, next: t("Next"), back: t("Back") },
            placement: "center",
            target: "body"
          },
          {
            title: t("Language Selection"),
            content: <Typography variant="h6">{t("Select your language with the top left button.")}</Typography>,
            placement: "auto",
            target: "#language-button", // Only shows when on the page with language button
            locale: { skip: <strong>{t("Skip Tour")}</strong>, next: t("Next"), back: t("Back") },
          },
          {
            title: t("Sign In / Sign Up"),
            content: <Typography variant="h6">{t("Sign in or sign up with the top right button.")}</Typography>,
            placement: "auto",
            target: "#auth-button", // Only shows when on the page with auth button
            locale: { skip: <strong>{t("Skip Tour")}</strong>, next: t("Next"), back: t("Back") },
          },
          {
            title: t("Personal Information"),
            content: <Typography variant="h6">{t("Edit your information on this page.")}</Typography>,
            placement: "auto",
            target: "#myinfo-step",
            locale: { skip: <strong>{t("Skip Tour")}</strong>, next: t("Next"), back: t("Back") },
          },
          {
            title: t("Log Equipment"),
            content: <Typography variant="h6">{t("Log your available equipment on this page.")}</Typography>,
            placement: "auto",
            target: "#equipment-step",
            locale: { skip: <strong>{t("Skip Tour")}</strong>, next: t("Next"), back: t("Back") },
          },
          {
            title: t("Get a Workout Plan"),
            content: <Typography variant="h6">{t("Once you have filled out your information, ask trainerGPT for a custom workout plan.")}.</Typography>,
            placement: "auto",
            target: "#trainer-step",
            locale: { skip: <strong>{t("Skip Tour")}</strong>, next: t("Next"), back: t("Back") },
          },
          {
            title: t("Craft Recipes"),
            content: <Typography variant="h6">{t("*Premium only* Use this page to craft recipes from the ingredients you have available.")}</Typography>,
            placement: "auto",
            target: "#pantry-step",
            locale: { skip: <strong>{t("Skip Tour")}</strong>, next: t("Next"), back: t("Back") },
          },
          {
            title: t("View Your Plan"),
            content: <Typography variant="h6">{t("*Premium only* Use this page to view your plan on a calendar, and find out when your friends are available to workout!")}</Typography>,
            placement: "auto",
            target: "#plan-step",
            locale: { skip: <strong>{t("Skip Tour")}</strong>, next: t("Next"), back: t("Back") },
          },
          {
            title: t("Further Clarification"),
            content: <Typography variant="h6">{t("For further clarification on what each page does, click the (i) icon at the top of the page.")}</Typography>,
            placement: "auto",
            target: "#info-icon", // Assuming there's an element with this ID
            locale: { skip: <strong>{t("Skip Tour")}</strong>, next: t("Next"), back: t("Back") },
          },
        ]}
        hideCloseButton
        scrollToFirstStep
        showSkipButton
        showProgress
        styles={{
          options: {
            arrowColor: currentTheme.palette.background.paper, // Match the tooltip background
            backgroundColor: currentTheme.palette.background.paper, // Tooltip background color
            overlayColor: currentTheme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)', // Overlay color
            primaryColor: currentTheme.palette.primary.main, // Primary color for buttons
            textColor: currentTheme.palette.text.primary, // Text color in tooltips
            zIndex: 1000, // Ensure it is above other elements
          },
          buttonNext: {
            backgroundColor: currentTheme.palette.primary.main, // Background color of the "Next" button
            color: currentTheme.palette.primary.contrastText, // Text color on the "Next" button
          },
          buttonBack: {
            color: currentTheme.palette.primary.main, // Color of the "Back" button
          },
          buttonSkip: {
            color: currentTheme.palette.primary.main, // Color of the "Skip" button
          },
          tooltip: {
            borderRadius: '8px', // Rounded corners for the tooltip
            boxShadow: currentTheme.shadows[3], // Use MUI shadow for consistency
            padding: '16px', // Padding inside the tooltip
          },
          tooltipContainer: {
            textAlign: 'left', // Align text to the left for readability
          },
          tooltipTitle: {
            marginBottom: '8px', // Space below the title
            fontSize: '1.25rem', // Title font size
            fontWeight: 'bold', // Bold title
            color: currentTheme.palette.text.primary, // Title color
          },
          tooltipContent: {
            fontSize: '1rem', // Content font size
            color: currentTheme.palette.text.secondary, // Content text color
          },
          spotlight: {
            backgroundColor: darkMode 
              ? 'rgba(255, 255, 255, 0.5)' // Example for light mode (50% opacity white)
              : 'rgba(18, 18, 18, 0.5)',  // Example for dark mode (50% opacity black)
            borderRadius: '8px', // Rounded corners for spotlighted element
            boxShadow: currentTheme.shadows[2], // Add shadow to the spotlighted element
          },
          overlay: {
            backgroundColor: currentTheme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)', // Dim the background
          },
        }}
      />
      )}
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
                <BottomNavigationAction id = {'myinfo-step'} label={t("My Info")} icon={<HomeIcon />} />
                <BottomNavigationAction id = {'equipment-step'} label={t("myEquipment")} icon={<FitnessCenter />} />
                <BottomNavigationAction id = {'trainer-step'} label={t("trainerGPT")} icon={<Person />} />
                <BottomNavigationAction id = {'pantry-step'} label={t("myPantry")} icon={<LocalDiningIcon />} />
                <BottomNavigationAction id = {'plan-step'} label={t("Plan")} icon={<CalendarToday />} />
              </BottomNavigation>
            </Box>
          </Box>
        )}
      </ThemeProvider>
    </GuestContext.Provider>
  );
}
