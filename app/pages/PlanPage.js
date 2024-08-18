"use client"

// base imports
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Container, Box, Typography, Button, TextField, ToggleButtonGroup, ToggleButton, CircularProgress, useMediaQuery, ThemeProvider, CssBaseline, Divider, Modal, Stack, Grid, FormControl, InputLabel, NativeSelect } from '@mui/material';
import { createTheme } from '@mui/material';
// Firebase imports
import { firestore } from '../firebase'
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
// Clerk imports
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
// translations
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Adjust the path as necessary
// linebreaks
import ReactMarkdown from 'react-markdown';
// import guestContext
import { useContext } from 'react';
import { GuestContext } from '../page'; // Adjust the path based on your structure
// import icons
import { Group } from '@mui/icons-material';

// light/dark themes
const lightTheme = createTheme({
    palette: {
      mode: 'light',
      background: {
        default: '#ffffff',
        paper: '#ffffff',
        bubbles: 'lightgray',
        userBubble: '#95EC69',
        link: 'darkblue'
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
// link color
const customComponents = {
    a: ({ href, children }) => (
      <Link href={href} color="background.link" underline="hover">
        {children}
      </Link>
    ),
  };

const PlanPage = () => {
    const {guestPlan} = useContext(GuestContext)
    // Implementing multi-languages
    const { t, i18n } = useTranslation();
    const { user, isSignedIn } = useUser(); // Clerk user
    const [prefLanguage, setPrefLanguage] = useState('');
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        if (user) {
        const displayName = user.fullName || 'User';
        const personalizedWelcome = t('welcome', { name: displayName });
        setMessages([{ role: 'assistant', content: personalizedWelcome }]);
        } else {
        setMessages([{ role: 'assistant', content: t('welcome', { name: t('guest') }) }]);
        }
    };
    const handleLanguageChange = (event) => {
        const newLanguage = event.target.value;
        setPrefLanguage(newLanguage);
        changeLanguage(newLanguage);
        setPreferredLanguage(newLanguage);
    };
    // Store preferred language on Firebase
    const setPreferredLanguage = async (language) => {
        if (user) {
        const userId = user.id;
        const userDocRef = doc(firestore, 'users', userId);
        await setDoc(userDocRef, { preferredLanguage: language }, { merge: true });
        }
    };
    const getPreferredLanguage = async () => {
        if (user) {
        const userId = user.id;
        const userDocRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        return userDoc.exists() ? userDoc.data().preferredLanguage : null;
        }
        return null;
    };
    useEffect(() => {
        const fetchAndSetLanguage = async () => {
        const preferredLanguage = await getPreferredLanguage();
        if (preferredLanguage) {
            setPrefLanguage(preferredLanguage);
            i18n.changeLanguage(preferredLanguage);
        }
        };

        fetchAndSetLanguage();
    }, [user]);
    // Implementing theming
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useState(prefersDarkMode);
    useEffect(() => {
        setDarkMode(prefersDarkMode);
    }, [prefersDarkMode]);
    const theme = darkMode ? darkTheme : lightTheme;
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // plan
    const [plan, setPlan] = useState("");
    const getPlan = async () => {
        if (user) {
          const userId = user.id;
          const userDocRef = doc(firestore, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          return userDoc.exists() ? userDoc.data().plan : null;
        }
        else{
            return guestPlan;
        }
    };
    useEffect(() => {
        const fetchPlan = async () => {
            const plan = await getPlan();
            setPlan(plan)
        }
        
        fetchPlan();
      }, []);
    return(
        // light/dark theming
    <ThemeProvider theme={theme}>
    <CssBaseline />
    {/* main box */}
    <Box
      width="100vw"
      height={isMobile ? "100vh" : "90vh"}
      display="flex"
      flexDirection="column"
    >
      {/* header box */}
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
        <Button>
            <Group />
        </Button>
        
        {/* title */}
        <Box display="flex" flexDirection={"row"} alignItems={"center"}>
          <Typography variant="h6" color="text.primary" textAlign="center">
            {t('My Plan')}
          </Typography>
        </Box>
        {/* signin button */}
        <Box>
          <Box>
              {!isSignedIn ? (
                <Button 
                  color="inherit"
                  href="/sign-in"
                  sx={{
                    justifyContent: "end",
                    right: "2%",
                    backgroundColor: 'background.default',
                    color: 'text.primary',
                    borderColor: 'text.primary',
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
      </Box>

      <Divider />
            {console.log(plan)}
            <ReactMarkdown components={customComponents}>{plan}</ReactMarkdown>
        </Box>
    </ThemeProvider>
    )
}
export default PlanPage;
