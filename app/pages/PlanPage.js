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
// calendar
// import WorkoutCalendar from './WorkoutCalendar'; // Adjust the import path
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
// import ai
import { OpenAI } from 'openai';


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
  // calendar 
  const localizer = momentLocalizer(moment);
  
const PlanPage = () => {
    const {guestPlan} = useContext(GuestContext)
    // Implementing multi-languages
    const { t, i18n } = useTranslation();
    const { user, isSignedIn } = useUser(); // Clerk user
    const [prefLanguage, setPrefLanguage] = useState('');
    const [plan, setPlan] = useState("");
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);

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

    // AI parsing plan to events
    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    })

    const parsePlanToEvents = async (planText) => {
      try {
        // Call OpenAI to parse the workout plan into events
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini", // or "gpt-4o-mini" depending on your setup
          messages: [
            { role: "user", content: `${planText}\nconvert this workout plan into event components formatted like this:
              const events = [
                    {
                        {
                          "title": "Upper Body Strength",
                          "start": "2024-08-19T09:00:00",
                          "end": "2024-08-19T10:00:00",
                          "details": "Warm-Up: Jumping Jacks, Arm Circles, etc."
                        }
                    },
                    // Add other days similarly...
                ];
                ` 
              }
          ],
        });

        const responseText = response.choices[0].message.content;

        if (responseText) {
          // Extract the JavaScript code
          const codeStartIndex = responseText.indexOf('const events =');
          const codeEndIndex = responseText.lastIndexOf('];') + 2; // End of array

          if (codeStartIndex !== -1 && codeEndIndex !== -1) {
            const codeToEvaluate = responseText.slice(codeStartIndex, codeEndIndex);
            // Use eval to execute the code and assign the events variable

            // Now `events` variable should be available
            // Extract the array part of the string
            const jsonArrayString = codeToEvaluate.match(/\[(.|\n)*\]/)[0];

            // Parse the JSON string
            const events = JSON.parse(jsonArrayString);
            setEvents(events)
            console.log(events)
            const userId = user.id;
            const userDocRef = doc(firestore, 'users', userId)
            await setDoc(userDocRef, { events: events }, { merge: true})
          }
        }
  
      } catch (error) {
        console.error("Error in parsePlanToEvents:", error);
        console.log(responseText)
      }
    };    
    // plan
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
        const userId = user.id;
        const userDocRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if(userDoc.exists() && userDoc.data().events){
          setEvents(userDoc.data().events)
        }
        else{
          const fetchedPlan = await getPlan();
          setPlan(fetchedPlan);
          if (fetchedPlan) {
            await parsePlanToEvents(fetchedPlan);
          }
        }
        
      };
      fetchPlan();
      }, [user]);

      // event modal
      const handleEventClick = (event) => {
        setSelectedEvent(event);
      };

      const handleCloseModal = () => {
          setSelectedEvent(null);
      };
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
          {/* event modal */}
          <Modal
                    open={!!selectedEvent}
                    onClose={handleCloseModal}
                    aria-labelledby="event-modal-title"
                    aria-describedby="event-modal-description"
                >
                    <Box
                        overflow="auto"
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 400,
                          height: 400,
                          bgcolor: 'background.default',
                          border: '2px solid #000',
                          boxShadow: 24,
                          p: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                        }}
                    >
                      <Stack>
                        <Typography id="event-modal-title" variant="h6" component="h2">
                            {selectedEvent?.title}
                        </Typography>
                        <Typography id="event-modal-description" sx={{ mt: 2 }}>
                            {selectedEvent?.details}
                        </Typography>
                      </Stack>
                        <Button 
                          variant="outlined"
                          onClick={() => {
                            handleCloseModal()
                          }}
                          sx={{
                            backgroundColor: 'text.primary',
                            color: 'background.default',
                            borderColor: 'text.primary',
                            '&:hover': {
                              backgroundColor: 'darkgray',
                              color: 'text.primary',
                              borderColor: 'text.primary',
                            },
                          }}
                        >
                          {t('Close')}
                        </Button>
                    </Box>
                </Modal>
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
                {/* {console.log(plan)} */}
                {/* <ReactMarkdown>{plan}</ReactMarkdown> */}
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    onSelectEvent={handleEventClick}
                    sx={{ 
                      height: "650px",
                      backgroundColor: "background.default",
                      color: "text.primary",
                      borderRadius: "8px",
                      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                    eventPropGetter={(event) => ({
                      style: {
                        backgroundColor: "background.default",
                        color: "text.primary",
                        borderRadius: "4px",
                      },
                    })}
                    dayPropGetter={(date) => ({
                      style: {
                        backgroundColor: date.toDateString() === new Date().toDateString() 
                          ? "background.default"
                          : "text.primary"
                      },
                    })}
                />
            </Box>
        </ThemeProvider>
    )
}
export default PlanPage;
