"use client"

// base imports
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Container, Box, Typography, Button, TextField, ToggleButtonGroup, ToggleButton, CircularProgress, useMediaQuery, ThemeProvider, CssBaseline, Divider, Modal, Stack, Grid, FormControl, InputLabel, NativeSelect, Link } from '@mui/material';
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
// import ai
import { OpenAI } from 'openai';
// info button
import InfoIcon from '@mui/icons-material/Info';

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin, {Draggable, DropArg} from "@fullcalendar/interaction"
import tiemGridPlugin from "@fullcalendar/timegrid"
import WarningIcon from '@mui/icons-material/Warning';


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

  const customComponents = {
    a: ({ href, children }) => (
      <Link href={href} color="background.link" underline="hover">
        {children}
      </Link>
    ),
    p: ({ children }) => (
      <Typography variant="body1" paragraph sx={{ marginBottom: 0, lineHeight: 1.6 }}>
        {children}
      </Typography>
    ),
    h1: ({ children }) => (
      <Typography variant="h4" gutterBottom sx={{ marginTop: 0, marginBottom: 0 }}>
        {children}
      </Typography>
    ),
    h2: ({ children }) => (
      <Typography variant="h5" gutterBottom sx={{ marginTop: 0, marginBottom: 0 }}>
        {children}
      </Typography>
    ),
    h3: ({ children }) => (
      <Typography variant="h6" gutterBottom sx={{ marginTop: 0, marginBottom: 0 }}>
        {children}
      </Typography>
    ),
    ul: ({ children }) => (
      <Box component="ul" sx={{ paddingLeft: 3, marginBottom: 0 }}>
        {children}
      </Box>
    ),
    ol: ({ children }) => (
      <Box component="ol" sx={{ paddingLeft: 3, marginBottom: 0 }}>
        {children}
      </Box>
    ),
    blockquote: ({ children }) => (
      <Box
        component="blockquote"
        sx={{
          marginLeft: 2,
          paddingLeft: 2,
          borderLeft: '4px solid #ccc',
          fontStyle: 'italic',
          color: '#555',
          marginBottom: 0,
        }}
      >
        {children}
      </Box>
    ),
    code: ({ children }) => (
      <Box
        component="code"
        sx={{
          backgroundColor: '#f5f5f5',
          padding: '8px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          marginBottom: 0,
        }}
      >
        {children}
      </Box>
    ),
    pre: ({ children }) => (
      <Box
        component="pre"
        sx={{
          backgroundColor: '#f5f5f5',
          padding: '8px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          overflowX: 'auto',
          marginBottom: 0,
        }}
      >
        {children}
      </Box>
    ),
  };
  
  
const PlanPage = () => {
    const {guestPlan} = useContext(GuestContext)
    // Implementing multi-languages
    const { t, i18n } = useTranslation();
    const { user, isSignedIn } = useUser(); // Clerk user
    const [prefLanguage, setPrefLanguage] = useState('');
    const [plan, setPlan] = useState("");

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

    const parsePlanToEvents = (planText) => {
      const days = planText.split("Day").slice(1); // Split by each day and exclude the first element
      const events = [];
    
      days.forEach(day => {
        const [dayTitle, ...detailsArray] = day.trim().split('\n');
        let event = {
          title: `Day ${dayTitle.trim().replace(/[^a-zA-Z]+$/, '')}`, // Re-add "Day" prefix
          details: `${detailsArray.join('\\n').trim().replace(/\\n/g, '  \n').replace(/[^a-zA-Z]+$/, '')}` 
        };
        events.push(event);
      });
      setEvents(events)
    
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
              parsePlanToEvents(fetchedPlan);
            }
          }
        }
        else{
          const fetchedPlan = await getPlan();
            setPlan(fetchedPlan);
            if (fetchedPlan) {
              parsePlanToEvents(fetchedPlan);
            }
        }
      };
      fetchPlan();
      }, [user, guestPlan]);

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
                            parsePlanToEvents(newPlan);
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
      // open Info modal
      const [openInfoModal, setOpenInfoModal] = useState(false);
      const handleInfoModal = () => {
        setOpenInfoModal(true);
      }

      const [selectedEvent, setSelectedEvent] = useState(null);

      // event modal
      const handleEventClick = (data) => {
        setSelectedEvent({
          title: data.event.title,
          details: data.event.extendedProps.details, // Assuming details are stored in extendedProps
        });
        setIdToDelete(Number(data.event.id))
      };
      

      const handleCloseModal = () => {
          setSelectedEvent(null);
      };

      const [events, setEvents] = useState([])
      const [allEvents, setAllEvents] = useState([]);
      const [showModal, setShowModal] = useState(false)
      const [showDeleteModal, setShowDeleteModal] = useState(false)
      const [idToDelete, setIdToDelete] = useState(0)
      const [newEvent, setNewEvent] = useState({title: "", start: "", id: 0, allDay: false})
    
      useEffect(() => {
        let draggableEl = document.getElementById('draggable-el')
        if(draggableEl) {
          new Draggable(draggableEl, {
            itemSelector: ".fc-event",
            eventData: function(eventEl) {
              let title = eventEl.getAttribute('title')
              let id = eventEl.getAttribute('data')
              let start = eventEl.getAttribute('start')
              return {title, id, start}
            }
          })
        }
        
      }, [])
    
      const handleDateClick = (arg) => {
        setNewEvent({ ...newEvent, start: arg.date, allDay: arg.allDay, id: new Date().getTime() });
        setShowModal(true);
      };  
    
      const addEvent = (data) => {
        // Find the event from the `events` array based on the title of the dragged element
        const eventTitle = data.draggedEl.innerText;
        const selectedEvent = events.find((event) => event.title === eventTitle);
      
        // If the event exists in the array, use its details
        const eventDetails = selectedEvent ? selectedEvent.details : "No details available";
      
        const event = {
          ...newEvent,
          start: data.date.toISOString(),
          title: eventTitle,
          allDay: data.allDay,
          id: new Date().getTime(),
          extendedProps: {
            details: eventDetails, // Use the details from the selected event
          },
        };
      
        // Add the new event to the `allEvents` array
        setAllEvents([...allEvents, event]);
      };
      
      const handleDelete = () => {
        setAllEvents(allEvents.filter(event => Number(event.id) !== Number(idToDelete)))
        handleCloseModal()
        setIdToDelete(null)
      }
    return(
        // light/dark theming
        <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* main box */}
        <Box
          width="100vw"
          height="90vh"
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
                width: "90%",
                height: "90%",
                bgcolor: 'background.default',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Stack overflow={"scroll"}>
                <Typography id="event-modal-title" variant="h6" component="h2">
                  <ReactMarkdown components={customComponents}>{selectedEvent?.title}</ReactMarkdown>
                </Typography>
                
                <Typography id="event-modal-description" sx={{ mt: 2 }}>
                  <ReactMarkdown components={customComponents}>{selectedEvent?.details}</ReactMarkdown>
                </Typography>
              </Stack>
              <Stack flexDirection = "row" display="flex" justifyContent={"end"} gap = {1}>
                <Button
                onClick={handleCloseModal}
                sx={{
                  justifyContent: "end",
                  right: "2%",
                  backgroundColor: 'background.default',
                  color: 'text.primary',
                  borderColor: 'text.primary',
                  border: "1px",
                  justifyContent: 'center',
                  '&:hover': {
                      backgroundColor: 'text.primary',
                      color: 'background.default',
                      borderColor: 'text.primary',
                  },
                  }}>
                    Close</Button>
                <Button
                onClick={(handleDelete)}
                sx={{
                  justifyContent: "end",
                  right: "2%",
                  backgroundColor: 'red',
                  color: 'white',
                  borderColor: 'text.primary',
                  justifyContent: 'center',
                  '&:hover': {
                      backgroundColor: 'text.primary',
                      color: 'background.default',
                      borderColor: 'text.primary',
                  },
                  }}>Delete</Button>
                
              </Stack>
              
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
          {/* delete modal */}
          <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
            <Box
              overflow="auto"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                height: 150,
                bgcolor: 'background.default',
                borderRadius: 1,
                // border: '2px solid #000',
                boxShadow: 24,
                p: 4,
                gap: 2,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack flexDirection= 'row' gap= {2}>
                {/* red triangle */}
                <Box
                  sx={{
                    backgroundColor: '#FFCCBB', // Light red background
                    borderRadius: '50%', // Circular shape
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 30, // Adjust size as needed
                    height: 30,
                  }}
                >
                  <WarningIcon sx={{ color: 'red', fontSize: "1rem"}} />
                </Box>
                <Stack flexDirection = 'column' gap = {0.5}>
                  <Typography sx={{fontWeight: 550}}>Delete Event</Typography>
                  <Typography sx={{fontWeight: 200, fontSize: "0.75rem"}}>Are you sure you want to delete this event?</Typography>
                </Stack>
              </Stack>
              <Stack flexDirection = "row" display="flex" justifyContent={"end"} gap = {1}>
                <Button
                onClick={()=>setShowDeleteModal(false)}
                sx={{
                  justifyContent: "end",
                  right: "2%",
                  backgroundColor: 'background.default',
                  color: 'text.primary',
                  borderColor: 'text.primary',
                  border: "1px",
                  justifyContent: 'center',
                  '&:hover': {
                      backgroundColor: 'text.primary',
                      color: 'background.default',
                      borderColor: 'text.primary',
                  },
                  }}>
                    Cancel</Button>
                <Button
                onClick={(handleDelete)}
                sx={{
                  justifyContent: "end",
                  right: "2%",
                  backgroundColor: 'red',
                  color: 'white',
                  borderColor: 'text.primary',
                  justifyContent: 'center',
                  '&:hover': {
                      backgroundColor: 'text.primary',
                      color: 'background.default',
                      borderColor: 'text.primary',
                  },
                  }}>Delete</Button>
                
              </Stack>
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
                {t('myPlanner')}
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
          <Divider />
          <Stack flexDirection = "column" maxHeight = {isMobile ? "100vh" : "90vh"} paddingBottom = "60px">
            <Box
              width = "100%"
              // maxHeight = "100%"
              overflow= "scroll"
              backgroundColor="background.default"
              >
                <FullCalendar
                  plugins = {[
                    dayGridPlugin,
                    interactionPlugin,
                    tiemGridPlugin
                  ]}
                  headerToolbar = {{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth timeGridWeek'
                  }}          
                  events = {allEvents}
                  nowIndicator={true}
                  editable={true}
                  droppable={true}
                  selectable={true}
                  selectMirror = {true}
                  dateClick = {handleDateClick}
                  drop = {(data) => addEvent(data) }
                  // eventClick={(data) => handleDeleteModal(data)}
                  eventClick={(data) => handleEventClick(data)}
                  aspectRatio={isMobile ? 1 : 2.5}
                  
                />
                
            </Box>
            <Stack
              id = "draggable-el"
              // height ="100%"
              backgroundColor = "background.bubbles"
              flexDirection="row"
              display = "flex"
              alignItems={"center"}
              spacing={1}
              padding = {2}
              gap = {isMobile ? 1 : 2.5}
              overflow = "scroll"
              height = {isMobile ? "100px" : "100px"}
              // paddingTop={5}
              >
                <Box sx={{ width: isMobile ? "100%" : "auto"}}> {/* Full width for the container */}
                  <Box 
                    sx={{
                      width: "110px" // Set width explicitly within the container
                    }}>
                    <Typography>Drag workouts into Calendar:</Typography>
                  </Box>
                </Box>

                {events.map(event => (
                  <Box
                  className = "fc-event"
                  title={event.title}
                  key={event.id}
                  // width = "200px"
                  height =  "60px"
                  backgroundColor="background.default"
                  padding = {1}
                  borderRadius = {1}
                  sx={{whiteSpace: "nowrap"}}
                  >
                    {event.title}
                  </Box>
                
                ))}

            </Stack>
          </Stack>

            </Box>
        </ThemeProvider>
    )
}
export default PlanPage;
