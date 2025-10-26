"use client";

// base imports
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  ThemeProvider,
  CssBaseline,
  Divider,
  Modal,
  Stack,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
// Firebase imports
import { firestore } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
// Clerk imports
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
// translations
import { useTranslation } from "react-i18next";
import i18n from "../i18n"; // Adjust the path as necessary
// linebreaks
import ReactMarkdown from "react-markdown";
// import guestContext
import { useContext } from "react";
import { GuestContext } from "../page"; // Adjust the path based on your structure
import { useRouter, useSearchParams } from "next/navigation";
// info button
import InfoIcon from "@mui/icons-material/Info";
import MenuIcon from "@mui/icons-material/Menu";

// calendar
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {
  Draggable,
  DropArg,
} from "@fullcalendar/interaction";
import tiemGridPlugin from "@fullcalendar/timegrid";
import WarningIcon from "@mui/icons-material/Warning";
import CheckIcon from "@mui/icons-material/Check";
import allLocales from "@fullcalendar/core/locales-all";

import { lightTheme, darkTheme } from "../theme";
import { customComponents } from "../customMarkdownComponents";

// google calendar
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
// import { listEvents, createEvent, updateEvent, deleteEvent } from '../../utils/googleCalendar';

const PlanPage = () => {
  const router = useRouter();
  const {
    guestData,
    guestImage,
    guestEquipment,
    guestMessages,
    guestPlan,
    guestEvents,
    setGuestEvents,
  } = useContext(GuestContext);
  // Implementing multi-languages
  const { t, i18n } = useTranslation();
  const { user, isSignedIn } = useUser(); // Clerk user
  const [prefLanguage, setPrefLanguage] = useState("");
  const [plan, setPlan] = useState("");

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    if (user) {
      const displayName = user.fullName || "User";
      const personalizedWelcome = t("welcome", { name: displayName });
      setMessages([{ role: "assistant", content: personalizedWelcome }]);
    } else {
      setMessages([
        { role: "assistant", content: t("welcome", { name: t("guest") }) },
      ]);
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
      const userDocRef = doc(firestore, "users", userId);
      await setDoc(
        userDocRef,
        { preferredLanguage: language },
        { merge: true }
      );
    }
  };
  const getPreferredLanguage = async () => {
    if (user) {
      const userId = user.id;
      const userDocRef = doc(firestore, "users", userId);
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
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);
  const theme = darkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // menu + calendar exporting
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (action) => {
    if (action === "export") {
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
      const response = await fetch("/api/ical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icsData }),
      });

      const { events } = await response.json();

      // Modify each event to add an id and set default color to red
      const modifiedEvents = events.map((event) => ({
        ...event,
        id: event.id || new Date().getTime().toString() + Math.random(), // Generate a unique id
        backgroundColor: "orange",
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
    eventsToExport.forEach((event) => {
      const { title, start, end, allDay, extendedProps } = event;

      // Convert dates to the iCalendar format (YYYYMMDDTHHMMSSZ)
      const startDate =
        new Date(start).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const endDate = end
        ? new Date(end).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
        : null;

      icsContent += `BEGIN:VEVENT\n`;
      icsContent += `SUMMARY:${title}\n`;
      icsContent += `UID:${event.id}@yourapp.com\n`; // Unique ID for each event
      icsContent += `DTSTAMP:${
        new Date().toISOString().replace(/[-:]/g, "").split(".")[0]
      }Z\n`; // Current time
      icsContent += `DTSTART:${startDate}\n`;
      if (endDate) icsContent += `DTEND:${endDate}\n`;
      if (allDay) icsContent += `X-MICROSOFT-CDO-ALLDAYEVENT:TRUE\n`;

      if (extendedProps?.details) {
        icsContent += `DESCRIPTION:${extendedProps.details.replace(
          /\n/g,
          "\\n"
        )}\n`; // Escape newlines
      }

      icsContent += `END:VEVENT\n`;
    });

    // Add the iCalendar footer
    icsContent += `END:VCALENDAR`;

    // Create a Blob from the iCalendar content
    const blob = new Blob([icsContent], { type: "text/calendar" });

    // Create a link to trigger the download of the .ics file
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "calendar-events.ics"; // The downloaded file will have the .ics extension

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
      const userDocRef = doc(firestore, "users", userId);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().plan : null;
    } else {
      return guestPlan;
    }
  };
  // turn plan into events
  const parsePlanToEvents = (planText) => {
    const days = planText.split(/Day\s*\d+(?=\n|:)/).slice(1);
    const events = [];
    let index = 1;
    days.forEach((day) => {
      const [dayTitle, ...detailsArray] = day.trim().split("\n");
      const detailsText = detailsArray
        .join("\\n")
        .trim()
        .replace(/\\n/g, "  \n")
        .replace(/\*/g, "");
      let event = {
        title: `${dayTitle.replace(/\*/g, "").trim()}`, // Re-add "Day" prefix
        details: `${detailsText}`,
      };
      index = index + 1;
      events.push(event);
    });
    setEvents(events);
  };

  // hook to get plan
  useEffect(() => {
    const fetchPlan = async () => {
      if (user) {
        const fetchedPlan = await getPlan();
        setPlan(fetchedPlan);
        if (fetchedPlan) {
          parsePlanToEvents(fetchedPlan);
        }
      } else {
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
  };

  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(0);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    id: 0,
    allDay: false,
  });
  const [selectedEvent, setSelectedEvent] = useState(null);

  // handle event modal
  const handleEventClick = (data) => {
    setSelectedEvent({
      title: data.event.title,
      details: data.event.extendedProps.details, // Assuming details are stored in extendedProps
    });
    setIdToDelete(data.event.id);
  };
  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  // draggable feature
  useEffect(() => {
    let draggableEl = document.getElementById("draggable-el");
    if (draggableEl) {
      new Draggable(draggableEl, {
        itemSelector: ".fc-event",
        eventData: function (eventEl) {
          let title = eventEl.getAttribute("title");
          let id = eventEl.getAttribute("data");
          let start = eventEl.getAttribute("start");
          return { title, id, start };
        },
      });
    }
  }, []);

  // handle moving events
  const handleEventDrop = (dropInfo) => {
    const { event } = dropInfo;

    const updatedEvent = {
      id: event.id,
      title: event.title,
      start: event.start.toISOString(),
      end: event.end ? event.end.toISOString() : null,
      backgroundColor: event.backgroundColor,
      allDay: event.allDay,
      extendedProps: {
        details: event.extendedProps.details, // Keep the event details unchanged
      },
    };

    // Update the `allEvents` or `guestEvents` array
    if (user) {
      setAllEvents(
        allEvents.filter((event) => Number(event.id) !== Number(idToDelete))
      );
      setAllEvents([...allEvents, updatedEvent]);
    } else {
      setGuestEvents(
        guestEvents.filter((event) => Number(event.id) !== Number(idToDelete))
      );
      setGuestEvents([...guestEvents, updatedEvent]);
    }
    if (session) {
      deleteCalendarEvent(event.id);

      setGoogleEventTitle(event.title);
      setGoogleEventDesc(event.extendedProps.details);
      setGoogleEventDate(event.start);
      getDefaultTimes();
      setTimeModalOpen(true);
    }
  };

  // add/delete/update to firebase events
  const addEvent = (data) => {
    // Find the event from the `events` array based on the title of the dragged element
    const eventTitle = data.draggedEl.innerText;
    const selectedEvent = events.find(
      (event) => event.title.trim() === eventTitle.trim()
    );

    // If the event exists in the array, use its details
    const eventDetails = selectedEvent
      ? selectedEvent.details
      : "No details available";

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
    if (user) {
      setAllEvents([...allEvents, event]);
    } else {
      setGuestEvents([...guestEvents, event]);
    }

    if (session) {
      setGoogleEventTitle(eventTitle);
      setGoogleEventDesc(eventDetails);
      setGoogleEventDate(data.date);
      getDefaultTimes();
      setTimeModalOpen(true);
    }
  };

  const handleDelete = async () => {
    if (user) {
      setAllEvents(allEvents.filter((event) => event.id !== idToDelete));
    } else {
      setGuestEvents(guestEvents.filter((event) => event.id !== idToDelete));
    }
    handleCloseModal();
    if (session) {
      deleteCalendarEvent(idToDelete);
    }
    setIdToDelete(null);
  };

  const handleAddEvent = (data) => {
    setShowAddModal(true);
    setNewEvent({
      ...newEvent,
      start: data.date.toISOString(),
      allDay: data.allDay,
      id: new Date().getTime(),
      backgroundColor: "orange",
      borderColor: "orange",
      extendedProps: {
        details: "",
      },
    });
    setGoogleEventDate(data.date);
    getDefaultTimes();
  };

  const handleChange = (value) => {
    setNewEvent({
      ...newEvent,
      title: value,
    });
  };

  const handleSubmit = () => {
    if (session) {
      setGoogleEventTitle(newEvent.title);
      setTimeModalOpen(true);
    }
    if (user) {
      setAllEvents([...allEvents, newEvent]);
    } else {
      setGuestEvents([...guestEvents, newEvent]);
    }
    setShowAddModal(false);
    setNewEvent({ title: "", start: "", id: 0, allDay: false });
  };

  useEffect(() => {
    const updateEventsInFirestore = async () => {
      if (user) {
        const userId = user.id;
        const eventsCollectionRef = collection(
          firestore,
          "users",
          userId,
          "events"
        );

        try {
          // Fetch all events in Firestore
          const querySnapshot = await getDocs(eventsCollectionRef);

          // Delete each event
          const deletePromises = querySnapshot.docs.map((doc) =>
            deleteDoc(doc.ref)
          );
          await Promise.all(deletePromises);

          // Re-upload all the events in `allEvents`
          allEvents?.forEach(async (event) => {
            const docRef = doc(
              firestore,
              "users",
              userId,
              "events",
              event?.id?.toString()
            );

            // Upload the new event to Firestore
            await setDoc(docRef, event);
          });
        } catch (error) {
          console.error("Error updating events in Firestore:", error);
        }
      }
    };

    if (allEvents?.length >= 0) {
      updateEventsInFirestore();
    }
  }, [allEvents, user]);

  // update equipment everytime the user changes or guestEquipment changes
  const updateEvents = async () => {
    if (user) {
      const userId = user.id;
      const docRef = collection(firestore, "users", userId, "events");
      const docs = await getDocs(docRef);
      const events = [];
      docs.forEach((doc) => {
        events.push({ name: doc.id, ...doc.data() });
      });
      setAllEvents(events);
    } else {
      setAllEvents(guestEvents);
    }
  };

  useEffect(() => {
    updateEvents();
  }, [user, guestEvents]);

  // when logging out, setEvents to blank
  useEffect(() => {
    if (!user) {
      setEvents([]);
    }
  }, [user]);

  // Function to handle custom locale mapping
  const getCalendarLocale = (language) => {
    if (language === "cn") {
      return "zh-cn"; // Map 'cn' or 'tc' to 'zh' for Chinese
    }
    if (language === "tc") {
      return "zh-tw";
    }
    if (language === "jp") {
      return "ja";
    }
    if (language === "kr") {
      return "ko";
    }
    return language; // Default to the selected language
  };

  const calendarLocale = getCalendarLocale(i18n.language); // Get the correct locale for FullCalendar

  // Save guest data when sign-in button is clicked
  const handleSignInClick = async () => {
    await saveGuestDataToFirebase();
    router.push("/sign-in"); // Redirect to the sign-in page
  };
  const saveGuestDataToFirebase = async () => {
    const guestDocRef = doc(firestore, "users", "guest");
    // Save guest user data and profile picture
    await setDoc(guestDocRef, { userData: guestData }, { merge: true });
    await setDoc(guestDocRef, { profilePic: guestImage }, { merge: true });
    await setDoc(guestDocRef, { plan: guestPlan }, { merge: true });

    try {
      // Save guest equipment data
      const equipmentCollectionRef = collection(guestDocRef, "equipment");
      for (const item of guestEquipment) {
        const equipmentDocRef = doc(equipmentCollectionRef, item.name);
        await setDoc(equipmentDocRef, {
          count: item.count || 0,
          image: item.image || null,
        });
      }

      // Save guest chat data
      const chatCollectionRef = collection(guestDocRef, "chat");
      const chatDocRef = doc(chatCollectionRef, "en"); // Assuming 'en' is the language
      await setDoc(chatDocRef, {
        messages: guestMessages || [],
        timestamp: new Date().toISOString(),
      });

      // Save events data
      const eventCollectionRef = collection(guestDocRef, "events");
      for (const event of guestEvents) {
        const eventDocRef = doc(eventCollectionRef, event?.id?.toString());
        await setDoc(eventDocRef, event);
      }

      console.log("Guest data saved to Firebase.");
    } catch (error) {
      console.error("Error saving guest data to Firebase:", error);
    }
  };

  let index = 0;

  // Create a large gradient to span the entire calendar height
  const largeGradient =
    "linear-gradient(to bottom, #224061, #433B5F, #6A385C, #923258, #BB2D55)";

  // Function to calculate the event's vertical position in the calendar (week number)
  const getEventVerticalPosition = (startDateStr) => {
    const eventDate = new Date(startDateStr);

    // Calculate which week of the month the event falls in
    const dayOfMonth = eventDate.getDate();
    const weekOfMonth = Math.ceil(dayOfMonth / 7); // Week number (1-5)

    // Total number of weeks in the view (for scaling the gradient)
    return weekOfMonth;
  };

  // google calendar
  const session = useSession();
  const supabase = useSupabaseClient();

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/calendar",
      },
    });
    if (error) {
      alert("Syncing error");
      console.log(error);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const [timeModalOpen, setTimeModalOpen] = useState(false);
  // const [eventData, setEventData] = useState({});

  const [googleEventTitle, setGoogleEventTitle] = useState("");
  const [googleEventDesc, setGoogleEventDesc] = useState("");
  const [googleEventDate, setGoogleEventDate] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const handleStartTimeChange = (e) => setStartTime(e.target.value);
  const handleEndTimeChange = (e) => setEndTime(e.target.value);

  const getDefaultTimes = () => {
    const now = new Date();

    // Calculate the next full hour
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Set to the next hour (00 minutes)

    // Calculate one hour after the next full hour for the end time
    const oneHourLater = new Date(nextHour);
    oneHourLater.setHours(nextHour.getHours() + 1);

    // Format time to be in HH:MM format (24-hour time)
    const formatTime = (date) => {
      return date.toISOString().slice(11, 16); // Extract 'HH:MM' from 'YYYY-MM-DDTHH:MM:SS.sssZ'
    };

    setStartTime(formatTime(nextHour));
    setEndTime(formatTime(oneHourLater));
  };

  const combineDateAndTime = (googleEventDate, start, end) => {
    // Ensure `googleEventDate` is a Date object
    const date = new Date(googleEventDate);

    // Parse the start time (e.g., "18:00")
    const [startHours, startMinutes] = start.split(":").map(Number);

    // Create a new Date object for the start time, setting hours and minutes
    const startDateTime = new Date(date);
    startDateTime.setHours(startHours, startMinutes, 0, 0); // Set hours, minutes, seconds, and milliseconds

    // Parse the end time (e.g., "19:00")
    const [endHours, endMinutes] = end.split(":").map(Number);

    // Create a new Date object for the end time, setting hours and minutes
    const endDateTime = new Date(date);
    endDateTime.setHours(endHours, endMinutes, 0, 0); // Set hours, minutes, seconds, and milliseconds

    // If end time is before start time, it means the event goes past midnight
    if (endDateTime < startDateTime) {
      // Add an extra day to the end time
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    return { startDateTime, endDateTime };
  };

  async function listCalendarEvents() {
    await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + session?.provider_token,
        },
      }
    )
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        const events = data.items;
        setAllEvents(
          events?.map((event) => ({
            id: event.id,
            title: event.summary,
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            allDay: !event.start.dateTime,
            extendedProps: {
              details: event.description || null,
            },
          }))
        );
      });
  }
  useEffect(() => {
    console.log("session refresh");
    listCalendarEvents();
  }, [session]);

  async function createCalendarEvent() {
    console.log(startTime);
    console.log(endTime);
    const { startDateTime, endDateTime } = combineDateAndTime(
      googleEventDate,
      startTime,
      endTime
    );
    console.log(startDateTime);
    console.log(endDateTime);
    const event = {
      summary: googleEventTitle,
      description: googleEventDesc,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
    await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + session.provider_token,
        },
        body: JSON.stringify(event),
      }
    )
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        console.log(data);
      });
    setGoogleEventTitle("");
    setGoogleEventDesc("");
    setGoogleEventDate("");
    setStartTime(new Date());
    setEndTime(new Date());
  }

  async function deleteCalendarEvent(id) {
    await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + session.provider_token,
        },
      }
    );
  }

  return (
    // light/dark theming
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* main box */}
      <Box
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        overflow={"scroll"}
        paddingBottom={isMobile ? "60px" : "0px"}
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
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              height: "90%",
              bgcolor: "background.default",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Stack overflow={"scroll"}>
              <Typography id="event-modal-title" variant="h2" component="h2">
                <ReactMarkdown components={customComponents}>
                  {selectedEvent?.title}
                </ReactMarkdown>
              </Typography>

              <Typography id="event-modal-description" sx={{ mt: 2 }}>
                <ReactMarkdown components={customComponents}>
                  {selectedEvent?.details}
                </ReactMarkdown>
              </Typography>
            </Stack>
            <Stack
              flexDirection="row"
              display="flex"
              justifyContent={"end"}
              gap={1}
            >
              <Button
                onClick={handleCloseModal}
                sx={{
                  justifyContent: "end",
                  right: "2%",
                  backgroundColor: "background.default",
                  color: "text.primary",
                  borderColor: "text.primary",
                  border: "1px",
                  justifyContent: "center",
                  "&:hover": {
                    backgroundColor: "text.primary",
                    color: "background.default",
                    borderColor: "text.primary",
                  },
                }}
              >
                Close
              </Button>
              <Button
                onClick={handleDelete}
                sx={{
                  justifyContent: "end",
                  right: "2%",
                  backgroundColor: "red",
                  color: "white",
                  borderColor: "text.primary",
                  justifyContent: "center",
                  "&:hover": {
                    backgroundColor: "text.primary",
                    color: "background.default",
                    borderColor: "text.primary",
                  },
                }}
              >
                Delete
              </Button>
            </Stack>
          </Box>
        </Modal>
        {/* info modal */}
        <Modal open={openInfoModal} onClose={() => setOpenInfoModal(false)}>
          <Box
            overflow="auto"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 350,
              height: "75%",
              bgcolor: "background.default",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              display: "flex",
              flexDirection: "column",
              borderRadius: "15px",
            }}
          >
            <Typography component="h2" fontWeight="600">
              {t("How to use:")}
            </Typography>
            <Typography sx={{ mt: 2 }}>
              {t(
                "View your custom-crafted workout plan here. Click the top right to see what days your friends are available to workout."
              )}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="outlined"
              onClick={() => {
                setOpenInfoModal(false);
              }}
              sx={{
                mt: 2,
                backgroundColor: "text.primary",
                color: "background.default",
                borderColor: "text.primary",
                "&:hover": {
                  backgroundColor: "darkgray",
                  color: "text.primary",
                  borderColor: "text.primary",
                },
              }}
            >
              {t("Close")}
            </Button>
          </Box>
        </Modal>
        {/* delete modal */}
        <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <Box
            overflow="auto"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              height: 150,
              bgcolor: "background.default",
              borderRadius: 1,
              // border: '2px solid #000',
              boxShadow: 24,
              p: 4,
              gap: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Stack flexDirection="row" gap={2}>
              {/* red triangle */}
              <Box
                sx={{
                  backgroundColor: "#FFCCBB", // Light red background
                  borderRadius: "50%", // Circular shape
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30, // Adjust size as needed
                  height: 30,
                }}
              >
                <WarningIcon sx={{ color: "red", fontSize: "1rem" }} />
              </Box>
              <Stack flexDirection="column" gap={0.5}>
                <Typography sx={{ fontWeight: 550 }}>Delete Event</Typography>
                <Typography sx={{ fontWeight: 200, fontSize: "0.75rem" }}>
                  Are you sure you want to delete this event?
                </Typography>
              </Stack>
            </Stack>
            <Stack
              flexDirection="row"
              display="flex"
              justifyContent={"end"}
              gap={1}
            >
              <Button
                onClick={() => setShowDeleteModal(false)}
                sx={{
                  justifyContent: "end",
                  right: "2%",
                  backgroundColor: "background.default",
                  color: "text.primary",
                  borderColor: "text.primary",
                  border: "1px",
                  justifyContent: "center",
                  "&:hover": {
                    backgroundColor: "text.primary",
                    color: "background.default",
                    borderColor: "text.primary",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                sx={{
                  justifyContent: "end",
                  right: "2%",
                  backgroundColor: "red",
                  color: "white",
                  borderColor: "text.primary",
                  justifyContent: "center",
                  "&:hover": {
                    backgroundColor: "text.primary",
                    color: "background.default",
                    borderColor: "text.primary",
                  },
                }}
              >
                Delete
              </Button>
            </Stack>
          </Box>
        </Modal>
        {/* add modal */}
        <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
          <Box
            overflow="auto"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              height: 250,
              bgcolor: "background.default",
              borderRadius: 1,
              // border: '2px solid #000',
              boxShadow: 24,
              p: 4,
              gap: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Stack
              flexDirection="column"
              gap={2}
              display={"flex"}
              alignItems={"center"}
            >
              {/* green check */}
              <Box
                sx={{
                  backgroundColor: "#90EE90", // Light red background
                  borderRadius: "50%", // Circular shape
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30, // Adjust size as needed
                  height: 30,
                }}
              >
                <CheckIcon sx={{ fontSize: "1rem" }} />
              </Box>
              <Stack
                flexDirection="column"
                gap={0.5}
                display={"flex"}
                alignItems={"center"}
              >
                <Typography sx={{ fontWeight: 550 }}>Add Event</Typography>
                <TextField
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newEvent.title || ""}
                  onChange={(e) => handleChange(e.target.value)}
                  // sx={{ mb: 4 }}
                  placeholder={t("Title")}
                />
              </Stack>
            </Stack>
            <Stack
              flexDirection="row"
              display="flex"
              justifyContent={"space-between"}
              gap={1}
            >
              <Button
                onClick={() => setShowAddModal(false)}
                sx={{
                  width: "50%",
                  justifyContent: "end",
                  right: "2%",
                  backgroundColor: "background.default",
                  color: "text.primary",
                  borderColor: "text.primary",
                  border: "1px",
                  justifyContent: "center",
                  "&:hover": {
                    backgroundColor: "text.primary",
                    color: "background.default",
                    borderColor: "text.primary",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                sx={{
                  width: "50%",
                  justifyContent: "end",
                  right: "2%",
                  backgroundColor: "#90EE90",
                  color: "black",
                  borderColor: "text.primary",
                  justifyContent: "center",
                  "&:hover": {
                    backgroundColor: "text.primary",
                    color: "background.default",
                    borderColor: "text.primary",
                  },
                }}
              >
                Submit
              </Button>
            </Stack>
          </Box>
        </Modal>
        {/* time set modal */}
        <Modal open={timeModalOpen} onClose={() => setTimeModalOpen(false)}>
          <Box
            overflow="auto"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              height: 400,
              bgcolor: "background.default",
              borderRadius: 1,
              boxShadow: 24,
              p: 4,
              gap: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography>Start Time</Typography>
            <TextField
              // Set input type to time and force 24-hour format
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              fullWidth
              margin="normal"
              inputProps={{
                step: 3600, // Set step to 3600 seconds (1 hour)
              }}
            />
            <Typography>End Time</Typography>
            <TextField
              // Set input type to time and force 24-hour format
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              fullWidth
              margin="normal"
              inputProps={{
                step: 3600, // Set step to 3600 seconds (1 hour)
              }}
            />
            <Button
              onClick={() => {
                createCalendarEvent();
                setTimeModalOpen(false);
              }}
              sx={{
                width: "100%",
                justifyContent: "end",
                right: "2%",
                backgroundColor: "#90EE90",
                color: "black",
                borderColor: "text.primary",
                justifyContent: "center",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: "text.primary",
                  color: "background.default",
                  borderColor: "text.primary",
                },
              }}
            >
              Save
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
          <Button
            variant="outlined"
            onClick={handleMenuClick}
            sx={{
              height: "55px",
              fontSize: "1rem",
              backgroundColor: "background.default",
              color: "text.primary",
              borderColor: "background.default",
              borderRadius: "55px",
              "&:hover": {
                backgroundColor: "text.primary",
                color: "background.default",
                borderColor: "text.primary",
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
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem>
              <label htmlFor="upload-ics-file">Import</label>
              <input
                type="file"
                accept=".ics"
                id="upload-ics-file"
                style={{ display: "none" }}
                onChange={handleFileImport}
              />
            </MenuItem>
            <MenuItem onClick={() => handleMenuClose("export")}>
              Export
            </MenuItem>
          </Menu>

          {/*
            {session ? 
            <>
              <Button onClick={()=> signOut()}>Unsync</Button>
            </>
            :
            <>
              <Button onClick={()=> googleSignIn()}>Sync Calendar</Button>
            </>
            }*/}

          {/* title */}
          <Box
            display="flex"
            flexDirection={"row"}
            alignItems={"center"}
            gap={1}
          >
            <Typography
              variant="h6"
              color="text.primary"
              textAlign="center"
              sx={{ fontWeight: "800" }}
            >
              {t("myPlanner")}
            </Typography>
            <Button
              onClick={handleInfoModal}
              sx={{
                minWidth: "auto",
                aspectRatio: "1 / 1",
                borderRadius: "50%",
                width: "20px", // or adjust as needed
                height: "20px", // or adjust as needed
              }}
            >
              <InfoIcon sx={{ color: "lightgray" }} />
            </Button>
          </Box>
          {/* signin button */}
          <Box>
            <Box>
              {!isSignedIn ? (
                <Button
                  color="inherit"
                  onClick={handleSignInClick}
                  sx={{
                    justifyContent: "end",
                    right: "2%",
                    backgroundColor: "background.default",
                    color: "text.primary",
                    borderColor: "text.primary",
                    "&:hover": {
                      backgroundColor: "text.primary",
                      color: "background.default",
                      borderColor: "text.primary",
                    },
                  }}
                >
                  {t("signIn")}
                </Button>
              ) : (
                <UserButton />
              )}
            </Box>
          </Box>
        </Box>
        {isMobile && <Divider />}
        <Stack
          flexDirection="column"
          width="100%"
          height="100%"
          paddingTop={3.5}
        >
          <Stack
            width="100%"
            id="draggable-el"
            // height ="100%"
            // backgroundColor = "background.bubbles"
            flexDirection="column"
            display="flex"
            // alignItems={"center"}
            spacing={2}
            // padding = {2}
            // overflow = "scroll"
            // height = "150px"
            // paddingTop={5}
            paddingBottom={2}
          >
            <Box sx={{ width: isMobile ? "100%" : "auto" }} paddingX={2.5}>
              {" "}
              {/* Full width for the container */}
              <Box
                sx={{
                  width: isMobile ? "250px" : "auto", // Set width explicitly within the container
                  lineHeight: "1",
                }}
              >
                <Typography>
                  {t("Drag and drop workouts into your schedule:")}
                </Typography>
              </Box>
            </Box>
            <Box
              display={"flex"}
              flexDirection={"row"}
              overflow={"scroll"}
              gap={isMobile ? 1 : 2.5}
              paddingLeft={2.5}
            >
              {events.map((event) => {
                const gradientBackgrounds = [
                  "linear-gradient(90deg, #224061 50%, #433B5F 100%)",
                  "linear-gradient(90deg, #433B5F 50%, #6A385C 100%)",
                  "linear-gradient(90deg, #6A385C 50%, #923258 100%)",
                  "linear-gradient(90deg, #923258 25%, #BB2D55 100%)",
                  "linear-gradient(270deg, #923258 25%, #BB2D55 100%)",
                  "linear-gradient(270deg, #6A385C 50%, #923258 100%)",
                  "linear-gradient(270deg, #433B5F 50%, #6A385C 100%)",
                  "linear-gradient(270deg, #224061 50%, #433B5F 100%)",
                ];

                const eventBackground =
                  gradientBackgrounds[index % gradientBackgrounds.length]; // Cycle through the gradients
                index = index + 1;

                return (
                  <Box
                    className="fc-event"
                    title={event.title}
                    key={event.id}
                    // width = "200px"
                    // height =  "60px"
                    padding={1}
                    borderRadius={3}
                    whiteSpace={isMobile ? "nowrap" : ""}
                    sx={{
                      fontFamily: "Gilroy, sans-serif",
                      background: eventBackground,
                      color: "white",
                    }} // Ensure font is applied here too
                  >
                    <Typography sx={{ fontWeight: "700" }}>
                      {event.title}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Stack>
          <Box
            width="100%"
            height="100%"
            overflow="scroll"
            backgroundColor="background.default"
            marginTop={3.5}
            paddingX={2.5}
          >
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, tiemGridPlugin]}
              headerToolbar={{
                // left: 'prev,next today',
                // center: 'title',
                // right: 'dayGridMonth timeGridWeek'
                left: "title",
                right: "prev next",
              }}
              events={allEvents}
              nowIndicator={true}
              editable={true}
              droppable={true}
              selectable={true}
              selectMirror={true}
              drop={(data) => addEvent(data)}
              eventDrop={(data) => handleEventDrop(data)}
              eventClick={(data) => handleEventClick(data)}
              dateClick={(data) => handleAddEvent(data)}
              aspectRatio={isMobile ? 1.1 : 2.5}
              locales={allLocales}
              locale={calendarLocale}
              // eventBackgroundColor='#224061'
              // eventBackground='linear-gradient(90deg, #224061 50%, #433B5F 100%)' // Default background color for all events
              // eventTextColor="white" // Default text color for all events
              /* Use eventDidMount to apply the gradient based on vertical position */
              /* Use eventDidMount to apply the gradient based on vertical position */
              eventDidMount={(info) => {
                const eventElement = info.el;
                const startDate = info.event.startStr; // ISO string of the event's start date

                // Check if the event has a predefined backgroundColor (orange for clicked/imported events)
                if (!info.event.backgroundColor) {
                  // Get the vertical position (week number) of the event
                  const weekOfMonth = getEventVerticalPosition(startDate);

                  // Calculate the portion of the gradient to show based on the week number
                  const gradientPosition = `${(weekOfMonth - 1) * 20}% ${
                    weekOfMonth * 20
                  }%`;

                  // Apply the gradient to the event with a clipped portion
                  eventElement.style.background = `${largeGradient}`;
                  eventElement.style.backgroundPosition = gradientPosition;
                  eventElement.style.backgroundSize = "100% 500%"; // Ensure the gradient is scaled across weeks
                  eventElement.style.color = "white"; // Make sure the text is visible
                } else {
                  // If the event already has a backgroundColor, keep it as is
                  eventElement.style.backgroundColor =
                    info.event.backgroundColor;
                }
              }}
              /* Add logic to change the circle color for today */
              dayCellDidMount={(info) => {
                const dayElement = info.el;
                const date = info.date; // The date object for the day

                // Calculate which week this day belongs to (for example purposes, week starts on Sunday)
                const weekOfMonth = Math.ceil(
                  (date.getDate() +
                    new Date(date.getFullYear(), date.getMonth(), 1).getDay()) /
                    7
                );

                // Get the corresponding color from the gradient (you could also use a pre-defined set of colors based on week number)
                const gradientColors = [
                  "#224061",
                  "#433B5F",
                  "#6A385C",
                  "#923258",
                  "#BB2D55",
                ];
                const colorForWeek = gradientColors[weekOfMonth - 1]; // Select color based on week

                // Apply the color only to the circle around the date number (for the current day)
                if (dayElement.classList.contains("fc-day-today")) {
                  const dateNumberElement = dayElement.querySelector(
                    ".fc-daygrid-day-number"
                  );
                  if (dateNumberElement) {
                    dateNumberElement.style.border = `2px solid ${colorForWeek}`;
                    dateNumberElement.style.backgroundColor = `${colorForWeek}`;
                  }
                }
              }}
              dayHeaderFormat={{ weekday: "narrow" }}
            />
          </Box>
        </Stack>
      </Box>
    </ThemeProvider>
  );
};
export default PlanPage;
