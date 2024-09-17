"use client"

// base imports
import { useEffect, useState, } from 'react';
import { Box, Typography, Button, useMediaQuery, ThemeProvider, CssBaseline, Divider, Modal, Stack, Menu, MenuItem} from '@mui/material';
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
// info button
import InfoIcon from '@mui/icons-material/Info';
import MenuIcon from '@mui/icons-material/Menu';

// calendar
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin, {Draggable, DropArg} from "@fullcalendar/interaction"
import tiemGridPlugin from "@fullcalendar/timegrid"
import WarningIcon from '@mui/icons-material/Warning';
import allLocales from '@fullcalendar/core/locales-all';

import { lightTheme, darkTheme } from '../theme';
import { customComponents } from '../customMarkdownComponents'; 
  
  
const PlanPage = () => {
    const {guestPlan, guestEvents, setGuestEvents} = useContext(GuestContext)
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

    // menu + calendar exporting
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (action) => {
      if (action === 'export') {
          exportEvents(); // Call the export function when Export is clicked
      }
      setAnchorEl(null);
    };

    // import calendar fucntion
    const handleFileImport = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
    
      const reader = new FileReader();
      reader.onload = async (e) => {
        const icsData = e.target.result;
    
        // Send the ICS data to the server-side API for parsing
        const response = await fetch('/api/ical', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ icsData }),
        });
    
        const { events } = await response.json();
    
        // Modify each event to add an id and set default color to red
        const modifiedEvents = events.map((event) => ({
          ...event,
          id: event.id || new Date().getTime().toString() + Math.random(), // Generate a unique id
          backgroundColor: 'orange',
        }));
    
        // Add imported events to FullCalendar
        if (user) {
          setAllEvents([...allEvents, ...modifiedEvents]);
        } else {
          setGuestEvents([...guestEvents, ...modifiedEvents]);
        }
      };
    
      reader.readAsText(file); // Read the file as text
    };
    

    // export calendar function
    const exportEvents = () => {
      const eventsToExport = user ? allEvents : guestEvents; // Select events based on user status
  
      // Create the iCalendar header
      let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//YourAppName//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n`;
  
      // Iterate through the events and format them for iCalendar
      eventsToExport.forEach(event => {
          const { title, start, end, allDay, extendedProps } = event;
  
          // Convert dates to the iCalendar format (YYYYMMDDTHHMMSSZ)
          const startDate = new Date(start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          const endDate = end ? new Date(end).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : null;
  
          icsContent += `BEGIN:VEVENT\n`;
          icsContent += `SUMMARY:${title}\n`;
          icsContent += `UID:${event.id}@yourapp.com\n`; // Unique ID for each event
          icsContent += `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`; // Current time
          icsContent += `DTSTART:${startDate}\n`;
          if (endDate) icsContent += `DTEND:${endDate}\n`;
          if (allDay) icsContent += `X-MICROSOFT-CDO-ALLDAYEVENT:TRUE\n`;
  
          if (extendedProps?.details) {
              icsContent += `DESCRIPTION:${extendedProps.details.replace(/\n/g, '\\n')}\n`; // Escape newlines
          }
  
          icsContent += `END:VEVENT\n`;
      });
  
      // Add the iCalendar footer
      icsContent += `END:VCALENDAR`;
  
      // Create a Blob from the iCalendar content
      const blob = new Blob([icsContent], { type: 'text/calendar' });
  
      // Create a link to trigger the download of the .ics file
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'calendar-events.ics'; // The downloaded file will have the .ics extension
  
      // Append the link to the document and trigger the download
      document.body.appendChild(link);
      link.click();
  
      // Clean up by removing the link element
      document.body.removeChild(link);
    };
    // get plan from firebase or guest plan
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
    // turn plan into events
    const parsePlanToEvents = (planText) => {
      const days = planText.split(/Day\s*\d+:/).slice(1); // Split by "Day" followed by any number and a colon, and exclude the first empty element
      const events = [];
      let index = 1;
      days.forEach(day => {
        const [dayTitle, ...detailsArray] = day.trim().split('\n');
        const detailsText = detailsArray.join('\\n').trim().replace(/\\n/g, '  \n').replace(/\*/g,"")
        let event = {
          title: `Day ${index}: ${dayTitle.replace(/\*/g,"").trim()}`, // Re-add "Day" prefix
          details: `${detailsText}` 
        };
        index = index + 1
        events.push(event);
      });
      setEvents(events)
    
    };
    
    // hook to get plan
    useEffect(() => {
      const fetchPlan = async () => {
        if(user){
          const fetchedPlan = await getPlan();
          setPlan(fetchedPlan);
          if (fetchedPlan) {
            parsePlanToEvents(fetchedPlan);
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

      // info modal open close
      const [openInfoModal, setOpenInfoModal] = useState(false);
      const handleInfoModal = () => {
        setOpenInfoModal(true);
      }

      const [events, setEvents] = useState([])
      const [allEvents, setAllEvents] = useState([]);
      const [showDeleteModal, setShowDeleteModal] = useState(false)
      const [idToDelete, setIdToDelete] = useState(0)
      const [newEvent, setNewEvent] = useState({title: "", start: "", id: 0, allDay: false})
      const [selectedEvent, setSelectedEvent] = useState(null);

      // handle event modal
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

      // draggable feature
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

      // handle moving events
      const handleEventDrop = (dropInfo) => {
        const { event } = dropInfo;
      
        const updatedEvent = {
          id: event.id,
          title: event.title,
          start: event.start.toISOString(),
          end: event.end ? event.end.toISOString() : null,
          allDay: event.allDay,
          extendedProps: {
            details: event.extendedProps.details, // Keep the event details unchanged
          },
        };
      
        // Update the `allEvents` or `guestEvents` array
        if(user){
          setAllEvents(allEvents.filter(event => Number(event.id) !== Number(idToDelete)))
          setAllEvents([...allEvents, updatedEvent]);
        }
        else{
          setGuestEvents(guestEvents.filter(event => Number(event.id) !== Number(idToDelete)));
          setGuestEvents([...guestEvents, updatedEvent]);
        }
      };
      
    
      // add/delete/update to firebase events
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
        if(user){
          setAllEvents([...allEvents, event]);
        }
        else{
          setGuestEvents([...guestEvents, event]);
        }
      };
      
      const handleDelete = async () => {
        if(user){
          setAllEvents(allEvents.filter(event => Number(event.id) !== Number(idToDelete)))
        }
        else{
          setGuestEvents(guestEvents.filter(event => Number(event.id) !== Number(idToDelete)));
        }
        handleCloseModal()
        setIdToDelete(null)
      }

      useEffect(() => {
        const updateEventsInFirestore = async () => {
          if (user) {
            const userId = user.id;
            const eventsCollectionRef = collection(firestore, 'users', userId, 'events');
      
            try {
              // Fetch all events in Firestore
              const querySnapshot = await getDocs(eventsCollectionRef);
      
              // Delete each event
              const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
              await Promise.all(deletePromises);
      
      
              // Re-upload all the events in `allEvents`
              allEvents?.forEach(async (event) => {
                const docRef = doc(firestore, 'users', userId, 'events', event?.id?.toString());
      
                // Upload the new event to Firestore
                await setDoc(docRef, event);
              });
      
            } catch (error) {
              console.error("Error updating events in Firestore:", error);
            }
          }
        };
      
        if (allEvents.length >= 0) {
          updateEventsInFirestore();
        }
      }, [allEvents, user]);
      
      // update equipment everytime the user changes or guestEquipment changes
      const updateEvents = async () => {
        if (user) {
          const userId = user.id;
          const docRef = collection(firestore, 'users', userId, 'events');
          const docs = await getDocs(docRef);
          const events = [];
          docs.forEach((doc) => {
            events.push({ name: doc.id, ...doc.data() });
          });
          setAllEvents(events);
        }
        else{
          setAllEvents(guestEvents)
        }
      };

      useEffect(() => {
          updateEvents();
      }, [user, guestEvents]);

      // when logging out, setEvents to blank
      useEffect(()=> {
        if(!user){
          setEvents([])
        }

      }, [user])

      // Function to handle custom locale mapping
      const getCalendarLocale = (language) => {
        if (language === 'cn') {
          return 'zh-cn';  // Map 'cn' or 'tc' to 'zh' for Chinese
        }
        if(language === 'tc'){
          return 'zh-tw'
        }
        if(language ==='jp'){
          return 'ja'
        }
        if(language ==='kr'){
          return 'ko'
        }
        return language; // Default to the selected language
      };

      const calendarLocale = getCalendarLocale(i18n.language); // Get the correct locale for FullCalendar

    return(
        // light/dark theming
        <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* main box */}
        <Box
          width="100%"
          height = "100%"
          display="flex"
          flexDirection="column"
          paddingBottom= '60px' // Ensure content is not cut off by the toolbar
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
            <Button 
              variant="outlined" 
              onClick={handleMenuClick}
              sx={{
                height: "55px",
                fontSize: '1rem',
                backgroundColor: 'background.default',
                color: 'text.primary',
                borderColor: 'background.default',
                borderRadius: '55px',
                '&:hover': {
                  backgroundColor: 'text.primary',
                  color: 'background.default',
                  borderColor: 'text.primary',
                },
              }}
            >
              <MenuIcon />
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem>
                <label htmlFor="upload-ics-file">Import</label>
                <input
                  type="file"
                  accept=".ics"
                  id="upload-ics-file"
                  style={{ display: 'none' }}
                  onChange={handleFileImport}
                />
              </MenuItem>
              <MenuItem onClick={() => handleMenuClose('export')}>Export</MenuItem>
            </Menu>
            
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
          {isMobile && (<Divider />)}
          <Stack flexDirection = "column" width = "100%" maxHeight = "100%">
            <Box
              width = "100%"
              height = {isMobile ? "75%" : "auto"}
              overflow= "scroll"
              backgroundColor="background.calendar"
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
                  drop = {(data) => addEvent(data) }
                  eventDrop={(data) => handleEventDrop(data)} 
                  eventClick={(data) => handleEventClick(data)}
                  aspectRatio={isMobile ? 1 : 2.5}
                  locales= {allLocales}
                  
                  locale = {calendarLocale}
                />
                
            </Box>
            <Stack
              width = "100%"
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
                    <Typography>{t("Drag workouts into Calendar:")}</Typography>
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
                  whiteSpace={isMobile ? "nowrap": ""}
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
