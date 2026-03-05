"use client";
import { useEffect, useState, useRef, useContext } from "react";
import {
  Select,
  MenuItem,
  Container,
  Box,
  Typography,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  useMediaQuery,
  ThemeProvider,
  CssBaseline,
  Divider,
  Modal,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  NativeSelect,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  keyframes,
  useTheme,
} from "@mui/material";
import { firestore } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { useUser, UserButton } from "@clerk/nextjs";
import { GuestContext } from "../page";
import { useRouter } from "next/navigation";
import { customComponents } from "../customMarkdownComponents";
import { lightTheme, darkTheme } from "../theme";
import Image from "next/image";
import Webcam from "react-webcam";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from "@mui/icons-material/Info";
import ReactMarkdown from "react-markdown";

// ─── MyInfo/CameraModal ──────────────────────────────────────────────────────
const CameraModal = ({
  cameraOpen,
  setCameraOpen,
  captureImage,
  switchCamera,
  facingMode,
  webcamRef,
  t,
}) => (
  <Modal open={cameraOpen} onClose={() => setCameraOpen(false)}>
    <Box width="100%" height="100vh" backgroundColor="black">
      <Stack
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        sx={{ transform: "translate(0%,25%)" }}
      >
        <Box
          sx={{
            top: "50%",
            bgcolor: "black",
            width: 350,
            height: 350,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingY: 2,
            position: "relative",
          }}
        >
          <Box
            sx={{
              maxWidth: 350,
              aspectRatio: "1/1",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              backgroundColor: "black",
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)",
              }}
            />
          </Box>
        </Box>
        <Stack flexDirection="row" gap={2} position="relative">
          <Button
            variant="outlined"
            onClick={captureImage}
            sx={{
              color: "black",
              borderColor: "white",
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "white",
                color: "black",
                borderColor: "white",
              },
              marginTop: 1,
            }}
          >
            {t("Take Photo")}
          </Button>
          <Button
            onClick={switchCamera}
            sx={{
              color: "black",
              borderColor: "white",
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "white",
                color: "black",
                borderColor: "white",
              },
              marginTop: 1,
            }}
          >
            {t("Switch Camera")}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setCameraOpen(false)}
            sx={{
              color: "black",
              borderColor: "white",
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "white",
                color: "black",
                borderColor: "white",
              },
              marginTop: 1,
            }}
          >
            {t("Exit")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  </Modal>
);

// ─── MyInfo/EditPage ─────────────────────────────────────────────────────────
const EditPage = ({
  editModal,
  setEditModal,
  handleEditOrSave,
  orderedKeys,
  renderEditField,
  image,
  setCameraOpen,
  facingMode,
  user,
  formData,
  isEditing,
  setIsEditing,
  isMobile,
  t,
}) => (
  <Modal
    open={editModal}
    onClose={() => {
      setEditModal(false);
      setIsEditing(false);
    }}
  >
    <Box
      sx={{
        position: "absolute",
        right: 0,
        top: 0,
        width: isMobile ? "100vw" : "calc(100vw - 90px)",
        height: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 2,
      }}
    >
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        padding={1}
      >
        <Button
          onClick={handleEditOrSave}
          sx={{
            width: "75px",
            fontSize: "1rem",
            borderRadius: 2.5,
            backgroundColor: "background.default",
            color: "text.primary",
            border: 1,
            borderColor: "text.primary",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "text.primary",
              color: "background.default",
              borderColor: "text.primary",
            },
          }}
        >
          {isEditing ? t("Save") : t("Edit")}
        </Button>
        <Button
          onClick={() => setEditModal(false)}
          disabled={isEditing}
          sx={{
            height: "55px",
            fontSize: "1rem",
            backgroundColor: "background.default",
            color: "text.primary",
            borderColor: "background.default",
            borderRadius: "50px",
            "&:hover": {
              backgroundColor: "background.default",
              color: "text.primary",
              borderColor: "background.default",
            },
          }}
        >
          <Typography sx={{ fontSize: "1.1rem" }}>X</Typography>
        </Button>
      </Box>
      <Box
        width="100%"
        height="90%"
        display="flex"
        flexDirection="column"
        p={2.5}
        gap={2.5}
        alignItems="center"
        overflow="auto"
      >
        <Box style={{ position: "relative", display: "inline-block" }}>
          {image ? (
            <Image
              src={image}
              alt={t("image")}
              width={isMobile ? 200 : 300}
              height={isMobile ? 200 : 300}
              style={{
                borderRadius: "9999px",
                objectFit: "cover",
                transform: facingMode === "user" ? "scaleX(-1)" : "none",
                aspectRatio: "1/1",
              }}
            />
          ) : (
            <Image
              src="/profile.jpg"
              alt={t("banner")}
              width={isMobile ? 200 : 300}
              height={isMobile ? 200 : 300}
              style={{ borderRadius: "9999px", width: "auto", height: "auto" }}
            />
          )}
          <Button
            onClick={() => setCameraOpen(true)}
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              zIndex: 1,
              backgroundColor: "text.primary",
              color: "background.default",
              borderColor: "background.default",
              borderRadius: "9999px",
              aspectRatio: 1,
              "&:hover": {
                backgroundColor: "background.default",
                color: "text.primary",
                borderColor: "text.primary",
              },
            }}
          >
            {image ? <EditIcon /> : <AddIcon />}
          </Button>
        </Box>
        <Typography
          sx={{ fontSize: "2.5rem", fontWeight: "700", lineHeight: "1.2" }}
        >
          {user && user.fullName ? user.fullName : t("Guest")}
        </Typography>
        <Box width="100%" justifyContent="left" maringTop={2.5}>
          <Typography sx={{ fontSize: "1.25rem", fontWeight: "800" }}>
            Info
          </Typography>
        </Box>
        <Grid
          container
          spacing={1}
          sx={{
            justifyContent: "center",
            width: "90vw",
            paddingBottom: "60px",
          }}
        >
          {orderedKeys.map((key) => (
            <Grid item xs={isEditing ? 12 : 6} sm={6} md={3} key={key}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  padding: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  backgroundColor: "background.paper",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ marginBottom: 1, color: "text.primary" }}
                >
                  {t(key)}:
                </Typography>
                {isEditing ? (
                  <Box sx={{ width: "100%" }}>
                    {renderEditField(key, formData[key])}
                  </Box>
                ) : (
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 500,
                      color: "text.secondary",
                    }}
                  >
                    {key === "Availability"
                      ? `${formData[key]} ${t("days")}`
                      : formData[key]}
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  </Modal>
);

// ─── MyInfo/Header ────────────────────────────────────────────────────────────
const MyInfoHeader = ({
  isEditing,
  setEditModal,
  handleInfoModal,
  isMobile,
  t,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        px: 2.5,
        py: 1.25,
        bgcolor: "background.default",
        borderBottom: "1px solid",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
        flexShrink: 0,
      }}
    >
      {/* Profile button */}
      <Button
        onClick={() => setEditModal(true)}
        sx={{
          borderRadius: "999px",
          px: 2,
          py: 0.6,
          border: "1px solid",
          borderColor: isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)",
          color: isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.6)",
          fontSize: "0.8rem",
          fontWeight: 600,
          minWidth: "auto",
          "&:hover": {
            borderColor: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)",
            bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          },
        }}
      >
        {isEditing ? t("Save") : t("Profile")}
      </Button>

      {/* Title + info */}
      <Box display="flex" alignItems="center" gap={0.5}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "1rem",
            fontFamily: '"Gilroy", "Arial", sans-serif',
            color: "text.primary",
          }}
        >
          {t("My Info")}
        </Typography>
        <Button
          onClick={handleInfoModal}
          sx={{
            minWidth: "auto",
            width: 22,
            height: 22,
            borderRadius: "50%",
            p: 0,
          }}
        >
          <InfoIcon
            sx={{
              fontSize: "0.9rem",
              color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
            }}
          />
        </Button>
      </Box>

      <Box>
        <UserButton />
      </Box>
    </Box>
  );
};

// ─── MyInfo/InfoModal ─────────────────────────────────────────────────────────
const MyInfoModal = ({ openInfoModal, setOpenInfoModal, t }) => (
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
      <Typography variant="h6" component="h2" fontWeight="600">
        {t("How to use:")}
      </Typography>
      <Typography sx={{ mt: 2 }}>
        {t("1. Use the top left button to select your language.")}
      </Typography>
      <Typography sx={{ mt: 2 }}>
        {t(
          "2. Answer the questions about your gender, age, weight, height, goals, activity level, health issues, and workout days.",
        )}
      </Typography>
      <Typography sx={{ mt: 2 }}>
        {t(
          "3. After completing the steps, review your infornmation. The top left button will change to an EDIT button. You can still change your system language in the trainerGPT page.",
        )}
      </Typography>
      <Typography sx={{ mt: 2 }}>
        {t(
          "4. After filling out your information, add an optional profile photo with the Add Photo button.",
        )}
      </Typography>
      <Typography sx={{ mt: 2 }}>
        {t(
          "5. Sign in using the top right button to create an account or sign in.",
        )}
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <Button
        variant="outlined"
        onClick={() => setOpenInfoModal(false)}
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
);

// ─── MyInfo/WorkoutModal ──────────────────────────────────────────────────────
const WorkoutModal = ({
  openWorkoutModal,
  setOpenWorkoutModal,
  handleEditOrSaveWorkout,
  isEditingWorkout,
  setIsEditingWorkout,
  renderEditExercise,
  allEvents,
  selectedWorkout,
  customComponents,
  setValue,
  isMobile,
  upcomingWorkouts,
  completedWorkouts,
  setCompletedWorkouts,
  selectedSkill,
  setCongratsModal,
  t,
}) => (
  <Modal
    open={openWorkoutModal}
    onClose={() => {
      setOpenWorkoutModal(false);
      setIsEditingWorkout(false);
    }}
  >
    <Box
      sx={{
        width: isMobile ? "100vw" : "500px",
        height: isMobile ? "100vh" : "600px",
        position: isMobile ? "default" : "absolute",
        top: isMobile ? "0%" : "50%",
        left: isMobile ? "0%" : "50%",
        transform: isMobile ? "" : "translate(-50%, -50%)",
        bgcolor: "background.default",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* top banner */}
      <Box
        width="100%"
        minHeight="200px"
        sx={{
          backgroundImage: `url(${"/gym_dark.jpg"})`,
          backgroundSize: "160%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "column",
          color: "white",
          overflowY: "clip",
        }}
      >
        <Box width="100%" display="flex" justifyContent="end">
          <Button
            onClick={() => setOpenWorkoutModal(false)}
            disabled={isEditingWorkout}
            sx={{
              fontSize: "1rem",
              color: "white",
              borderColor: "background.default",
              "&:hover": { color: "white", borderColor: "background.default" },
            }}
          >
            <Typography sx={{ fontSize: "1.1rem" }}>X</Typography>
          </Button>
        </Box>
        {selectedSkill === 0 && (
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: isMobile ? "2rem" : "3rem",
              textAlign: "center",
              color: "white",
            }}
          >
            {upcomingWorkouts[selectedWorkout]?.title}
          </Typography>
        )}
        {selectedSkill === 1 && (
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: isMobile ? "2rem" : "3rem",
              textAlign: "center",
              color: "white",
            }}
          >
            {completedWorkouts[selectedWorkout]?.title}
          </Typography>
        )}
      </Box>

      {/* top buttons */}
      {selectedSkill === 0 && (
        <Box
          width="100%"
          display="flex"
          justifyContent={"space-between"}
          alignItems="center"
          paddingY={1}
        >
          <Stack
            flexDirection={"row"}
            gap={2}
            paddingX={isMobile ? 2 : 4}
            paddingY={2}
            justifyContent={"space-between"}
            width="100%"
          >
            <Button
              onClick={() => setValue(2)}
              sx={{
                height: "55px",
                fontSize: "1rem",
                backgroundColor: "background.default",
                color: "text.primary",
                border: 1,
                borderColor: "text.primary",
                borderRadius: 2.5,
                textTransform: "none",
                paddingX: 2,
                "&:hover": {
                  backgroundColor: "text.primary",
                  color: "background.default",
                  borderColor: "text.primary",
                },
              }}
            >
              Talk to Trainer
            </Button>
            <Button
              onClick={() => {
                setCompletedWorkouts([
                  ...completedWorkouts,
                  upcomingWorkouts[selectedWorkout],
                ]);
                setCongratsModal(true);
                setOpenWorkoutModal(false);
              }}
              sx={{
                height: "55px",
                fontSize: "1rem",
                backgroundColor: "background.default",
                color: "text.primary",
                border: 1,
                borderColor: "text.primary",
                borderRadius: 2.5,
                textTransform: "none",
                paddingX: 2,
                "&:hover": {
                  backgroundColor: "text.primary",
                  color: "background.default",
                  borderColor: "text.primary",
                },
              }}
            >
              Mark as Completed
            </Button>
            <Button
              onClick={handleEditOrSaveWorkout}
              sx={{
                width: "75px",
                height: "55px",
                fontSize: "1rem",
                backgroundColor: "background.default",
                color: "text.primary",
                border: 1,
                borderColor: "text.primary",
                borderRadius: 2.5,
                textTransform: "none",
                paddingX: 2,
                "&:hover": {
                  backgroundColor: "text.primary",
                  color: "background.default",
                  borderColor: "text.primary",
                },
              }}
            >
              {isEditingWorkout ? t("Save") : t("Edit")}
            </Button>
          </Stack>
        </Box>
      )}

      {/* workout content */}
      {selectedSkill === 0 && (
        <Box paddingX={isMobile ? 2.5 : 5} sx={{ overflowY: "auto" }}>
          {isEditingWorkout ? (
            <Box>
              {renderEditExercise(
                selectedWorkout,
                upcomingWorkouts[selectedWorkout]?.extendedProps?.details,
              )}
            </Box>
          ) : (
            <ReactMarkdown components={customComponents}>
              {upcomingWorkouts[selectedWorkout]?.extendedProps?.details}
            </ReactMarkdown>
          )}
        </Box>
      )}
      {selectedSkill === 1 && (
        <Box padding={isMobile ? 2.5 : 5} sx={{ overflowY: "auto" }}>
          {isEditingWorkout ? (
            <Box>
              {renderEditExercise(
                completedWorkouts,
                completedWorkouts[selectedWorkout]?.extendedProps?.details,
              )}
            </Box>
          ) : (
            <ReactMarkdown components={customComponents}>
              {completedWorkouts[selectedWorkout]?.extendedProps?.details}
            </ReactMarkdown>
          )}
        </Box>
      )}
    </Box>
  </Modal>
);

// ─── MyInfo/HomePage ──────────────────────────────────────────────────────────
const GRAD = "linear-gradient(90deg, #E53935, #FB8C00)";

const WorkoutCard = ({
  title,
  start,
  isToday,
  background,
  textColor,
  badge,
  onClick,
  isMobile,
}) => (
  <Button onClick={onClick} sx={{ color: "white", flexShrink: 0, p: 0.5 }}>
    <Box
      sx={{
        width: isMobile ? 140 : 170,
        height: isMobile ? 140 : 170,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        p: 1.5,
        background,
        borderRadius: "14px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
        overflow: "hidden",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.68rem",
          opacity: 0.75,
          textAlign: "right",
          width: "100%",
          color: textColor,
        }}
      >
        {badge ||
          (isToday(start)
            ? "Today"
            : new Date(start).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              }))}
      </Typography>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: isMobile ? "0.9rem" : "1.05rem",
          lineHeight: 1.25,
          color: textColor,
        }}
      >
        {title}
      </Typography>
    </Box>
  </Button>
);

const HomePage = ({
  isMobile,
  user,
  plan,
  allEvents,
  handleWorkoutModal,
  isToday,
  handleCancelSubscription,
  hasPremiumAccess,
  upcomingWorkouts,
  completedWorkouts,
  selectedSkill,
  setSelectedSkill,
  setValue,
  t,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const c = isDark
    ? {
        title: "white",
        subtitle: "rgba(255,255,255,0.55)",
        cardBg: "rgba(255,255,255,0.04)",
        cardBorder: "rgba(255,255,255,0.12)",
        stepLine: "rgba(255,255,255,0.12)",
        sectionLabel: "rgba(255,255,255,0.45)",
        completedBg: "rgba(255,255,255,0.07)",
      }
    : {
        title: "#111111",
        subtitle: "rgba(0,0,0,0.5)",
        cardBg: "rgba(0,0,0,0.02)",
        cardBorder: "rgba(0,0,0,0.1)",
        stepLine: "rgba(0,0,0,0.1)",
        sectionLabel: "rgba(0,0,0,0.45)",
        completedBg: "rgba(0,0,0,0.05)",
      };

  const hasEvents = allEvents.length > 0;
  const flowStep = !plan ? 1 : !hasEvents ? 2 : 3;

  const flowSteps = [
    {
      label: "Ask for a plan",
      desc: "Chat with TrainerGPT to get a personalized workout plan.",
    },
    {
      label: "Schedule workouts",
      desc: "Open the Planner and place your workouts on the calendar.",
    },
    {
      label: "Track your progress",
      desc: "Complete workouts and see them logged here.",
    },
  ];

  const cardGradients = [
    "linear-gradient(135deg, #E53935 0%, #FB8C00 100%)",
    "linear-gradient(135deg, #C62828 0%, #E53935 100%)",
    "linear-gradient(135deg, #FB8C00 0%, #FFC107 100%)",
    "linear-gradient(135deg, #BF360C 0%, #FB8C00 100%)",
    "linear-gradient(135deg, #E53935 0%, #FF7043 100%)",
    "linear-gradient(135deg, #D84315 0%, #E53935 100%)",
    "linear-gradient(135deg, #FF5722 0%, #FB8C00 100%)",
    "linear-gradient(135deg, #C62828 0%, #FF7043 100%)",
  ];

  return (
    <Box
      height="100%"
      overflow="auto"
      display="flex"
      flexDirection="column"
      px={isMobile ? 2.5 : 3}
      pt={isMobile ? 2 : 3}
      pb={isMobile ? 2.5 : "80px"}
    >
      {/* Welcome heading */}
      <Typography
        sx={{
          fontSize: isMobile ? "1.7rem" : "2.5rem",
          fontWeight: 800,
          lineHeight: 1.15,
          color: c.title,
          fontFamily: '"Gilroy", "Arial", sans-serif',
          mb: isMobile ? (flowStep < 3 ? 2 : 1.5) : (flowStep < 3 ? 3 : 2.5),
        }}
      >
        Welcome, {user && user.fullName ? user.fullName.split(" ")[0] : "there"}
        .
      </Typography>

      {/* ── Flow guide (only shown before user has events) ── */}
      {flowStep < 3 && (
        <Box sx={{ mb: isMobile ? 2 : 3, maxWidth: 400 }}>
          {flowSteps.map((step, i) => {
            const num = i + 1;
            const done = num < flowStep;
            const active = num === flowStep;
            return (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  mb: i < 2 ? 0 : 0,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: done || active ? GRAD : c.stepLine,
                      opacity: done || active ? 1 : 0.4,
                    }}
                  >
                    <Typography
                      sx={{
                        color: "white",
                        fontWeight: 800,
                        fontSize: "0.72rem",
                        lineHeight: 1,
                      }}
                    >
                      {done ? "✓" : num}
                    </Typography>
                  </Box>
                  {i < 2 && (
                    <Box
                      sx={{
                        width: 2,
                        height: 20,
                        bgcolor: done ? GRAD : c.stepLine,
                        opacity: done ? 1 : 0.25,
                        mt: "2px",
                        mb: "2px",
                      }}
                    />
                  )}
                </Box>
                <Box
                  sx={{
                    opacity: done || active ? 1 : 0.35,
                    pt: "4px",
                    pb: i < 2 ? "10px" : 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: c.title,
                      fontSize: "0.88rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {step.label}
                  </Typography>
                  {active && (
                    <Typography
                      sx={{
                        color: c.subtitle,
                        fontSize: "0.78rem",
                        mt: 0.3,
                        lineHeight: 1.5,
                      }}
                    >
                      {step.desc}
                    </Typography>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* ── CTA: no plan yet ── */}
      {!plan && (
        <Box
          sx={{
            border: "1px solid",
            borderColor: c.cardBorder,
            borderRadius: 3,
            p: isMobile ? 2 : 3,
            bgcolor: c.cardBg,
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 1.5 : 2,
            mb: isMobile ? 2 : 3,
            maxWidth: 440,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              background: GRAD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: "1.3rem" }}>💬</Typography>
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: c.title,
              fontSize: "1.05rem",
              lineHeight: 1.35,
            }}
          >
            Ask TrainerGPT for a workout plan
          </Typography>
          <Typography
            sx={{ color: c.subtitle, fontSize: "0.85rem", lineHeight: 1.65 }}
          >
            Your AI trainer will build a personalized plan based on your goals,
            fitness level, and schedule — just ask.
          </Typography>
          <Button
            onClick={() => setValue(2)}
            sx={{
              background: GRAD,
              color: "white",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "0.88rem",
              px: 3,
              py: 1,
              alignSelf: "flex-start",
              "&:hover": { opacity: 0.88 },
            }}
          >
            Open TrainerGPT
          </Button>
        </Box>
      )}

      {/* ── CTA: has plan, no events scheduled yet ── */}
      {plan && !hasEvents && (
        <Box
          sx={{
            border: "1px solid",
            borderColor: c.cardBorder,
            borderRadius: 3,
            p: isMobile ? 2 : 3,
            bgcolor: c.cardBg,
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 1.5 : 2,
            mb: isMobile ? 2 : 3,
            maxWidth: 440,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              background: GRAD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: "1.3rem" }}>📅</Typography>
          </Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: c.title,
              fontSize: "1.05rem",
              lineHeight: 1.35,
            }}
          >
            Schedule your workouts
          </Typography>
          <Typography
            sx={{ color: c.subtitle, fontSize: "0.85rem", lineHeight: 1.65 }}
          >
            You have a plan — now put it into action. Head to the Planner, place
            your workouts on the calendar, and they&apos;ll show up right here.
          </Typography>
          <Button
            onClick={() => setValue(3)}
            sx={{
              background: GRAD,
              color: "white",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "0.88rem",
              px: 3,
              py: 1,
              alignSelf: "flex-start",
              "&:hover": { opacity: 0.88 },
            }}
          >
            Go to Planner
          </Button>
        </Box>
      )}

      {/* ── Workout feed: user has events ── */}
      {plan && hasEvents && (
        <>
          <Typography
            sx={{
              fontSize: "1.4rem",
              fontWeight: 300,
              color: c.title,
              mb: 1.5,
            }}
          >
            Upcoming
          </Typography>
          <Stack
            flexDirection="row"
            alignItems="flex-start"
            sx={{
              overflowX: "auto",
              pb: 1,
              mb: 3,
              gap: 0.5,
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
            }}
          >
            {upcomingWorkouts
              .filter(
                (e) =>
                  new Date(e.start) >= new Date().setHours(0, 0, 0, 0) &&
                  e.backgroundColor !== "orange",
              )
              .sort((a, b) => new Date(a.start) - new Date(b.start))
              .map(({ title, start }, index) => (
                <WorkoutCard
                  key={index}
                  title={title}
                  start={start}
                  isToday={isToday}
                  background={cardGradients[index % cardGradients.length]}
                  textColor="white"
                  isMobile={isMobile}
                  onClick={() => {
                    handleWorkoutModal(index);
                    setSelectedSkill(0);
                  }}
                />
              ))}
          </Stack>

          <Typography
            sx={{
              fontSize: "1.4rem",
              fontWeight: 300,
              color: c.title,
              mb: 1.5,
            }}
          >
            Completed
          </Typography>
          <Stack
            flexDirection="row"
            alignItems="flex-start"
            sx={{
              overflowX: "auto",
              pb: 1,
              gap: 0.5,
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
            }}
          >
            {completedWorkouts
              .sort((a, b) => new Date(a.start) - new Date(b.start))
              .map(({ title, start }, index) => (
                <WorkoutCard
                  key={index}
                  title={title}
                  start={start}
                  isToday={isToday}
                  background={c.completedBg}
                  textColor={c.title}
                  badge="Completed"
                  isMobile={isMobile}
                  onClick={() => {
                    handleWorkoutModal(index);
                    setSelectedSkill(1);
                  }}
                />
              ))}
          </Stack>
        </>
      )}

      {hasPremiumAccess && (
        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            onClick={handleCancelSubscription}
            sx={{
              backgroundColor: "red",
              color: "white",
              borderRadius: "999px",
              px: 3,
              "&:hover": { backgroundColor: "darkred" },
            }}
          >
            Cancel Subscription
          </Button>
        </Box>
      )}
    </Box>
  );
};

// ─── MyInfoPage ───────────────────────────────────────────────────────────────
const MyInfoPage = ({ setValue }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({});
  const [isSummary, setIsSummary] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const webcamRef = useRef(null);
  const { t } = useTranslation();
  const { user, isLoaded } = useUser();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = prefersDarkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    localData,
    setLocalData,
    localImage,
    setLocalImage,
    localEquipment,
    localMessages,
  } = useContext(GuestContext);
  const [openInfoModal, setOpenInfoModal] = useState(false);

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleEditOrSave = () => {
    if (isEditing) {
      handleSubmit();
    }
    setIsEditing(!isEditing);
  };

  const saveUserData = async (data) => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.id);
      await setDoc(userDocRef, { userData: data }, { merge: true });
    }
  };

  const handleSubmit = async () => {
    if (isEditing) {
      await saveUserData(formData);
      setIsEditing(false);
    } else {
      await saveUserData(unpackData(formData));
      setFormData(unpackData(formData));
      setIsSummary(true);
    }
  };

  const getUserData = async () => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.id);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().userData : null;
    }
    return null;
  };

  const sendImage = async (imageSrc) => {
    if (imageSrc && user) {
      const userDocRef = doc(firestore, "users", user.id);
      await setDoc(userDocRef, { profilePic: imageSrc }, { merge: true });
    }
  };

  const getImage = async () => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.id);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().profilePic : null;
    }
    return null;
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    sendImage(imageSrc);
    setCameraOpen(false);
  };
  const switchCamera = () => {
    setFacingMode((prevFacingMode) =>
      prevFacingMode === "user" ? "environment" : "user",
    );
  };

  const [prefLanguage, setPrefLanguage] = useState("");

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
      const userDocRef = doc(firestore, "users", user.id);
      await setDoc(
        userDocRef,
        { preferredLanguage: language },
        { merge: true },
      );
    }
  };

  const getPreferredLanguage = async () => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.id);
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

    const initializeData = async () => {
      if (localData.Age) {
        setFormData(localData);
        setIsSummary(true);
        setLoading(false);
        setImage(localImage);
      }
      if (isLoaded && user) {
        const data = await getUserData();
        const img = await getImage();
        if (data) {
          setFormData(data);
          setLocalData(data);
          setImage(img);
          setLocalImage(img);
        }
      }
      setLoading(false);
    };

    fetchAndSetLanguage();
    initializeData();
  }, [user]);

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
        data[t("How many days a week can you commit to working out?")] ||
        "Not available",
    };
    return ret;
  }
  const orderedKeys = [
    "Sex",
    "Age",
    "Weight",
    "Height",
    "Goals",
    "Activity",
    "Health issues",
    "Availability",
  ];


  const renderEditField = (key, value) => {
    switch (key) {
      case "Sex":
        return (
          <ToggleButtonGroup
            exclusive
            value={value || ""}
            onChange={(e, newValue) => handleInputChange(key, newValue)}
            sx={{ mb: 2, display: "flex", justifyContent: "center" }}
          >
            <ToggleButton value="Male">{t("Male")}</ToggleButton>
            <ToggleButton value="Female">{t("Female")}</ToggleButton>
          </ToggleButtonGroup>
        );

      case "Age":
        return (
          <TextField
            type="text"
            value={parseInt(value) || ""}
            onChange={(e) => handleInputChange(key, parseInt(e.target.value))}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
        );

      case "Goals":
        return (
          <ToggleButtonGroup
            exclusive
            value={value || ""}
            onChange={(e, newValue) => handleInputChange(key, newValue)}
            sx={{
              mb: 2,
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
            }}
          >
            {[
              "Weight Loss",
              "Muscle Gain",
              "Improved Endurance",
              "General Fitness",
            ].map((option) => (
              <ToggleButton key={option} value={option}>
                {t(option)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        );

      case "Activity":
        return (
          <ToggleButtonGroup
            exclusive
            value={value || ""}
            onChange={(e, newValue) => handleInputChange(key, newValue)}
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {["Sedentary", "Moderate", "Active"].map((option) => (
              <ToggleButton key={option} value={option}>
                {t(option)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        );

      case "Weight": {
        const weightMatch = value.match(/(\d+\.?\d*)(kg|lbs)/);
        let weightValue = weightMatch ? parseFloat(weightMatch[1]) : "";
        let weightUnit = weightMatch ? weightMatch[2] : "kg";

        const handleUnitChange = (e, newUnit) => {
          if (newUnit && newUnit !== weightUnit) {
            if (newUnit === "lbs") {
              weightValue = (weightValue * 2.20462).toFixed(1);
            } else {
              weightValue = (weightValue / 2.20462).toFixed(1);
            }
            weightUnit = newUnit;
            handleInputChange(key, `${weightValue}${weightUnit}`);
          }
        };

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <TextField
              type="text"
              fullWidth
              variant="outlined"
              value={weightValue}
              onChange={(e) => {
                const newWeightValue = parseFloat(e.target.value);
                handleInputChange(key, `${newWeightValue}${weightUnit}`);
              }}
              sx={{ mb: 4 }}
              InputProps={{
                endAdornment: (
                  <Typography variant="body1">{weightUnit}</Typography>
                ),
              }}
            />
            <ToggleButtonGroup
              value={weightUnit}
              exclusive
              onChange={handleUnitChange}
              sx={{ mb: 4 }}
            >
              <ToggleButton value="kg">kg</ToggleButton>
              <ToggleButton value="lbs">lbs</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        );
      }

      case "Height": {
        const heightMatch = value.match(/(\d+\.?\d*)\s*(cm)|(\d+)'(\d+)"/);
        let heightValue = "";
        let heightUnit = "cm";
        let feet = "";
        let inches = "";

        if (heightMatch) {
          if (heightMatch[2] === "cm") {
            heightValue = parseFloat(heightMatch[1]);
            heightUnit = "cm";
          } else if (heightMatch[3] && heightMatch[4]) {
            feet = parseInt(heightMatch[3], 10);
            inches = parseInt(heightMatch[4], 10);
            heightUnit = "ft/in";
          }
        }

        const handleFeetChange = (e) => {
          const newFeet = parseInt(e.target.value, 10) || 0;
          handleInputChange(key, `${newFeet}'${inches || 0}"`);
        };

        const handleInchesChange = (e) => {
          let newInches = Math.min(parseInt(e.target.value, 10) || 0, 11);
          handleInputChange(key, `${feet || 0}'${newInches}"`);
        };

        const handleUnitChangeH = (e, newUnit) => {
          if (newUnit && newUnit !== heightUnit) {
            if (newUnit === "ft/in") {
              const totalInches = parseFloat(heightValue) / 2.54;
              feet = Math.floor(totalInches / 12);
              inches = Math.round(totalInches % 12);
              handleInputChange(key, `${feet}'${inches}"`);
            } else {
              const heightInCm = ((feet * 12 + inches) * 2.54).toFixed(1);
              handleInputChange(key, `${heightInCm}cm`);
            }
            heightUnit = newUnit;
          }
        };

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {heightUnit === "cm" ? (
              <TextField
                fullWidth
                variant="outlined"
                type="number"
                value={heightValue || ""}
                onChange={(e) =>
                  handleInputChange(key, `${parseFloat(e.target.value)}cm`)
                }
                sx={{ mb: 4 }}
                placeholder="Enter height in cm"
                InputProps={{
                  endAdornment: <Typography variant="body1">cm</Typography>,
                }}
              />
            ) : (
              <>
                <TextField
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={feet || ""}
                  onChange={handleFeetChange}
                  sx={{ mb: 4 }}
                  placeholder="Feet"
                  InputProps={{
                    endAdornment: <Typography variant="body1">ft</Typography>,
                  }}
                />
                <TextField
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={inches || ""}
                  onChange={handleInchesChange}
                  sx={{ mb: 4 }}
                  placeholder="Inches"
                  InputProps={{
                    endAdornment: <Typography variant="body1">in</Typography>,
                  }}
                />
              </>
            )}
            <ToggleButtonGroup
              value={heightUnit}
              exclusive
              onChange={handleUnitChangeH}
              sx={{ mb: 4 }}
            >
              <ToggleButton value="cm">cm</ToggleButton>
              <ToggleButton value="ft/in">ft/in</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        );
      }

      case "Availability":
        return (
          <Box sx={{ mb: 4 }}>
            <Typography gutterBottom>{t("Availability")}</Typography>
            <Slider
              defaultValue={value || 3}
              step={1}
              marks
              min={1}
              max={7}
              valueLabelDisplay="auto"
              value={value || 1}
              onChange={(e, newValue) => handleInputChange(key, newValue)}
            />
          </Box>
        );

      default:
        return (
          <TextField
            type="text"
            value={value || ""}
            onChange={(e) => handleInputChange(key, e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
        );
    }
  };

  const handleInfoModal = () => {
    setOpenInfoModal(true);
  };

  const [weightUnit, setWeightUnit] = useState("kg");
  const [heightUnit, setHeightUnit] = useState("cm");

  const [plan, setPlan] = useState(null);
  const getPlan = async () => {
    try {
      if (user) {
        const userDocRef = doc(firestore, "users", user.id);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          return userDoc.data().plan;
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting plan:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchPlan = async () => {
      const fetchedPlan = await getPlan();
      setPlan(fetchedPlan);
      setLoading(false);
    };
    fetchPlan();
  }, [user]);

  const eventsLoaded = useRef(false);
  const [allEvents, setAllEvents] = useState([]);
  const updateEvents = async () => {
    setLoading(true);

    if (user) {
      const userId = user.id;
      const docRef = collection(firestore, "users", userId, "events");
      const docs = await getDocs(docRef);
      let events = [];
      docs.forEach((doc) => {
        events.push({ name: doc.id, ...doc.data() });
      });
      events.sort((a, b) => new Date(a.start) - new Date(b.start));
      setAllEvents(events);
      eventsLoaded.current = true;
    }

    setLoading(false);
  };

  useEffect(() => {
    updateEvents();
  }, [user]);

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

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
    } else {
      setHasPremiumAccess(false);
    }
  }, [isLoaded, user]);

  const handleCancelSubscription = async () => {
    try {
      const userDocRef = doc(firestore, "users", user.id);
      const userDoc = await getDoc(userDocRef);
      let subscriptionId = "";
      if (userDoc.exists() && userDoc.data()) {
        subscriptionId = userDoc.data().subscriptionId;
      }
      const res = await fetch("/api/cancel_subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId,
          cancelAtPeriodEnd: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Your subscription has been successfully canceled.");
        await setDoc(userDocRef, { premium: false }, { merge: true });
        await setDoc(userDocRef, { subscriptionId: null }, { merge: true });
        window.location.reload();
      } else {
        console.error("Error cancelling subscription:", data.error);
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
    }
  };

  const handleWorkoutModal = (index) => {
    setSelectedWorkout(index);
    setOpenWorkoutModal(true);
  };

  const [openWorkoutModal, setOpenWorkoutModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState({});
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);

  const handleEditOrSaveWorkout = () => {
    if (isEditing) {
      // handleSubmit()
    }
    setIsEditingWorkout(!isEditingWorkout);
  };
  const renderEditExercise = (index, value) => {
    return (
      <TextField
        type="text"
        value={value}
        onChange={(e) => handleInputChangeWorkout(index, e.target.value)}
        fullWidth
        variant="outlined"
        multiline
        minRows={3}
        InputProps={{
          sx: {
            fontSize: "1rem",
            lineHeight: 1.6,
            padding: 0,
            fontFamily: "inherit",
          },
        }}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            "& fieldset": { border: "none" },
          },
        }}
      />
    );
  };

  const handleInputChangeWorkout = (index, value) => {
    const updatedEvents = [...allEvents];
    updatedEvents[index].extendedProps.details = value;
    setAllEvents(updatedEvents);
  };

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
          const deletePromises = querySnapshot.docs.map((doc) =>
            deleteDoc(doc.ref),
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

    if (eventsLoaded.current) {
      updateEventsInFirestore();
    }
  }, [allEvents, user]);

  const [editModal, setEditModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(0);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);

  useEffect(() => {
    const updateCompletedInFirestore = async () => {
      if (user) {
        const userId = user.id;
        const eventsCollectionRef = collection(
          firestore,
          "users",
          userId,
          "completed",
        );

        try {
          const querySnapshot = await getDocs(eventsCollectionRef);
          const deletePromises = querySnapshot.docs.map((doc) =>
            deleteDoc(doc.ref),
          );
          await Promise.all(deletePromises);

          completedWorkouts?.forEach(async (event) => {
            const docRef = doc(
              firestore,
              "users",
              userId,
              "completed",
              event?.id?.toString(),
            );
            await setDoc(docRef, event);
          });
        } catch (error) {
          console.error("Error updating events in Firestore:", error);
        }
      }
    };

    if (completedWorkouts.length >= 0) {
      updateCompletedInFirestore();
    }
  }, [completedWorkouts, user]);

  const updateCompleted = async () => {
    if (user) {
      const userId = user.id;
      const docRef = collection(firestore, "users", userId, "completed");
      const docs = await getDocs(docRef);
      const events = [];
      docs.forEach((doc) => {
        events.push({ name: doc.id, ...doc.data() });
      });
      setCompletedWorkouts(events);
    }
  };

  useEffect(() => {
    updateCompleted();
  }, [user]);

  const [upcomingWorkouts, setUpcomingWorkouts] = useState([]);

  useEffect(() => {
    const filteredWorkouts = allEvents.filter(
      (event) =>
        new Date(event.start) >= new Date().setHours(0, 0, 0, 0) &&
        event.backgroundColor !== "orange" &&
        !completedWorkouts.some((completed) => completed.id === event.id),
    );
    setUpcomingWorkouts(filteredWorkouts);
  }, [allEvents, completedWorkouts]);

  const [congratsModal, setCongratsModal] = useState(false);

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            bgcolor: "background.default",
            color: "text.primary",
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t("Loading...")}
          </Typography>
        </Box>
      </Container>
    );
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box width="100%" height="100%" display="flex" flexDirection="column">
        <CameraModal
          cameraOpen={cameraOpen}
          setCameraOpen={setCameraOpen}
          captureImage={captureImage}
          switchCamera={switchCamera}
          facingMode={facingMode}
          webcamRef={webcamRef}
          t={t}
        />
        <MyInfoModal
          openInfoModal={openInfoModal}
          setOpenInfoModal={setOpenInfoModal}
          t={t}
        />
        <WorkoutModal
          openWorkoutModal={openWorkoutModal}
          setOpenWorkoutModal={setOpenWorkoutModal}
          handleEditOrSaveWorkout={handleEditOrSaveWorkout}
          isEditingWorkout={isEditingWorkout}
          setIsEditingWorkout={setIsEditingWorkout}
          renderEditExercise={renderEditExercise}
          allEvents={allEvents}
          selectedWorkout={selectedWorkout}
          customComponents={customComponents}
          setValue={setValue}
          upcomingWorkouts={upcomingWorkouts}
          completedWorkouts={completedWorkouts}
          setCompletedWorkouts={setCompletedWorkouts}
          selectedSkill={selectedSkill}
          setCongratsModal={setCongratsModal}
          isMobile={isMobile}
          t={t}
        />
        <Modal open={congratsModal} onClose={() => setCongratsModal(false)}>
          <Box
            overflow="auto"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "60%",
              height: "60%",
              background: "linear-gradient(180deg, #E53935 25%, #BF360C 100%)",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              gap: 2,
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box width="100%" display="flex" justifyContent={"center"}>
              <Box
                sx={{
                  backgroundColor: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 75,
                  height: 75,
                }}
              >
                <Typography sx={{ fontSize: "3rem", textAlign: "center" }}>
                  👏
                </Typography>
              </Box>
            </Box>
            <Typography
              sx={{
                fontSize: "1.25rem",
                fontWeight: "800",
                textAlign: "center",
                color: "white",
              }}
            >
              Congratulations!
            </Typography>
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: "200",
                textAlign: "center",
                color: "white",
              }}
            >
              You showed up for yourself today and that is something to be proud
              of. You are unstoppable.
            </Typography>
            <Button
              onClick={() => setCongratsModal(false)}
              sx={{
                height: "55px",
                fontSize: isMobile ? "0.9rem" : "1rem",
                backgroundColor: "white",
                color: "black",
                border: 1,
                borderRadius: 2.5,
                "&:hover": {
                  backgroundColor: "text.primary",
                  color: "background.default",
                  borderColor: "text.primary",
                },
              }}
            >
              <Typography sx={{ fontSize: "0.85rem", fontWeight: "800" }}>
                Go to homepage
              </Typography>
            </Button>
          </Box>
        </Modal>
        <EditPage
          editModal={editModal}
          setEditModal={setEditModal}
          handleEditOrSave={handleEditOrSave}
          orderedKeys={orderedKeys}
          renderEditField={renderEditField}
          image={image}
          setCameraOpen={setCameraOpen}
          facingMode={facingMode}
          user={user}
          formData={formData}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          isMobile={isMobile}
          t={t}
        />
        <MyInfoHeader
          handleEditOrSave={handleEditOrSave}
          isEditing={isEditing}
          setEditModal={setEditModal}
          handleInfoModal={handleInfoModal}
          isMobile={isMobile}
          t={t}
        />
        <HomePage
          isMobile={isMobile}
          user={user}
          plan={plan}
          allEvents={allEvents}
          handleWorkoutModal={handleWorkoutModal}
          isToday={isToday}
          handleCancelSubscription={handleCancelSubscription}
          hasPremiumAccess={hasPremiumAccess}
          selectedSkill={selectedSkill}
          setSelectedSkill={setSelectedSkill}
          completedWorkouts={completedWorkouts}
          upcomingWorkouts={upcomingWorkouts}
          setValue={setValue}
          t={t}
        />
      </Box>
    </ThemeProvider>
  );
};

export default MyInfoPage;
