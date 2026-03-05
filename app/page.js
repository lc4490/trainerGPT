"use client";

// base imports
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  createTheme,
  CssBaseline,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Stack,
  ThemeProvider,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { firestore } from "./firebase";
// import icons
import { CalendarToday, FitnessCenter, Person } from "@mui/icons-material";
import HomeIcon from "@mui/icons-material/Home";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
// import pages
import EquipmentPage from "./pages/EquipmentPage";
import MyInfoPage from "./pages/MyInfoPage";
import NutritionPage from "./pages/NutritionPage";
import PaywallPageWithStripe from "./pages/PaywallPage";
import PlanPage from "./pages/PlanPage";
import TrainerGPTPage from "./pages/TrainerGPTPage";
// use translation
import { useTranslation } from "react-i18next";
import i18n from "./i18n";
// clerk
import { UserButton, useUser } from "@clerk/nextjs";
// stripe
// router
import Link from "next/link";
import { useSearchParams } from "next/navigation";
// tutorial
import JoyRide, { STATUS } from "react-joyride";

import Loading from "./Loading";
import StepForm from "./StepForm";
import { steps } from "./steps";

// light/dark themes
const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#ffffff",
      paper: "#ffffff",
      bubbles: "lightgray",
      userBubble: "#95EC69",
      link: "darkblue",
    },
    text: {
      primary: "#000000",
    },
  },
});
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#121212",
      bubbles: "#2C2C2C",
      userBubble: "#29B560",
      link: "lightblue",
    },
    text: {
      primary: "#ffffff",
    },
  },
});

export const GuestContext = createContext();

// google calendar
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qjbowyszwgmfuebxhotn.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqYm93eXN6d2dtZnVlYnhob3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwOTU0MjEsImV4cCI6MjA0NDY3MTQyMX0.P_oqYr2EA9RkBBTjkafYLzwwdMnIR9o03cErVokXvyg",
);

export default function Home() {
  const searchParams = useSearchParams();
  // use translation
  const { t } = useTranslation();
  // user
  const { user, isLoaded, isSignedIn } = useUser(); // Clerk hook to get the current user
  // local storage
  const [localData, setLocalData] = useState({});
  const [localImage, setLocalImage] = useState("");
  const [localEquipment, setLocalEquipment] = useState([]);
  const [localMessages, setLocalMessages] = useState([]);
  const [localPlan, setLocalPlan] = useState("");
  const [localEvents, setLocalEvents] = useState([]);

  // light/dark theme
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);
  const currentTheme = darkMode ? darkTheme : lightTheme;

  // bottom nav helper
  const [value, setValue] = useState(0);

  // premium mode
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  // handle payment, check if user has premium
  useEffect(() => {
    if (isLoaded && user) {
      const fetchPremiumMode = async () => {
        const userDocRef = doc(firestore, "users", user.id);
        const userDoc = await getDoc(userDocRef);
        setHasPremiumAccess(
          userDoc.exists() && userDoc.data().premium === true,
        );
      };
      fetchPremiumMode();

      const setPremiumMode = async () => {
        if (user) {
          try {
            const userDocRef = doc(firestore, "users", user.id);
            await setDoc(userDocRef, { premium: true }, { merge: true });
          } catch (error) {
            console.error("Error setting premium mode:", error);
          }
        } else {
          console.warn("No user found, unable to update premium status");
        }
      };

      const checkSession = async () => {
        const session_id = searchParams.get("session_id");
        if (session_id) {
          try {
            const response = await fetch(
              `/api/checkout_sessions?session_id=${session_id}`,
            );
            const session = await response.json();
            if (session && session.payment_status === "paid") {
              await setPremiumMode();
              setHasPremiumAccess(true);
            }
          } catch (error) {
            console.error("Error checking session:", error);
          }
        }
      };
      checkSession();
    } else {
      setHasPremiumAccess(false);
    }
  }, [isLoaded, user, searchParams]);

  // pages
  const pages = [
    <MyInfoPage key="myInfo" setValue={setValue} />,
    <EquipmentPage key="equipment" />,
    <TrainerGPTPage key="trainerGPT" setValue={setValue} />,
    // <NutritionPage key = "nutrition" />,
    <SessionContextProvider key="plan" supabaseClient={supabase}>
      <PlanPage />
    </SessionContextProvider>,
    hasPremiumAccess ? (
      <NutritionPage key="nutrition" />
    ) : (
      <PaywallPageWithStripe key="paywall" />
    ),
  ];

  // tutorial
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Multi-language implementation
  const [prefLanguage, setPrefLanguage] = useState("");

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setPrefLanguage(newLanguage);
    changeLanguage(newLanguage);
  };

  useEffect(() => {
    const userLanguage = navigator.language || navigator.languages[0]; // Get the preferred language
    // console.log(userLanguage)
    setPrefLanguage(getLanguage(userLanguage));
    i18n.changeLanguage(getLanguage(userLanguage));

    // Optional: Automatically change the app's language based on the detected language
    // i18n.changeLanguage(userLanguage.split('-')[0]); // Changes language to the detected one (e.g., 'en' from 'en-US')
  }, []);

  // Function to handle custom locale mapping
  const getLanguage = (language) => {
    if (language === "zh-CN") {
      return "cn"; // Map 'cn' or 'tc' to 'zh' for Chinese
    }
    if (language === "zh-TW") {
      return "tc";
    }
    if (language === "ja-JP") {
      return "jp";
    }
    if (language === "ko-KR") {
      return "kr";
    }
    return language.split("-")[0]; // Default to the selected language
  };

  const isMobile = useMediaQuery("(max-width:600px)"); // Adjust the max-width as necessary

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
    setFormData({ ...formData, [key]: value });
  };

  // Save user form data to Firestore
  const saveUserData = async (data) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.id);
      await setDoc(userDocRef, { userData: data }, { merge: true });
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
      Sex: data["Tell Us About Yourself"] || t("Not available"),
      Age: data["How Old Are You?"] || t("Not available"),
      Weight: data["What is Your Weight?"] + weightUnit || t("Not available"),
      Height: data["What is Your Height?"] + heightUnit || t("Not available"),
      Goals: data["What is Your Goal?"] || t("Not available"),
      Activity: data["Physical Activity Level?"] || t("Not available"),
      "Health issues":
        data["Do you have any existing health issues or injuries?"] ||
        t("Not available"),
      Availability:
        data[t("How many days a week can you commit to working out?")] || "1",
    };
    return ret;
  }

  // Handle enter key
  const handleKeyPressStep = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (currentStep === steps.length - 1) {
        handleSubmit();
      } else {
        nextStep();
      }
    }
  };

  // State to manage weight and unit
  const [weightUnit, setWeightUnit] = useState("kg"); // Default to kg

  const handleWeightUnitChange = (_event, newUnit) => {
    if (newUnit !== null) {
      setWeightUnit(newUnit);

      // Convert the weight if a value is already entered
      if (formData["What is Your Weight?"]) {
        const currentWeight = parseFloat(formData["What is Your Weight?"]);
        const convertedWeight =
          newUnit === "lbs"
            ? (currentWeight * 2.20462).toFixed(1) // kg to lbs
            : (currentWeight / 2.20462).toFixed(1); // lbs to kg
        setFormData({ ...formData, "What is Your Weight?": convertedWeight });
      }
    }
  };

  // state to manage height and unit
  const [heightUnit, setHeightUnit] = useState("cm"); // Default to cm
  const handleHeightUnitChange = (_event, newUnit) => {
    if (newUnit !== null) {
      setHeightUnit(newUnit);

      // Convert the height if a value is already entered
      if (formData["What is Your Height?"]) {
        let convertedHeight = "";
        if (newUnit === "ft/in") {
          // Convert cm to feet/inches
          const totalInches =
            parseFloat(formData["What is Your Height?"]) / 2.54;
          const feet = Math.floor(totalInches / 12);
          const inches = Math.round(totalInches % 12);
          convertedHeight = `${feet}'${inches}"`;
        } else {
          // Convert feet/inches to cm
          const heightParts =
            formData["What is Your Height?"].match(/(\d+)'(\d+)"/);
          if (heightParts) {
            const feet = parseInt(heightParts[1], 10);
            const inches = parseInt(heightParts[2], 10);
            convertedHeight = ((feet * 12 + inches) * 2.54).toFixed(1); // Convert to cm
          }
        }
        setFormData({
          ...formData,
          "What is Your Height?": convertedHeight,
          heightUnit: newUnit,
        });
      } else {
        setFormData({
          ...formData,
          heightUnit: newUnit,
        });
      }
    }
  };

  const handleFeetChange = (value) => {
    const [, inches] = formData["What is Your Height?"]?.split("'") || ["", ""];
    setFormData((prevFormData) => ({
      ...prevFormData,
      ["What is Your Height?"]: `${value || 0}'${inches.replace('"', "") || 0}"`, // Update only feet
    }));
  };

  const handleInchesChange = (value) => {
    const limitedInches = Math.min(parseInt(value, 10), 11); // Ensure inches are capped at 12
    const [feet] = formData["What is Your Height?"]?.split("'") || ["", ""];
    setFormData((prevFormData) => ({
      ...prevFormData,
      ["What is Your Height?"]: `${feet || 0}'${limitedInches || 0}"`, // Update only inches
    }));
  };

  const [feet, inches] =
    formData["What is Your Height?"] &&
    typeof formData["What is Your Height?"] === "string" &&
    formData["What is Your Height?"].includes("'")
      ? formData["What is Your Height?"]?.split("'") || ["", ""]
      : ["", ""];

  // upon user change, get prefLanguage and also data
  useEffect(() => {
    const initializeData = async () => {
      // use local cache to avoid extra Firebase reads on re-render
      if (localData.Age && localMessages.length > 0) {
        setFormData(localData);
        setIsSummary(true);
        setLoading(false);
      }
      if (isLoaded) {
        if (user) {
          const userId = user.id;
          const userDocRef = doc(firestore, "users", userId);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists() ? userDoc.data().userData : null) {
            setIsSummary(true);
          }
        }
        setLoading(false);
      }
    };

    initializeData();
  }, [user, isLoaded, localData, localMessages.length]);

  // Track whether the tutorial has been completed
  const [isTutorialComplete, setIsTutorialComplete] = useState(false);

  // Check if the user has completed the tutorial before
  useEffect(() => {
    const checkTutorialStatus = async () => {
      if (user) {
        // If user is logged in, fetch from Firestore
        const userDocRef = doc(firestore, "users", user.id);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().tutorialComplete) {
          setIsTutorialComplete(true); // Set to true if tutorialComplete is true in Firestore
        }
      }
    };

    checkTutorialStatus();
  }, [user]);

  // When tutorial completes, mark it as complete
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setIsTutorialComplete(true);

      if (user) {
        // If user is logged in, save to Firestore
        const userDocRef = doc(firestore, "users", user.id);
        setDoc(userDocRef, { tutorialComplete: true }, { merge: true });
      }
    }
  };

  if (loading) {
    return (
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Loading t={t} />
      </Box>
    );
  }

  return (
    <GuestContext.Provider
      value={{
        localData,
        setLocalData,
        localImage,
        setLocalImage,
        localEquipment,
        setLocalEquipment,
        localMessages,
        setLocalMessages,
        localPlan,
        setLocalPlan,
        localEvents,
        setLocalEvents,
      }}
    >
      {/* light/dark mode */}
      <ThemeProvider theme={currentTheme}>
        <CssBaseline />
        {user ? (
          <>
            {mounted && !isTutorialComplete && isSummary && (
              <JoyRide
                continuous
                callback={handleJoyrideCallback}
                run={true}
                steps={[
                  {
                    title: "Welcome to trAIner 👋",
                    content: (
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {t(
                          "You're all set. Let's take a quick look at what's inside.",
                        )}
                      </Typography>
                    ),
                    placement: "center",
                    target: "body",
                    locale: {
                      skip: <strong>{t("Skip Tour")}</strong>,
                      next: t("Next"),
                    },
                  },
                  {
                    title: t("Personal Information"),
                    content: (
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {t(
                          "View and update your fitness profile — age, weight, goals, and more.",
                        )}
                      </Typography>
                    ),
                    placement: "auto",
                    target: "#myinfo-step",
                    locale: {
                      skip: <strong>{t("Skip Tour")}</strong>,
                      next: t("Next"),
                      back: t("Back"),
                    },
                  },
                  {
                    title: t("Log Equipment"),
                    content: (
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {t(
                          "Tell us what gear you have. Your AI plan adapts to exactly what's available to you.",
                        )}
                      </Typography>
                    ),
                    placement: "auto",
                    target: "#equipment-step",
                    locale: {
                      skip: <strong>{t("Skip Tour")}</strong>,
                      next: t("Next"),
                      back: t("Back"),
                    },
                  },
                  {
                    title: t("Get a Workout Plan"),
                    content: (
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {t(
                          "Chat with your AI coach and get a personalized workout plan built around your goals.",
                        )}
                      </Typography>
                    ),
                    placement: "auto",
                    target: "#trainer-step",
                    locale: {
                      skip: <strong>{t("Skip Tour")}</strong>,
                      next: t("Next"),
                      back: t("Back"),
                    },
                  },
                  {
                    title: t("Make Your Plan"),
                    content: (
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {t(
                          "Schedule your sessions on the calendar and keep your training consistent.",
                        )}
                      </Typography>
                    ),
                    placement: "auto",
                    target: "#plan-step",
                    locale: {
                      skip: <strong>{t("Skip Tour")}</strong>,
                      next: t("Next"),
                      back: t("Back"),
                    },
                  },
                  {
                    title: t("Nutrition & Recipes"),
                    content: (
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {t(
                          "Log your pantry and get AI-generated recipes tailored to what you have. Premium feature.",
                        )}
                      </Typography>
                    ),
                    placement: "auto",
                    target: "#pantry-step",
                    locale: {
                      skip: <strong>{t("Skip Tour")}</strong>,
                      back: t("Back"),
                      last: t("Done"),
                    },
                  },
                ]}
                hideCloseButton
                scrollToFirstStep
                showSkipButton
                showProgress
                spotlightPadding={4}
                styles={{
                  options: {
                    arrowColor: currentTheme.palette.background.paper,
                    backgroundColor: currentTheme.palette.background.paper,
                    overlayColor: darkMode
                      ? "rgba(0,0,0,0.65)"
                      : "rgba(0,0,0,0.4)",
                    primaryColor: "#E53935",
                    textColor: currentTheme.palette.text.primary,
                    zIndex: 1000,
                  },
                  buttonNext: {
                    background: "linear-gradient(90deg, #E53935, #FB8C00)",
                    color: "white",
                    borderRadius: "999px",
                    border: "none",
                    padding: "8px 20px",
                    fontWeight: "bold",
                  },
                  buttonBack: {
                    color: currentTheme.palette.text.secondary,
                  },
                  buttonSkip: {
                    color: currentTheme.palette.text.secondary,
                  },
                  tooltip: {
                    borderRadius: "12px",
                    boxShadow: currentTheme.shadows[4],
                    padding: "20px",
                    maxWidth: "300px",
                  },
                  tooltipContainer: {
                    textAlign: "left",
                  },
                  tooltipTitle: {
                    fontSize: "1rem",
                    fontWeight: "bold",
                    fontFamily: '"Gilroy", "Arial", sans-serif',
                    color: currentTheme.palette.text.primary,
                    marginBottom: "6px",
                  },
                  tooltipContent: {
                    fontSize: "0.875rem",
                    color: currentTheme.palette.text.secondary,
                    padding: "0",
                  },
                  spotlight: {
                    borderRadius: "10px",
                  },
                }}
              />
            )}
            {isSummary ? (
              <Box
                sx={{
                  width: "100vw",
                  height: "100dvh",
                  display: "flex",
                  flexDirection: "row",
                  overflow: "hidden",
                  bgcolor: "background.default",
                }}
              >
                {/* ── Desktop sidebar ── */}
                {!isMobile && (
                  <Box
                    sx={{
                      width: 72,
                      height: "100vh",
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      borderRight: "1px solid",
                      borderColor: darkMode
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.07)",
                      bgcolor: "background.default",
                      py: 2.5,
                    }}
                  >
                    {/* Brand mark */}
                    <Typography
                      sx={{
                        fontFamily: '"Gilroy", "Arial", sans-serif',
                        fontWeight: 900,
                        fontSize: "0.95rem",
                        background: "linear-gradient(90deg, #E53935, #FB8C00)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 3,
                        letterSpacing: "-0.5px",
                        userSelect: "none",
                      }}
                    >
                      trAI
                    </Typography>

                    {/* Nav items */}
                    {[
                      {
                        id: "myinfo-step",
                        icon: <HomeIcon />,
                        label: t("Home"),
                        tabIdx: 0,
                      },
                      {
                        id: "equipment-step",
                        icon: <FitnessCenter />,
                        label: t("Equipment"),
                        tabIdx: 1,
                      },
                      {
                        id: "trainer-step",
                        icon: <Person />,
                        label: t("trAIner"),
                        tabIdx: 2,
                      },
                      {
                        id: "plan-step",
                        icon: <CalendarToday />,
                        label: t("Planner"),
                        tabIdx: 3,
                      },
                      {
                        id: "pantry-step",
                        icon: <LocalDiningIcon />,
                        label: t("Pantry"),
                        tabIdx: 4,
                      },
                    ].map(({ id, icon, label, tabIdx }) => {
                      const selected = value === tabIdx;
                      return (
                        <Box
                          key={id}
                          id={id}
                          onClick={() => setValue(tabIdx)}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.5,
                            py: 1.25,
                            cursor: "pointer",
                            width: "100%",
                            position: "relative",
                            "&:hover .nav-pill": {
                              bgcolor: !selected
                                ? darkMode
                                  ? "rgba(255,255,255,0.06)"
                                  : "rgba(0,0,0,0.05)"
                                : undefined,
                            },
                          }}
                        >
                          {/* Active accent bar */}
                          {selected && (
                            <Box
                              sx={{
                                position: "absolute",
                                left: 0,
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: 3,
                                height: 30,
                                borderRadius: "0 3px 3px 0",
                                background:
                                  "linear-gradient(180deg, #E53935, #FB8C00)",
                              }}
                            />
                          )}

                          {/* Icon container */}
                          <Box
                            className="nav-pill"
                            sx={{
                              width: 44,
                              height: 34,
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: selected
                                ? darkMode
                                  ? "rgba(229,57,53,0.15)"
                                  : "rgba(229,57,53,0.08)"
                                : "transparent",
                              transition: "background-color 0.2s",
                              "& .MuiSvgIcon-root": {
                                fontSize: "1.25rem",
                                color: selected
                                  ? "#E53935"
                                  : darkMode
                                    ? "rgba(255,255,255,0.45)"
                                    : "rgba(0,0,0,0.4)",
                              },
                            }}
                          >
                            {icon}
                          </Box>

                          {/* Label */}
                          <Typography
                            sx={{
                              fontSize: "0.58rem",
                              fontWeight: selected ? 700 : 400,
                              fontFamily: '"Gilroy", "Arial", sans-serif',
                              color: selected
                                ? "#E53935"
                                : darkMode
                                  ? "rgba(255,255,255,0.45)"
                                  : "rgba(0,0,0,0.4)",
                              lineHeight: 1,
                            }}
                          >
                            {label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {/* ── Page content ── */}
                <Box
                  sx={{
                    flex: 1,
                    height: isMobile ? "calc(100dvh - 60px)" : "100dvh",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "background.default",
                  }}
                >
                  {pages[value]}
                </Box>

                {/* ── Mobile bottom nav ── */}
                {isMobile && (
                  <Box
                    sx={{
                      position: "fixed",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 60,
                      display: "flex",
                      flexDirection: "row",
                      bgcolor: "background.default",
                      borderTop: "1px solid",
                      borderColor: darkMode
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.07)",
                      zIndex: 100,
                      px: 0.5,
                    }}
                  >
                    {[
                      {
                        id: "myinfo-step",
                        icon: <HomeIcon />,
                        label: t("Home"),
                        tabIdx: 0,
                      },
                      {
                        id: "equipment-step",
                        icon: <FitnessCenter />,
                        label: t("Equipment"),
                        tabIdx: 1,
                      },
                      {
                        id: "trainer-step",
                        icon: <Person />,
                        label: "trAI",
                        tabIdx: 2,
                      },
                      {
                        id: "plan-step",
                        icon: <CalendarToday />,
                        label: t("Planner"),
                        tabIdx: 3,
                      },
                      {
                        id: "pantry-step",
                        icon: <LocalDiningIcon />,
                        label: t("Pantry"),
                        tabIdx: 4,
                      },
                    ].map(({ id, icon, label, tabIdx }) => {
                      const selected = value === tabIdx;
                      return (
                        <Box
                          key={id}
                          id={id}
                          onClick={() => setValue(tabIdx)}
                          sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.25,
                            cursor: "pointer",
                            py: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              "& .MuiSvgIcon-root": {
                                fontSize: "1.3rem",
                                color: selected
                                  ? "#E53935"
                                  : darkMode
                                    ? "rgba(255,255,255,0.45)"
                                    : "rgba(0,0,0,0.4)",
                              },
                            }}
                          >
                            {icon}
                          </Box>
                          <Typography
                            sx={{
                              fontSize: "0.58rem",
                              fontWeight: selected ? 700 : 400,
                              fontFamily: '"Gilroy", "Arial", sans-serif',
                              color: selected
                                ? "#E53935"
                                : darkMode
                                  ? "rgba(255,255,255,0.45)"
                                  : "rgba(0,0,0,0.4)",
                              lineHeight: 1,
                            }}
                          >
                            {label}
                          </Typography>
                          {selected && (
                            <Box
                              sx={{
                                width: 16,
                                height: 3,
                                borderRadius: "999px",
                                background:
                                  "linear-gradient(90deg, #E53935, #FB8C00)",
                                mt: 0.25,
                              }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  height: "100vh",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* ── Onboarding header ── */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2.5,
                    py: 1.25,
                    bgcolor: "background.default",
                    borderBottom: "1px solid",
                    borderColor: darkMode
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.07)",
                    flexShrink: 0,
                  }}
                >
                  {/* Language selector */}
                  <FormControl sx={{ minWidth: 80 }}>
                    <Select
                      value={prefLanguage}
                      onChange={handleLanguageChange}
                      disableunderline="true"
                      displayEmpty
                      renderValue={(selected) => {
                        const labels = {
                          en: "EN",
                          cn: "ZH",
                          tc: "TC",
                          es: "ES",
                          fr: "FR",
                          de: "DE",
                          jp: "JP",
                          kr: "KR",
                        };
                        return (
                          <Typography
                            sx={{
                              fontSize: "0.82rem",
                              color: "text.secondary",
                              fontWeight: 500,
                            }}
                          >
                            {labels[selected] || "EN"}
                          </Typography>
                        );
                      }}
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiSelect-select": { py: 0.75, px: 1 },
                        "& .MuiSelect-icon": {
                          color: "text.secondary",
                          fontSize: "1.1rem",
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

                  {/* Brand */}
                  <Typography
                    fontWeight="bold"
                    sx={{
                      fontSize: "1.3rem",
                      background: "linear-gradient(90deg, #E53935, #FB8C00)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: '"Gilroy", "Arial", sans-serif',
                      letterSpacing: "-0.5px",
                    }}
                  >
                    trAIner
                  </Typography>

                  {/* Auth */}
                  <Box>
                    {!isSignedIn ? (
                      <Button
                        component={Link}
                        href="/sign-in"
                        sx={{
                          background:
                            "linear-gradient(90deg, #E53935, #FB8C00)",
                          color: "white",
                          borderRadius: "999px",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          px: 2,
                          py: 0.6,
                          minWidth: "auto",
                          "&:hover": { opacity: 0.88 },
                        }}
                      >
                        {t("signIn")}
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
                  handleFeetChange={handleFeetChange}
                  feet={feet}
                  handleInchesChange={handleInchesChange}
                  inches={inches}
                  t={t}
                  nextStep={nextStep}
                  prevStep={prevStep}
                  handleSubmit={handleSubmit}
                />
              </Box>
            )}
          </>
        ) : (
          /* ── Landing page for unauthenticated visitors ── */
          <Box width="100%" minHeight="100vh" sx={{ overflowX: "hidden" }}>
            {/* Navbar — dark */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              px={isMobile ? 3 : 6}
              py={2}
              sx={{
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                position: "sticky",
                top: 0,
                zIndex: 100,
                bgcolor: "#111111",
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{
                  background: "linear-gradient(90deg, #E53935, #FB8C00)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontFamily: '"Gilroy", "Arial", sans-serif',
                }}
              >
                trAIner
              </Typography>
              <Button
                component={Link}
                href="/sign-in"
                variant="outlined"
                sx={{
                  borderRadius: "99999px",
                  px: 3,
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "white",
                    borderColor: "white",
                    color: "#111111",
                  },
                }}
              >
                {t("signIn")}
              </Button>
            </Box>

            {/* Hero — dark */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              textAlign="center"
              px={isMobile ? 3 : 6}
              pt={isMobile ? 8 : 12}
              pb={isMobile ? 8 : 12}
              gap={3}
              sx={{ bgcolor: "#111111" }}
            >
              <Chip
                label="AI-Powered Fitness"
                sx={{
                  background: "linear-gradient(90deg, #E53935, #FB8C00)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                  px: 1,
                }}
              />
              <Typography
                variant={isMobile ? "h3" : "h2"}
                fontWeight="bold"
                maxWidth="700px"
                sx={{
                  lineHeight: 1.2,
                  color: "white",
                  fontFamily: '"Gilroy", "Arial", sans-serif',
                }}
              >
                Your Personal{" "}
                <Box
                  component="span"
                  sx={{
                    background: "linear-gradient(90deg, #E53935, #FB8C00)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  AI Fitness Coach
                </Box>
              </Typography>
              <Typography
                variant="h6"
                maxWidth="520px"
                sx={{
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                Get a custom workout plan, track your equipment, and hit your
                goals — all powered by AI, tailored just for you.
              </Typography>
              <Stack
                direction="row"
                gap={2}
                flexWrap="wrap"
                justifyContent="center"
              >
                <Button
                  component={Link}
                  href="/sign-in"
                  sx={{
                    borderRadius: "99999px",
                    px: 5,
                    py: 1.5,
                    background: "linear-gradient(90deg, #E53935, #FB8C00)",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    "&:hover": { opacity: 0.9 },
                  }}
                >
                  {t("Get Started")} →
                </Button>
              </Stack>
            </Box>

            {/* Features — light */}
            <Box
              px={isMobile ? 3 : 8}
              py={isMobile ? 6 : 8}
              sx={{ bgcolor: "#FAFAFA" }}
            >
              <Box maxWidth="1100px" mx="auto">
                <Typography
                  variant="h4"
                  textAlign="center"
                  fontWeight="bold"
                  mb={1}
                  sx={{
                    fontFamily: '"Gilroy", "Arial", sans-serif',
                    color: "#111111",
                  }}
                >
                  Everything you need to train smarter
                </Typography>
                <Typography
                  variant="body1"
                  textAlign="center"
                  mb={5}
                  sx={{ color: "#666666" }}
                >
                  One app. All the tools. No guesswork.
                </Typography>
                <Grid container spacing={3}>
                  {[
                    {
                      icon: <Person fontSize="large" />,
                      title: "AI Personal Trainer",
                      desc: "Chat with your AI coach to get a personalized workout plan based on your body, goals, and available equipment.",
                    },
                    {
                      icon: <FitnessCenter fontSize="large" />,
                      title: "Equipment Tracker",
                      desc: "Log the gear you have — from resistance bands to a full gym setup. Your plan adapts to what you've got.",
                    },
                    {
                      icon: <CalendarToday fontSize="large" />,
                      title: "Workout Planner",
                      desc: "Schedule your sessions with an interactive calendar, track upcoming workouts, and stay consistent.",
                    },
                    {
                      icon: <LocalDiningIcon fontSize="large" />,
                      title: "Nutrition & Recipes",
                      desc: "Track pantry ingredients and get AI-generated recipes to fuel your training. Premium feature.",
                    },
                  ].map((feature, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Card
                        elevation={0}
                        sx={{
                          border: "1px solid",
                          borderColor: "#E0E0E0",
                          borderRadius: 3,
                          height: "100%",
                          bgcolor: "#FFFFFF",
                          transition: "box-shadow 0.2s",
                          "&:hover": { boxShadow: 4 },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box
                            sx={{
                              mb: 2,
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background:
                                "linear-gradient(135deg, #E53935, #FB8C00)",
                              color: "white",
                            }}
                          >
                            {feature.icon}
                          </Box>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            mb={1}
                            sx={{
                              fontFamily: '"Gilroy", "Arial", sans-serif',
                              color: "#111111",
                            }}
                          >
                            {feature.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ lineHeight: 1.7, color: "#666666" }}
                          >
                            {feature.desc}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>

            {/* How it works */}
            <Box
              px={isMobile ? 3 : 8}
              py={isMobile ? 6 : 8}
              sx={{
                bgcolor: "#F5F5F5",
                borderTop: "1px solid #E0E0E0",
                borderBottom: "1px solid #E0E0E0",
              }}
            >
              <Typography
                variant="h4"
                textAlign="center"
                fontWeight="bold"
                mb={1}
                sx={{
                  fontFamily: '"Gilroy", "Arial", sans-serif',
                  color: "#111111",
                }}
              >
                How it works
              </Typography>
              <Typography
                variant="body1"
                textAlign="center"
                mb={6}
                sx={{ color: "#666666" }}
              >
                Up and running in three simple steps.
              </Typography>
              <Stack
                direction={isMobile ? "column" : "row"}
                gap={isMobile ? 5 : 4}
                justifyContent="center"
                alignItems={isMobile ? "center" : "flex-start"}
                maxWidth="900px"
                mx="auto"
              >
                {[
                  {
                    num: "1",
                    title: "Tell us about yourself",
                    desc: "Share your age, weight, goals, and current fitness level so your plan is built for you.",
                  },
                  {
                    num: "2",
                    title: "Log your equipment",
                    desc: "Let us know what gear you have available — at home, at the gym, or anywhere in between.",
                  },
                  {
                    num: "3",
                    title: "Get your plan",
                    desc: "Your AI trainer instantly generates a personalized workout plan and helps you stay on track.",
                  },
                ].map((step, i) => (
                  <Box
                    key={i}
                    flex={1}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    textAlign="center"
                    gap={1.5}
                    maxWidth={isMobile ? "320px" : "none"}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #E53935, #FB8C00)",
                        color: "white",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      {step.num}
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        fontFamily: '"Gilroy", "Arial", sans-serif',
                        color: "#111111",
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ lineHeight: 1.7, color: "#666666" }}
                    >
                      {step.desc}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Footer CTA — dark */}
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              textAlign="center"
              px={isMobile ? 3 : 6}
              py={isMobile ? 8 : 12}
              gap={2.5}
              sx={{ bgcolor: "#111111" }}
            >
              <Typography
                variant={isMobile ? "h4" : "h3"}
                fontWeight="bold"
                maxWidth="600px"
                sx={{
                  color: "white",
                  fontFamily: '"Gilroy", "Arial", sans-serif',
                }}
              >
                Start your fitness journey today
              </Typography>
              <Typography
                variant="body1"
                maxWidth="420px"
                sx={{ color: "rgba(255,255,255,0.65)" }}
              >
                Join thousands of people already using trAIner to build better
                habits and reach their goals.
              </Typography>
              <Button
                component={Link}
                href="/sign-in"
                sx={{
                  mt: 1,
                  borderRadius: "99999px",
                  px: 6,
                  py: 1.75,
                  background: "linear-gradient(90deg, #E53935, #FB8C00)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  "&:hover": { opacity: 0.9 },
                }}
              >
                {t("Get Started")} →
              </Button>
            </Box>
          </Box>
        )}
      </ThemeProvider>
    </GuestContext.Provider>
  );
}
