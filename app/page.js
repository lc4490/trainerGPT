"use client"

// base imports
import { createContext, useState, useEffect, useContext } from 'react';
import { Box, Select, MenuItem, Typography, Button, Modal, TextField, Grid, Autocomplete, Divider, AppBar, Toolbar, BottomNavigation, BottomNavigationAction, FormControl, InputLabel, NativeSelect } from '@mui/material';
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
// clerk
import { useUser } from "@clerk/nextjs";
// stripe
import getStripe from "@/utils/get-stripe"; // Ensure you use this if necessary, or remove the import
// router
import { useRouter, useSearchParams } from 'next/navigation';
// tutorial
import JoyRide, { STATUS } from 'react-joyride';

import StepForm from './pages/TrainerGPT/StepForm';
import { steps } from './pages/TrainerGPT/steps';

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
  // use translation
  const { t } = useTranslation();
  // user
  const { user, isLoaded, isSignedIn } = useUser(); // Clerk hook to get the current user
  // guest mode
  const [guestData, setGuestData] = useState({});
  const [guestImage, setGuestImage] = useState('');
  const [guestEquipment, setGuestEquipment] = useState([])
  const [guestMessages, setGuestMessages] = useState([])
  const [guestPlan, setGuestPlan] = useState('')
  const [guestEvents, setGuestEvents] = useState([])
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
  const [localEvents, setLocalEvents] = useState([])

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
  }, [isLoaded, user, searchParams, setPremiumMode]);

  // handle user purchase
  const handlePurchase = async () => {
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
    <PlanPage key="plan" />,
    hasPremiumAccess ? <NutritionPage key="nutrition" /> : <PaywallPage key="paywall" />,
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
          onClick={handlePurchase}
          > 
            {t("Upgrade Now")}
          </Button>
        </Typography>
      </Box>
    );
  }

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
  const isMobile = useMediaQuery('(max-width:600px)'); // Adjust the max-width as necessary

  // step form

  // navigate through slides/steps
  const [currentStep, setCurrentStep] = useState(0);
  // store filledo ut data
  const [formData, setFormData] = useState({});
  // if slides are finished, display summary page
  const [isSummary, setIsSummary] = useState(false);
  // is loading, display loading page
  const [loading, setLoading] = useState(true); // Loading state

  // move between steps
  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };
  // set filled out data
  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value});
  }

  // Save user form data to Firestore
  const saveUserData = async (data) => {
    if (user) {
      const userDocRef = doc(firestore, 'users', user.id);
      await setDoc(userDocRef, { userData: data }, { merge: true });
    } else {
      // Updating guest data
      setGuestData((prevState) => {
        const updatedGuestData = { ...prevState, ...data };
        console.log(updatedGuestData); // Log updated guestData here
        return updatedGuestData;
      });
    }
  };
  

  // Handle form submission and save data to Firestore
  const handleSubmit = async () => {
    
    await saveUserData(unpackData(formData));
    setFormData(unpackData(formData));
    setIsSummary(true); // Show summary page
    
  };

  // clean up formData 
  function unpackData(data) {
    const ret = {
      "Sex": data[("Tell Us About Yourself")] || t("Not available"),
      "Age": data[('How Old Are You?')] || t("Not available"),
      "Weight": data[('What is Your Weight?')] + weightUnit|| t("Not available"),
      "Height": data[('What is Your Height?')] + heightUnit|| t("Not available"),
      "Goals": data[('What is Your Goal?')] || t("Not available"),
      "Activity": data[('Physical Activity Level?')] || t("Not available"),
      "Health issues": data[('Do you have any existing health issues or injuries?')] || t("Not available"),
      "Availability": data[t('How many days a week can you commit to working out?')] || "Not available",
    };
    return ret;
  }

  // Handle enter key
  const handleKeyPressStep = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (currentStep === steps.length - 1) {
        handleSubmit();
      } else {
        nextStep();
      }
    }
  };

  // State to manage weight and unit
  const [weightUnit, setWeightUnit] = useState('kg'); // Default to kg

  const handleWeightUnitChange = (event, newUnit) => {
    if (newUnit !== null) {
      setWeightUnit(newUnit);

      // Convert the weight if a value is already entered
      if (formData['What is Your Weight?']) {
        const currentWeight = parseFloat(formData['What is Your Weight?']);
        const convertedWeight = newUnit === 'lbs'
          ? (currentWeight * 2.20462).toFixed(1) // kg to lbs
          : (currentWeight / 2.20462).toFixed(1); // lbs to kg
        setFormData({ ...formData, 'What is Your Weight?': convertedWeight});
      }
    }
  };

  // state to manage height and unit
  const [heightUnit, setHeightUnit] = useState('cm'); // Default to cm
  const handleHeightUnitChange = (event, newUnit) => {
    if (newUnit !== null) {
        setHeightUnit(newUnit);

        // Convert the height if a value is already entered
        if (formData['What is Your Height?']) {
            let convertedHeight = '';
            if (newUnit === 'ft/in') {
                // Convert cm to feet/inches
                const totalInches = parseFloat(formData['What is Your Height?']) / 2.54;
                const feet = Math.floor(totalInches / 12);
                const inches = Math.round(totalInches % 12);
                convertedHeight = `${feet}'${inches}"`;
            } else {
                // Convert feet/inches to cm
                const heightParts = formData['What is Your Height?'].match(/(\d+)'(\d+)"/);
                if (heightParts) {
                    const feet = parseInt(heightParts[1], 10);
                    const inches = parseInt(heightParts[2], 10);
                    convertedHeight = ((feet * 12 + inches) * 2.54).toFixed(1); // Convert to cm
                }
            }
            setFormData({ 
                ...formData, 
                'What is Your Height?': convertedHeight, 
                'heightUnit': newUnit 
            });
        } else {
            setFormData({ 
                ...formData, 
                'heightUnit': newUnit 
            });
        }
    }
  };

  // upon user change, get prefLanguage and also data
  useEffect(() => {

    const initializeData = async () => {
      // fix loading speed. store all acquired data from firebase into guest storage. 
      if(localData.Age && localMessages.length > 0){
        setFormData(localData)
        setIsSummary(true)
        setLoading(false)
      }
      if(isLoaded){
        if (user) {
          const userId = user.id;
          const userDocRef = doc(firestore, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() ? userDoc.data().userData : null) {
            setIsSummary(true)
            
          }
        } else {
          if (guestData && guestData.Age) {
            setIsSummary(true);
          } else {
            setIsSummary(false);
          }
        }
        setLoading(false);
      }
    };

    initializeData();
  }, [user, isLoaded, guestData, localData, localMessages.length]);

  return (
    // guest mode
    <GuestContext.Provider value={{ guestData, setGuestData, guestImage, setGuestImage, guestEquipment, setGuestEquipment, guestMessages, setGuestMessages, guestPlan, setGuestPlan, guestEvents, setGuestEvents, localData, setLocalData, localImage, setLocalImage, localEquipment, setLocalEquipment, localMessages, setLocalMessages, localPlan, setLocalPlan, localEvents, setLocalEvents}}>
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
            title: t("View Your Plan"),
            content: <Typography variant="h6">{t("*Premium only* Use this page to view your plan on a calendar, and find out when your friends are available to workout!")}</Typography>,
            placement: "auto",
            target: "#plan-step",
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
            title: t("Further Clarification"),
            content: <Typography variant="h6">{t("For further clarification on what each page does, click the (i) icon at the top of the page.")}</Typography>,
            placement: "auto",
            target: "#info-icon", // Assuming there's an element with this ID
            locale: { skip: <strong>{t("Skip Tour")}</strong>, next: t("Next"), back: t("Back"), last: t("Last")  },
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
          {isSummary ? (
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
            <Box 
            width = "100%"
            height = "100%"
            display = "flex"
            flexDirection={"row"}
            // backgroundColor="blue"
            >
              {!isMobile && (
              <Box
              width = "90px"
              height = "400px"
              backgroundColor = "red"
              >
                <BottomNavigation
                orientation="vertical"
                value={value}
                onChange={(event, newValue) => setValue(newValue)}
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <BottomNavigationAction id={'myinfo-step'} label={t("My Info")} icon={<HomeIcon />} showLabel/>
                <BottomNavigationAction id={'equipment-step'} label={t("myEquipment")} icon={<FitnessCenter />} showLabel/>
                <BottomNavigationAction id={'trainer-step'} label={t("trainerGPT")} icon={<Person />} showLabel/>
                <BottomNavigationAction id={'plan-step'} label={t("myPlanner")} icon={<CalendarToday />} showLabel/>
                <BottomNavigationAction id={'pantry-step'} label={t("myPantry")} icon={<LocalDiningIcon />} showLabel/>
              </BottomNavigation>
              </Box>
              )}
              <Box
              width = "100%"
              flex="1" // This makes sure the content takes up the remaining height
              bgcolor="background.default"
              // overflow="auto" // Allows scrolling if content is taller than the available space
              display="flex"
              justifyContent="center"
              alignItems="center"
              >
                {pages[value]}

              </Box>
            </Box>

            {/* bottom navigation */}
            {isMobile && 
            (
            <BottomNavigation
              showLabels
              value={value}
              onChange={(event, newValue) => {
                setValue(newValue);
              }}
              sx={{ width: '100%', position: 'fixed', bottom: 0 }}
            >
              <BottomNavigationAction id={'myinfo-step'} label={t("My Info")} icon={<HomeIcon />} />
              <BottomNavigationAction id={'equipment-step'} label={t("myEquipment")} icon={<FitnessCenter />} />
              <BottomNavigationAction id={'trainer-step'} label={t("trainerGPT")} icon={<Person />} />
              <BottomNavigationAction id={'plan-step'} label={t("myPlanner")} icon={<CalendarToday />} />
              <BottomNavigationAction id={'pantry-step'} label={t("myPantry")} icon={<LocalDiningIcon />} />
            </BottomNavigation>
            )}
          </Box>
        ) : (
          <>
          <Box
            height="10%"
            bgcolor="background.default"
            display="flex"
            justifyContent="space-between"
            paddingX={2.5}
            paddingY={2.5}
            alignItems="center"
            position="relative"
            >

            <FormControl 
                id="language-button" 
                sx={{ 
                width: isMobile ? '100px' : '100px',
                minWidth: '100px',
                }}
            >
                <Select
                value={prefLanguage}
                onChange={handleLanguageChange}
                disableunderline="true"
                displayEmpty
                renderValue={(selected) => {
                    if (!selected) {
                    return <span>{t('English')}</span>;
                    }
                    const selectedItem = {
                    en: 'English',
                    cn: '中文（简体）',
                    tc: '中文（繁體）',
                    es: 'Español',
                    fr: 'Français',
                    de: 'Deutsch',
                    jp: '日本語',
                    kr: '한국어'
                    }[selected];
                    return <span>{selectedItem}</span>;
                }}
                sx={{
                    '& .MuiSelect-select': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    },
                    '& .MuiSelect-icon': {
                    color: 'text.primary',
                    },
                }}
                >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="cn">中文（简体）</MenuItem>
                <MenuItem value="tc">中文（繁體）</MenuItem>
                <MenuItem value="es">Español</MenuItem>
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="de">Deutsch</MenuItem>
                <MenuItem value="jp">日本語</MenuItem>
                <MenuItem value="kr">한국어</MenuItem>
                </Select>
            </FormControl>


            <Box id={"auth-button"}>
                {!isSignedIn ? (
                <Button 
                    color="inherit"
                    href = "/sign-in"
                    sx={{
                    justifyContent: "end",
                    right: "2%",
                    backgroundColor: 'background.default',
                    color: 'text.primary',
                    borderColor: 'text.primary',
                    justifyContent: 'center',
                    '&:hover': {
                        backgroundColor: 'text.primary',
                        color: 'background.default',
                        borderColor: 'text.primary',
                    },
                    }}
                >
                    {t('signIn')}
                </Button>
                ) : (
                <UserButton />
                )}
            </Box>
            </Box>
            <StepForm
              steps={steps}
              currentStep={currentStep}
              formData={formData}
              handleInputChange={handleInputChange}
              handleKeyPressStep={handleKeyPressStep}
              handleWeightUnitChange={handleWeightUnitChange}
              weightUnit={weightUnit}
              handleHeightUnitChange={handleHeightUnitChange}
              heightUnit={heightUnit}
              t={t}
              nextStep={nextStep}
              prevStep={prevStep}
              handleSubmit={handleSubmit}
            />
    
    </>
          
          
        )}

      </ThemeProvider>
    </GuestContext.Provider>
  );
}
