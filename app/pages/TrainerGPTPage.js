"use client";
import {
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState, useRef, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useUser, UserButton } from "@clerk/nextjs";
import { firestore } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { GuestContext } from "../page";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import SettingsVoiceIcon from "@mui/icons-material/SettingsVoice";
import StopIcon from "@mui/icons-material/Stop";
import InfoIcon from "@mui/icons-material/Info";
import Loading from "../Loading";
import { lightTheme, darkTheme } from "../theme";
import { exerciseData } from "./TrainerGPT/exerciseData";
import { customComponents } from "../customMarkdownComponents";

const GRAD = "linear-gradient(90deg, #E53935, #FB8C00)";

// ─── TrainerGPT/Header ────────────────────────────────────────────────────────
const TrainerGPTHeader = ({
  t,
  prefLanguage,
  handleLanguageChange,
  handleInfoModal,
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
      <FormControl id="language-button" sx={{ minWidth: 64 }}>
        <Select
          value={prefLanguage}
          onChange={handleLanguageChange}
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
            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            "& .MuiSelect-select": { py: 0.5, pr: "24px !important" },
            "& .MuiSelect-icon": { color: "text.secondary" },
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

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
          {t("trainerGPT")}
        </Typography>
        <Button
          id="info-icon"
          onClick={handleInfoModal}
          sx={{
            minWidth: "auto",
            width: 28,
            height: 28,
            borderRadius: "50%",
            p: 0,
          }}
        >
          <InfoIcon
            sx={{
              fontSize: "1rem",
              color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)",
            }}
          />
        </Button>
      </Box>

      <Box id="auth-button">
        <UserButton />
      </Box>
    </Box>
  );
};

// ─── TrainerGPT/InfoModal ─────────────────────────────────────────────────────
const TrainerGPTInfoModal = ({ t, openInfoModal, setOpenInfoModal }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Modal open={openInfoModal} onClose={() => setOpenInfoModal(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 350,
          maxHeight: "80vh",
          overflow: "auto",
          bgcolor: "background.default",
          borderRadius: "18px",
          p: 3.5,
          boxShadow: isDark
            ? "0 8px 40px rgba(0,0,0,0.6)"
            : "0 8px 40px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          border: isDark
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
          {t("How to use:")}
        </Typography>
        {[
          t(
            "1. After filling out your information in the MyInfo page and entering your available equipment in the equipment page, trainerGPT is all ready to help you reach your fitness goals!",
          ),
          t(
            "2. You can further elaborate on more specific goals with trainerGPT. Try to treat it how you would treat any other personal trainer.",
          ),
          t(
            "3. When you are ready, ask trainerGPT to craft you a custom workout plan. You can tell trainerGPT to further modify the program to your liking. (If it gets cut off due to internet issues, just tell it to continue).",
          ),
          t(
            "4. If you have questions about specific exercises, you can also ask trainerGPT how to do specific exercises.",
          ),
          t(
            "5. Sign in using the top right button to create an account or sign in.",
          ),
        ].map((text, i) => (
          <Typography
            key={i}
            sx={{
              mt: 1.5,
              fontSize: "0.88rem",
              color: "text.secondary",
              lineHeight: 1.55,
            }}
          >
            {text}
          </Typography>
        ))}
        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={() => setOpenInfoModal(false)}
          sx={{
            mt: 2.5,
            background: GRAD,
            color: "white",
            borderRadius: "999px",
            fontWeight: 700,
            fontSize: "0.85rem",
            py: 1,
            "&:hover": { opacity: 0.88 },
          }}
        >
          {t("Close")}
        </Button>
      </Box>
    </Modal>
  );
};

// ─── TrainerGPT/ChatLog ───────────────────────────────────────────────────────
const ChatLog = ({
  messages,
  message,
  setMessage,
  isLoading,
  sendMessage,
  clearChatLog,
  handleKeyPress,
  customComponents,
  handleMicrophoneClick,
  isSpeaking,
  isListening,
  incompleteResponse,
  handleContinue,
  image,
  t,
  isMobile,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const c = {
    border: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    icon: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)",
    hoverBg: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)",
    pillBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
  };

  const [showSuggestions, setShowSuggestions] = useState(messages.length <= 1);

  const suggestions = [
    t("Make me a workout plan"),
    t("This is the equipment I have available: "),
    t("How do I do a push up?"),
  ];

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    setShowSuggestions(false);
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const AIAvatar = () => (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "9px",
        flexShrink: 0,
        background: GRAD,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mr: 1,
        mt: 0.25,
        boxShadow: "0 2px 8px rgba(229,57,53,0.28)",
      }}
    >
      <Typography
        sx={{
          color: "white",
          fontWeight: 900,
          fontSize: "0.65rem",
          letterSpacing: "0.03em",
        }}
      >
        AI
      </Typography>
    </Box>
  );

  return (
    <Stack
      direction="column"
      width="100%"
      flex={1}
      overflow="clip"
      minHeight={0}
    >
      {/* Messages */}
      <Stack
        direction="column"
        spacing={2}
        flexGrow={1}
        overflow="auto"
        padding={2}
        minHeight={0}
        className="chat-log"
        sx={{
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
            borderRadius: "4px",
          },
        }}
      >
        {messages?.map((msg, index) => (
          <Box
            key={index}
            display="flex"
            justifyContent={
              msg.role === "assistant" ? "flex-start" : "flex-end"
            }
            alignItems="flex-start"
          >
            {msg.role === "assistant" && <AIAvatar />}
            <Box
              sx={{
                bgcolor:
                  msg.role === "assistant"
                    ? "background.bubbles"
                    : "transparent",
                background: msg.role === "user" ? GRAD : undefined,
                color: msg.role === "assistant" ? "text.primary" : "white",
                borderRadius: "16px",
                p: 2,
                maxWidth: "75%",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                boxShadow:
                  msg.role === "user"
                    ? "0 2px 12px rgba(229,57,53,0.22)"
                    : undefined,
              }}
            >
              <ReactMarkdown components={customComponents}>
                {msg.content}
              </ReactMarkdown>
            </Box>
            {msg.role === "user" && image && (
              <Image
                src={image}
                alt={t("image")}
                width={34}
                height={34}
                style={{
                  marginLeft: 8,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                  transform: "scaleX(-1)",
                }}
              />
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Stack>

      {/* Continue button */}
      {incompleteResponse && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2, pb: 1 }}>
          <Button
            onClick={handleContinue}
            sx={{
              background: GRAD,
              color: "white",
              borderRadius: "999px",
              fontWeight: 600,
              fontSize: "0.82rem",
              px: 2.5,
              py: 0.8,
              "&:hover": { opacity: 0.88 },
            }}
          >
            {t("Continue")}
          </Button>
        </Box>
      )}

      {/* Suggestion pills */}
      {showSuggestions && (
        <Box
          sx={{
            px: 2,
            pb: 1,
            overflowX: "auto",
            "&::-webkit-scrollbar": { height: "3px" },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
              borderRadius: "3px",
            },
          }}
        >
          <Stack direction="row" spacing={1} sx={{ flexWrap: "nowrap" }}>
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  textTransform: "none",
                  flexShrink: 0,
                  bgcolor: c.pillBg,
                  color: "text.secondary",
                  borderRadius: "999px",
                  border: `1px solid ${c.border}`,
                  px: 2,
                  py: 0.7,
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: c.hoverBg, color: "text.primary" },
                }}
              >
                {suggestion}
              </Button>
            ))}
          </Stack>
        </Box>
      )}

      {/* Input row */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ px: 2, pb: 2, pt: 0.5, alignItems: "center" }}
      >
        <TextField
          placeholder={t("Message")}
          fullWidth
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          aria-label={t("Message input field")}
          sx={{
            "& .MuiInputBase-root": { borderRadius: "999px", height: 48 },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: c.border,
              borderRadius: "999px",
            },
          }}
        />

        {/* Mic */}
        <Button
          onClick={handleMicrophoneClick}
          disabled={isLoading}
          sx={{
            width: 48,
            height: 48,
            minWidth: 48,
            borderRadius: "50%",
            border: `1px solid ${c.border}`,
            color: c.icon,
            "&:hover": { bgcolor: c.hoverBg },
          }}
        >
          {isSpeaking ? (
            <StopIcon fontSize="small" />
          ) : isListening ? (
            <SettingsVoiceIcon fontSize="small" />
          ) : (
            <KeyboardVoiceIcon fontSize="small" />
          )}
        </Button>

        {/* Send */}
        <Button
          onClick={sendMessage}
          disabled={isLoading || isListening}
          sx={{
            width: 48,
            height: 48,
            minWidth: 48,
            borderRadius: "50%",
            background: !(isLoading || isListening) ? GRAD : undefined,
            color: "white",
            "&:hover": { opacity: 0.88 },
            "&.Mui-disabled": {
              bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
              color: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)",
            },
          }}
        >
          {isLoading ? (
            <CircularProgress size={18} sx={{ color: "inherit" }} />
          ) : (
            <SendIcon fontSize="small" />
          )}
        </Button>

        {/* Delete */}
        <Button
          onClick={() => {
            if (
              window.confirm(t("Are you sure you want to delete the chat?"))
            ) {
              clearChatLog();
              setShowSuggestions(true);
            }
          }}
          disabled={isLoading || isListening}
          sx={{
            width: 48,
            height: 48,
            minWidth: 48,
            borderRadius: "50%",
            border: `1px solid ${c.border}`,
            color: c.icon,
            "&:hover": { bgcolor: c.hoverBg },
          }}
        >
          <DeleteIcon fontSize="small" />
        </Button>
      </Stack>
    </Stack>
  );
};

// ─── TrainerGPTPage ───────────────────────────────────────────────────────────
const TrainerGPTPage = ({ setValue }) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { localData, setLocalData, localMessages, setLocalMessages } =
    useContext(GuestContext);
  const { t, i18n } = useTranslation();
  const [prefLanguage, setPrefLanguage] = useState("");
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    const displayName = user?.fullName || "User";
    const personalizedWelcome = t("welcome", { name: displayName });
    setMessages([{ role: "assistant", content: personalizedWelcome }]);
    setLocalMessages([{ role: "assistant", content: personalizedWelcome }]);
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

    const initializeData = async () => {
      if (localData.Age && localMessages.length > 0) {
        setData(localData);
        setFormData(localData);
        setMessages(localMessages);
        setLoading(false);
      }
      if (isLoaded && user) {
        const data = await getUserData();
        if (data) {
          setData(data);
          setFormData(data);
          setLocalData(data);
          await loadChatLog(user.id, i18n.language);
          await updateEquipment();
        }
        setLoading(false);
      }
    };

    fetchAndSetLanguage();
    initializeData();
  }, [user]);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);
  const theme = darkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [_formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);
    let equipments = [];
    if (message.includes(":")) {
      let parts = message.split(":");
      if (parts[0].toLowerCase().includes("equipment")) {
        equipments = parts[1].split(",").flatMap((part) => part.split("and"));
        equipments = equipments.map((equipment) => equipment.trim());
      }
    }

    const userMessage = { role: "user", content: message };
    const initialAssistantMessage = { role: "assistant", content: "" };

    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      initialAssistantMessage,
    ]);

    setMessage("");

    try {
      let responseContent = ``;
      const resolvedData = data;
      const {
        Age,
        Sex,
        Weight,
        Height,
        Goals,
        Activity,
        Health,
        Availability,
      } = resolvedData || {};
      responseContent += `Based on your profile:
      - Age: ${Age || "Not provided"}
      - Sex: ${Sex || "Not provided"}
      - Weight: ${Weight || "Not provided"}
      - Height: ${Height || "Not provided"}
      - Goals: ${Goals || "Not provided"}
      - Activity Level: ${Activity || "Not provided"}
      - Health issues or injuries: ${Health || "Not provided"}
      - Availability: ${Availability || "Not provided"}
      `;
      const resolvedEquipmentList = equipmentList;
      let equipmentContent = `Available Equipment:\n`;
      resolvedEquipmentList.forEach((item) => {
        equipmentContent += `${item.name}\n`;
      });
      responseContent += equipmentContent;

      const exerciseNames = extractExerciseName(message);
      for (const element of exerciseNames) {
        let links = getYouTubeLinksForExercise(element);
        responseContent += `Here are some YouTube links for ${element}: \n\n`;
        links.forEach((link) => {
          responseContent += `${link}\n`;
        });
      }
      const combinedInput = `User: ${message}\n${responseContent}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          ...messages,
          { role: "user", content: combinedInput },
          { role: "assistant", content: combinedInput },
        ]),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantResponse = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        assistantResponse += text;

        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          const updatedMessages = [
            ...prevMessages.slice(0, prevMessages.length - 1),
            { ...lastMessage, content: lastMessage.content + text },
          ];
          return updatedMessages;
        });
      }
      await setExercisePlan(assistantResponse);
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg, index) =>
          index === prevMessages.length - 1
            ? { ...msg, content: assistantResponse }
            : msg,
        );
        equipments.forEach(async (equipment) => {
          const sanitizedItemName = equipment.replace(/\//g, " and ");
          const quantity = 1;

          if (user) {
            const userId = user.id;
            const docRef = doc(
              firestore,
              "users",
              userId,
              "equipment",
              sanitizedItemName,
            );
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const { count, image: existingImage } = docSnap.data();
              await setDoc(docRef, {
                count: count + quantity,
                image: existingImage,
              });
            } else {
              await setDoc(docRef, { count: quantity, image: "" });
            }
          }
        });

        if (user) {
          saveChatLog(user.id, i18n.language, updatedMessages);
        }
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: "assistant",
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const chatLog = document.querySelector(".chat-log");
    if (chatLog) {
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  }, [messages]);

  const saveChatLog = async (userId, languageCode, messages) => {
    try {
      const docRef = doc(firestore, "users", userId, "chat", languageCode);
      await setDoc(docRef, { messages: messages, timestamp: new Date() });
    } catch (error) {
      console.error("Error saving chat log:", error);
    }
  };
  const loadChatLog = async (userId, languageCode) => {
    try {
      const docRef = doc(firestore, "users", userId, "chat", languageCode);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMessages(data.messages);
        setLocalMessages(data.messages);
      } else {
        const displayName = user?.fullName || "User";
        const personalizedWelcome = t("welcome", { name: displayName });
        setMessages([{ role: "assistant", content: personalizedWelcome }]);
      }
    } catch (error) {
      console.error("Error loading chat log:", error);
    }
  };
  const clearChatLog = async () => {
    try {
      if (user) {
        const docRef = doc(firestore, "users", user.id, "chat", i18n.language);
        await deleteDoc(docRef);
        const displayName = user.fullName || "User";
        const personalizedWelcome = t("welcome", { name: displayName });
        setMessages([{ role: "assistant", content: personalizedWelcome }]);
      }
    } catch (error) {
      console.error("Error clearing chat log:", error);
    }
  };
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        const userData = await getUserData();
        setData(userData);
        await loadChatLog(user.id, i18n.language);
        await updateEquipment();
      };
      fetchData();
    }
  }, [user, i18n.language]);

  const [data, setData] = useState("");
  const getUserData = async () => {
    if (user) {
      const userId = user.id;
      const userDocRef = doc(firestore, "users", userId);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().userData : null;
    }
    return null;
  };

  const [equipmentList, setEquipmentList] = useState([]);
  const getYouTubeLinksForExercise = (exerciseName) => {
    const exercise = exerciseData.find(
      (ex) => ex.name.toLowerCase() === exerciseName.toLowerCase(),
    );
    if (exercise) return exercise.youtubeLinks;
    return [];
  };
  const updateEquipment = async () => {
    if (user) {
      const userUID = user.id;
      const docRef = collection(firestore, "users", userUID, "equipment");
      const docs = await getDocs(docRef);
      const equipment = [];
      docs.forEach((doc) => {
        equipment.push({ name: doc.id });
      });
      setEquipmentList(equipment);
    }
  };
  const extractExerciseName = (message) => {
    let ret = [];
    const lowerCaseMessage = message.toLowerCase();
    for (const exercise of exerciseData) {
      for (const [, translation] of Object.entries(exercise.translations)) {
        if (lowerCaseMessage.includes(translation.toLowerCase())) {
          ret.push(exercise.name);
        }
      }
    }
    return ret;
  };

  const setExercisePlan = async (response) => {
    if (response.includes(t("plan"))) {
      if (user) {
        const userId = user.id;
        const userDocRef = doc(firestore, "users", userId);
        await setDoc(userDocRef, { plan: response }, { merge: true });
      }
      if (setValue) setValue(3);
    }
  };

  const [openInfoModal, setOpenInfoModal] = useState(false);
  const handleInfoModal = () => {
    setOpenInfoModal(true);
  };
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = prefLanguage;

      recognitionInstance.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setMessage(finalTranscript + interimTranscript);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        setMessage("");
      };

      setRecognition(recognitionInstance);
    } else {
      alert(t("Your browser does not support speech recognition."));
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      const audio = new Audio("/start-sound.mp3");
      audio.play();
      recognition.lang = microphoneLocale;
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleMicrophoneClick = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (!isListening) {
      startListening();
    } else {
      stopListening();
      sendMessage();
    }
  };

  const getMicrophoneLocale = (language) => {
    if (language === "cn") return "zh-cn";
    if (language === "tc") return "zh-tw";
    if (language === "jp") return "ja";
    if (language === "kr") return "ko";
    return language;
  };

  const microphoneLocale = getMicrophoneLocale(i18n.language);

  const [incompleteResponse, setIncompleteResponse] = useState(false);

  const handleContinue = () => {
    setIncompleteResponse(false);
    sendMessage();
  };

  const [image, setImage] = useState("");

  useEffect(() => {
    const getImage = async () => {
      if (user) {
        const userDocRef = doc(firestore, "users", user.id);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setImage(userDoc.data().profilePic);
        }
      }
    };
    getImage();
  }, [user]);

  if (loading) {
    return <Loading t={t} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        overflow="clip"
        sx={{ minHeight: 0 }}
      >
        <TrainerGPTInfoModal
          t={t}
          openInfoModal={openInfoModal}
          setOpenInfoModal={setOpenInfoModal}
        />

        <TrainerGPTHeader
          t={t}
          prefLanguage={prefLanguage}
          handleLanguageChange={handleLanguageChange}
          handleInfoModal={handleInfoModal}
        />

        <ChatLog
          messages={messages}
          message={message}
          setMessage={setMessage}
          isLoading={isLoading}
          sendMessage={sendMessage}
          clearChatLog={clearChatLog}
          handleKeyPress={handleKeyPress}
          customComponents={customComponents}
          handleMicrophoneClick={handleMicrophoneClick}
          isSpeaking={isSpeaking}
          isListening={isListening}
          incompleteResponse={incompleteResponse}
          handleContinue={handleContinue}
          image={image}
          t={t}
          isMobile={isMobile}
        />
      </Box>
    </ThemeProvider>
  );
};

export default TrainerGPTPage;
