import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Box, Typography, ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme, useMediaQuery } from '@mui/material';

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

const localizer = momentLocalizer(moment);

const events = [
    {
        title: 'Upper Body Strength',
        start: new Date(2024, 7, 19, 9, 0), // Adjust date and time accordingly
        end: new Date(2024, 7, 19, 10, 0),
        details: `Warm-Up (5-10 minutes):
                  Jumping Jacks: 2 minutes
                  Arm Circles: 1 minute each direction
                  Dynamic Stretching: 2 minutes
                  ...`
    },
    // Add other days similarly...
];

const WorkoutCalendar = () => {
    // Implementing theming
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useState(prefersDarkMode);
    useEffect(() => {
        setDarkMode(prefersDarkMode);
    }, [prefersDarkMode]);
    const theme = darkMode ? darkTheme : lightTheme;
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleEventClick = (event) => {
        setSelectedEvent(event);
    };

    const handleCloseModal = () => {
        setSelectedEvent(null);
    };

    return (
        <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
            <CssBaseline />
            <Box p={2}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    onSelectEvent={handleEventClick}
                />

                <Modal
                    open={!!selectedEvent}
                    onClose={handleCloseModal}
                    aria-labelledby="event-modal-title"
                    aria-describedby="event-modal-description"
                >
                    <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        bgcolor="background.paper"
                        borderRadius={2}
                        p={4}
                    >
                        <Typography id="event-modal-title" variant="h6" component="h2">
                            {selectedEvent?.title}
                        </Typography>
                        <Typography id="event-modal-description" sx={{ mt: 2 }}>
                            {selectedEvent?.details}
                        </Typography>
                    </Box>
                </Modal>
            </Box>
        </ThemeProvider>
    );
};

export default WorkoutCalendar;