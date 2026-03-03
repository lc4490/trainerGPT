"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  ThemeProvider,
  CssBaseline,
  Modal,
  Stack,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { firestore } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { UserButton, useUser } from "@clerk/nextjs";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import InfoIcon from "@mui/icons-material/Info";
import MenuIcon from "@mui/icons-material/Menu";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import tiemGridPlugin from "@fullcalendar/timegrid";
import WarningIcon from "@mui/icons-material/Warning";
import CheckIcon from "@mui/icons-material/Check";
import allLocales from "@fullcalendar/core/locales-all";
import { lightTheme, darkTheme } from "../theme";
import { customComponents } from "../customMarkdownComponents";

const PlanPage = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { user } = useUser();
  const [prefLanguage, setPrefLanguage] = useState("");
  const [plan, setPlan] = useState("");
  const [planExpanded, setPlanExpanded] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
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
        { merge: true },
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

  // theming
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);
  const theme = darkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = (action) => {
    if (action === "export") exportEvents();
    setAnchorEl(null);
  };

  // ICS import
  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const icsData = e.target.result;
      const response = await fetch("/api/ical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icsData }),
      });
      const { events } = await response.json();
      const modifiedEvents = events.map((ev) => ({
        ...ev,
        id: ev.id || new Date().getTime().toString() + Math.random(),
        backgroundColor: "orange",
      }));
      setAllEvents([...allEvents, ...modifiedEvents]);
    };
    reader.readAsText(file);
  };

  // ICS export
  const exportEvents = () => {
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//TrainerGPT//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n`;
    allEvents.forEach((event) => {
      const { title, start, end, allDay, extendedProps } = event;
      const startDate =
        new Date(start).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const endDate = end
        ? new Date(end).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
        : null;
      icsContent += `BEGIN:VEVENT\n`;
      icsContent += `SUMMARY:${title}\n`;
      icsContent += `UID:${event.id}@trainergpt.com\n`;
      icsContent += `DTSTAMP:${
        new Date().toISOString().replace(/[-:]/g, "").split(".")[0]
      }Z\n`;
      icsContent += `DTSTART:${startDate}\n`;
      if (endDate) icsContent += `DTEND:${endDate}\n`;
      if (allDay) icsContent += `X-MICROSOFT-CDO-ALLDAYEVENT:TRUE\n`;
      if (extendedProps?.details) {
        icsContent += `DESCRIPTION:${extendedProps.details.replace(
          /\n/g,
          "\\n",
        )}\n`;
      }
      icsContent += `END:VEVENT\n`;
    });
    icsContent += `END:VCALENDAR`;
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "workout-plan.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // plan fetch
  const getPlan = async () => {
    if (user) {
      const userId = user.id;
      const userDocRef = doc(firestore, "users", userId);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().plan : null;
    }
    return null;
  };

  // parse plan text into draggable event objects
  const parsePlanToEvents = (planText) => {
    const normalized = planText
      .replace(/^\uFEFF/, "")
      .replace(/\r\n?/g, "\n")
      .replace(/\*\*/g, "");
    const days = normalized
      .split(/(?=^\s*day\s*\d+\s*[:：])/gim)
      .filter((s) => /^\s*day\s*\d+\s*[:：]/i.test(s));
    const evts = days.map((day) => {
      const [firstLine, ...rest] = day.trim().split("\n");
      const m = firstLine.match(/^\s*day\s*(\d+)\s*[:：]\s*(.+)$/i);
      const title = m
        ? m[2].trim()
        : firstLine.split(/[:：]/).slice(1).join(":").trim() ||
          firstLine.trim();
      const details = rest.join("\n").trim();
      return { title, details };
    });
    setEvents(evts);
  };

  useEffect(() => {
    const fetchPlan = async () => {
      const fetchedPlan = await getPlan();
      setPlan(fetchedPlan);
      if (fetchedPlan) parsePlanToEvents(fetchedPlan);
    };
    fetchPlan();
  }, [user]);

  // event state
  const eventsLoaded = useRef(false);
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: "",
    id: 0,
    allDay: false,
  });
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventClick = (data) => {
    setSelectedEvent({
      title: data.event.title,
      details: data.event.extendedProps.details,
    });
    setIdToDelete(data.event.id);
  };
  const handleCloseModal = () => setSelectedEvent(null);

  // re-drop within calendar
  const handleEventDrop = (dropInfo) => {
    const { event } = dropInfo;
    const updatedEvent = {
      id: event.id,
      title: event.title,
      start: event.start.toISOString(),
      end: event.end ? event.end.toISOString() : null,
      backgroundColor: event.backgroundColor,
      allDay: event.allDay,
      extendedProps: { details: event.extendedProps.details },
    };
    setAllEvents([
      ...allEvents.filter((e) => String(e.id) !== String(updatedEvent.id)),
      updatedEvent,
    ]);
  };

  const handleDelete = async () => {
    setAllEvents(
      allEvents.filter((ev) => String(ev.id) !== String(idToDelete)),
    );
    handleCloseModal();
    setIdToDelete(null);
  };

  // date-click on calendar → add custom event
  const handleAddEvent = (data) => {
    setNewEvent({
      title: "",
      start: data.date.toISOString(),
      allDay: data.allDay,
      id: new Date().getTime(),
      backgroundColor: "orange",
      borderColor: "orange",
      extendedProps: { details: "" },
    });
    setShowAddModal(true);
  };

  // workout card click → pre-fill add modal
  const handleWorkoutCardClick = (workoutEvent) => {
    setNewEvent({
      title: workoutEvent.title,
      start: new Date().toISOString(),
      id: new Date().getTime(),
      allDay: true,
      extendedProps: { details: workoutEvent.details },
    });
    setShowAddModal(true);
  };

  const handleChange = (value) => {
    setNewEvent({ ...newEvent, title: value });
  };
  const handleSubmit = () => {
    setAllEvents([...allEvents, newEvent]);
    setShowAddModal(false);
    setNewEvent({ title: "", start: "", id: 0, allDay: false });
  };

  // Firestore sync for calendar events
  useEffect(() => {
    const updateEventsInFirestore = async () => {
      if (user) {
        const userId = user.id;
        const eventsCollectionRef = collection(
          firestore,
          "users",
          userId,
          "events",
        );
        try {
          const querySnapshot = await getDocs(eventsCollectionRef);
          const deletePromises = querySnapshot.docs.map((d) =>
            deleteDoc(d.ref),
          );
          await Promise.all(deletePromises);
          allEvents?.forEach(async (event) => {
            const docRef = doc(
              firestore,
              "users",
              userId,
              "events",
              event?.id?.toString(),
            );
            await setDoc(docRef, event);
          });
        } catch (error) {
          console.error("Error updating events in Firestore:", error);
        }
      }
    };
    if (eventsLoaded.current) updateEventsInFirestore();
  }, [allEvents, user]);

  const updateEvents = async () => {
    if (user) {
      const userId = user.id;
      const colRef = collection(firestore, "users", userId, "events");
      const docs = await getDocs(colRef);
      const evts = [];
      docs.forEach((d) => evts.push({ name: d.id, ...d.data() }));
      setAllEvents(evts);
      eventsLoaded.current = true;
    }
  };
  useEffect(() => {
    updateEvents();
  }, [user]);

  const getCalendarLocale = (language) => {
    if (language === "cn") return "zh-cn";
    if (language === "tc") return "zh-tw";
    if (language === "jp") return "ja";
    if (language === "kr") return "ko";
    return language;
  };
  const calendarLocale = getCalendarLocale(i18n.language);

  let gradientIndex = 0;
  const GRAD = "linear-gradient(90deg, #E53935, #FB8C00)";
  const gradientBackgrounds = [
    "linear-gradient(90deg, #E53935 0%, #FB8C00 100%)",
    "linear-gradient(90deg, #C62828 0%, #E53935 100%)",
    "linear-gradient(90deg, #E53935 0%, #FF7043 100%)",
    "linear-gradient(90deg, #FB8C00 0%, #E53935 100%)",
    "linear-gradient(90deg, #FF7043 0%, #FB8C00 100%)",
    "linear-gradient(90deg, #E53935 0%, #EF6C00 100%)",
    "linear-gradient(90deg, #EF5350 0%, #FB8C00 100%)",
    "linear-gradient(90deg, #D32F2F 0%, #E53935 100%)",
  ];

  // info modal
  const [openInfoModal, setOpenInfoModal] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        overflow="scroll"
        paddingBottom={isMobile ? "60px" : "0px"}
      >
        {/* ── Event detail modal ── */}
        <Modal open={!!selectedEvent} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              height: "90%",
              bgcolor: "background.default",
              border: "none",
              borderRadius: 3,
              boxShadow: 24,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* gradient accent */}
            <Box sx={{ height: "4px", background: GRAD, flexShrink: 0 }} />
            <Stack sx={{ p: 4, flex: 1, overflow: "auto" }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                <ReactMarkdown components={customComponents}>
                  {selectedEvent?.title}
                </ReactMarkdown>
              </Typography>
              <Typography component="div" sx={{ mt: 2 }}>
                <ReactMarkdown components={customComponents}>
                  {selectedEvent?.details}
                </ReactMarkdown>
              </Typography>
            </Stack>
            <Stack
              flexDirection="row"
              justifyContent="flex-end"
              gap={1}
              sx={{ px: 4, pb: 3, flexShrink: 0 }}
            >
              <Button
                onClick={handleCloseModal}
                variant="outlined"
                sx={{
                  color: "text.primary",
                  borderColor: "text.primary",
                  "&:hover": {
                    bgcolor: "text.primary",
                    color: "background.default",
                  },
                }}
              >
                {t("Close")}
              </Button>
              <Button
                onClick={handleDelete}
                sx={{
                  background: GRAD,
                  color: "white",
                  "&:hover": { opacity: 0.85 },
                }}
              >
                {t("Delete")}
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* ── Info modal ── */}
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
              border: "none",
              borderRadius: 3,
              boxShadow: 24,
              p: 4,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography fontWeight={700}>{t("How to use:")}</Typography>
            <Typography sx={{ mt: 2 }}>
              {t(
                "View your custom workout plan and click any workout card to add it to your calendar. Click a date on the calendar to add a custom event.",
              )}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              variant="outlined"
              onClick={() => setOpenInfoModal(false)}
              sx={{
                mt: 2,
                bgcolor: "text.primary",
                color: "background.default",
                borderColor: "text.primary",
                "&:hover": { bgcolor: "darkgray" },
              }}
            >
              {t("Close")}
            </Button>
          </Box>
        </Modal>

        {/* ── Add event modal ── */}
        <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.default",
              border: "none",
              borderRadius: 3,
              boxShadow: 24,
              p: 4,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Stack flexDirection="row" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  background: GRAD,
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CheckIcon sx={{ fontSize: "1rem", color: "white" }} />
              </Box>
              <Typography fontWeight={700}>{t("Add Event")}</Typography>
            </Stack>
            <TextField
              type="text"
              fullWidth
              variant="outlined"
              size="small"
              value={newEvent.title || ""}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={t("Title")}
            />
            <Stack flexDirection="row" justifyContent="space-between" gap={1}>
              <Button
                onClick={() => setShowAddModal(false)}
                variant="outlined"
                sx={{
                  flex: 1,
                  color: "text.primary",
                  borderColor: "text.primary",
                  "&:hover": {
                    bgcolor: "text.primary",
                    color: "background.default",
                  },
                }}
              >
                {t("Cancel")}
              </Button>
              <Button
                onClick={handleSubmit}
                sx={{
                  flex: 1,
                  background: GRAD,
                  color: "white",
                  "&:hover": { opacity: 0.85 },
                }}
              >
                {t("Add")}
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* ── Header ── */}
        <Box
          bgcolor="background.default"
          display="flex"
          justifyContent="space-between"
          paddingX={2.5}
          paddingY={1.25}
          alignItems="center"
          sx={{
            borderBottom: "1px solid",
            borderColor: darkMode
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.07)",
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleMenuClick}
            sx={{
              height: "44px",
              minWidth: "44px",
              bgcolor: "background.default",
              color: "text.primary",
              borderColor: "divider",
              borderRadius: "22px",
              "&:hover": {
                bgcolor: "text.primary",
                color: "background.default",
              },
            }}
          >
            <MenuIcon />
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <MenuItem>
              <label htmlFor="upload-ics-file" style={{ cursor: "pointer" }}>
                {t("Import")}
              </label>
              <input
                type="file"
                accept=".ics"
                id="upload-ics-file"
                style={{ display: "none" }}
                onChange={handleFileImport}
              />
            </MenuItem>
            <MenuItem onClick={() => handleMenuClose("export")}>
              {t("Export")}
            </MenuItem>
          </Menu>

          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.1rem",
                background: GRAD,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: '"Gilroy", "Arial", sans-serif',
              }}
            >
              {t("myPlanner")}
            </Typography>
            <Button
              onClick={() => setOpenInfoModal(true)}
              sx={{
                minWidth: "auto",
                width: 28,
                height: 28,
                borderRadius: "50%",
                p: 0,
              }}
            >
              <InfoIcon sx={{ color: "text.disabled", fontSize: "1.1rem" }} />
            </Button>
          </Box>

          <UserButton />
        </Box>

        {/* ── Collapsible plan text panel ── */}
        {plan && (
          <Box
            sx={{
              mx: 2.5,
              mt: 2.5,
              // border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              onClick={() => setPlanExpanded((p) => !p)}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
                py: 1.5,
                cursor: "pointer",
                bgcolor: "background.paper",
                "&:hover": { opacity: 0.85 },
              }}
            >
              <Typography fontWeight={700}>{t("Your Plan")}</Typography>
              {planExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            <Box
              sx={{
                maxHeight: planExpanded ? "400px" : 0,
                overflow: "auto",
                transition: "max-height 0.3s ease",
                px: 2,
                pb: planExpanded ? 2 : 0,
              }}
            >
              <ReactMarkdown components={customComponents}>
                {plan}
              </ReactMarkdown>
            </Box>
          </Box>
        )}

        <Stack flexDirection="column" width="100%" height="100%" paddingTop={3}>
          {/* ── Workout cards ── */}
          <Stack
            width="100%"
            flexDirection="column"
            spacing={1.5}
            paddingBottom={2}
          >
            <Box paddingX={2.5}>
              <Typography
                color="text.secondary"
                fontSize="0.8rem"
                fontWeight={600}
                textTransform="uppercase"
                letterSpacing={0.5}
              >
                {t("Click a workout to add it to your calendar:")}
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="row"
              overflow="scroll"
              gap={isMobile ? 1 : 1.5}
              paddingLeft={2.5}
              paddingRight={2.5}
            >
              {events.map((event) => {
                const bg =
                  gradientBackgrounds[
                    gradientIndex++ % gradientBackgrounds.length
                  ];
                return (
                  <Box
                    key={event.title}
                    onClick={() => handleWorkoutCardClick(event)}
                    padding={1.5}
                    borderRadius={3}
                    whiteSpace={isMobile ? "nowrap" : "normal"}
                    sx={{
                      background: bg,
                      color: "white",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                      transition: "transform 0.15s",
                      userSelect: "none",
                      "&:hover": { transform: "scale(1.04)" },
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                      {event.title}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Stack>

          {/* ── Calendar ── */}
          <Box
            width="100%"
            height="100%"
            overflow="scroll"
            marginTop={3}
            paddingX={2.5}
          >
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin, tiemGridPlugin]}
              headerToolbar={{ left: "title", right: "prev next" }}
              events={allEvents}
              nowIndicator={true}
              editable={true}
              selectable={true}
              selectMirror={true}
              eventDrop={(data) => handleEventDrop(data)}
              eventClick={(data) => handleEventClick(data)}
              dateClick={(data) => handleAddEvent(data)}
              aspectRatio={isMobile ? 1.1 : 2.5}
              locales={allLocales}
              locale={calendarLocale}
              eventDidMount={(info) => {
                const el = info.el;
                if (!info.event.backgroundColor) {
                  el.style.background = GRAD;
                  el.style.color = "white";
                  el.style.border = "none";
                } else {
                  el.style.backgroundColor = info.event.backgroundColor;
                }
              }}
              dayCellDidMount={(info) => {
                const el = info.el;
                const date = info.date;
                const weekOfMonth = Math.ceil(
                  (date.getDate() +
                    new Date(date.getFullYear(), date.getMonth(), 1).getDay()) /
                    7,
                );
                const color = "#E53935";
                if (el.classList.contains("fc-day-today")) {
                  const num = el.querySelector(".fc-daygrid-day-number");
                  if (num) {
                    num.style.background = color;
                    num.style.color = "white";
                    num.style.borderRadius = "50%";
                    num.style.width = "28px";
                    num.style.height = "28px";
                    num.style.display = "flex";
                    num.style.alignItems = "center";
                    num.style.justifyContent = "center";
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
