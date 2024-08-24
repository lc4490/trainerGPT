"use client"

// base imports
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Container, Box, Typography, Button, TextField, ToggleButtonGroup, ToggleButton, CircularProgress, useMediaQuery, ThemeProvider, CssBaseline, Divider, Modal, Stack, Grid, FormControl, InputLabel, NativeSelect } from '@mui/material';
import { createTheme } from '@mui/material';
// Firebase imports
import { firestore } from '../firebase'
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore';
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
// info button
import InfoIcon from '@mui/icons-material/Info';

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
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "user", content: `${planText}\nconvert this workout plan into a JavaScript array of event objects formatted as JSON, without any extra text, just pure JSON, like this:
            const events = [
              {
                "title": "Upper Body Strength",
                "start": "2024-08-19T09:00:00",
                "end": "2024-08-19T10:00:00",
                "details": 
                "Warm-Up (5-10 minutes)\\nJumping jacks\\nArm circles\\nLight jogging\\n\\nWorkout:\\nSquats with Dumbbells: 3 sets of 12 reps\\nBench Press with Barbell: 3 sets of 10 reps\\nBent-Over Rows with Dumbbells: 3 sets of 12 reps\\nDumbbell Lunges: 3 sets of 10 reps per leg\\nPlank: 3 sets of 30 seconds\\n\\nCool-Down (5-10 minutes)\\nStretching\\nDeep breathing exercises"
              }
              // Add other events similarly...
              For future weeks, when the plan says "repeat with increased intensity," copy the exact details from the previous week’s workout and simply add a note at the end indicating the increase in intensity. Do not summarize or generalize the workouts; provide the full workout details for each day, just like in week 1.
            ]`
            }
          ],
        });
    
        const responseText = response.choices[0].message.content;
        console.log("OpenAI Response Text:", responseText);
    
        if (responseText) {
          // Try parsing the response as JSON directly
          let events;
          try {
            events = JSON.parse(responseText);
          } catch (jsonError) {
            // Fallback to extracting JSON string manually
            const jsonString = responseText.match(/\[\s*{[\s\S]*}\s*]/)?.[0];
            if (jsonString) {
              events = JSON.parse(jsonString);
            } else {
              throw new Error("Could not find valid JSON in response.");
            }
          }
    
          if (events) {
            setEvents(events);
            console.log(events);
            if(user){
              const userId = user.id;
              const userDocRef = doc(firestore, 'users', userId);
              await setDoc(userDocRef, { events: events }, { merge: true });
            }
          }
        }
      } catch (error) {
        console.error("Error in parsePlanToEvents:", error);
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
        if(user){
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
      }
      };
      fetchPlan();
      }, [user]);

      // if plan changed, update events
      useEffect(() => {
        if (!user) return;
    
        const userId = user.id;
        const userDocRef = doc(firestore, 'users', userId);
    
        const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                const newPlan = userData.plan;
    
                // Check if the plan has changed
                if (newPlan !== plan) {
                    setPlan(newPlan);
                    if (newPlan) {
                        // Define an async function to handle the async logic
                        const updateEvents = async () => {
                            await parsePlanToEvents(newPlan);
                        };
    
                        // Call the async function
                        updateEvents();
                    }
                }
            }
        });
    
        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, [user, plan]);
      // event modal
      const handleEventClick = (event) => {
        setSelectedEvent(event);
      };

      const handleCloseModal = () => {
          setSelectedEvent(null);
      };
      // open Info modal
      const [openInfoModal, setOpenInfoModal] = useState(false);
      const handleInfoModal = () => {
        setOpenInfoModal(true);
      }
    return(
        // light/dark theming
        <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* main box */}
        <Box
          width="100vw"
          height="100vh"
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
          {/* info modal */}
          <Modal open = {openInfoModal} onClose = {() => setOpenInfoModal(false)}>
              <Box 
              overflow="auto"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 350,
                height: "75%",
                bgcolor: 'background.default',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: "15px",
              }}>
                <Typography variant="h6" component="h2" fontWeight='600'>
                    {t("How to use:")}
                  </Typography>
                  <Typography sx={{ mt: 2 }}>
                    {t("View your custom-crafted workout plan here. Click the top right to see what days your friends are available to workout.")}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button 
                    variant="outlined"
                    onClick={() => {
                      setOpenInfoModal(false)
                    }}
                    sx={{
                      mt: 2,
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
            <Box display="flex" flexDirection={"row"} alignItems={"center"} gap={1}>
              <Typography variant="h6" color="text.primary" textAlign="center">
                {t('My Plan')}
              </Typography>
              <Button 
                onClick={handleInfoModal}
                sx={{ 
                    minWidth: "auto",  
                    aspectRatio: "1 / 1", 
                    borderRadius: "50%",
                    width: "20px",  // or adjust as needed
                    height: "20px"  // or adjust as needed
                }}>
                    <InfoIcon sx={{ color: "lightgray" }}/>
                </Button>
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
          <Box width = "100%" height = "100%" marginBottom="60px">

          <Divider />
          {/* {console.log(plan)} */}
          {/* <ReactMarkdown>{plan}</ReactMarkdown> */}
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleEventClick}
            toolbar={false}
          />
          </Box>

            </Box>
        </ThemeProvider>
    )
}
export default PlanPage;
