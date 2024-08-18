"use client"
import { Box, Stack, Typography, Button, TextField, CssBaseline, ThemeProvider, useMediaQuery, FormControl, InputLabel, NativeSelect, Link, Divider } from '@mui/material'
import { useEffect, useState, useCallback } from 'react'
import { createTheme } from '@mui/material';
// import icons
import PersonIcon from '@mui/icons-material/Person';
import AssistantIcon from '@mui/icons-material/Assistant';
// translations
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Adjust the path as necessary
// Clerk imports
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
// Firebase imports
import { firestore } from '../firebase'
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
// linebreaks
import ReactMarkdown from 'react-markdown';
// import guestContext
import { useContext } from 'react';
import { GuestContext } from '../page'; // Adjust the path based on your structure


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

const exerciseData = [
  {
    name: 'Push-Up',
    youtubeLinks: [
      'https://youtube.com/shorts/0RdBA5ntIy0',
    ],
  },
  {
    name: 'Push Up',
    youtubeLinks: [
      'https://youtube.com/shorts/0RdBA5ntIy0',
    ],
  },
  {
    name: 'Squat',
    youtubeLinks: [
      'https://youtube.com/shorts/LnMFhMJ70HM',
    ],
  },
  {
    name: 'Plank',
    youtubeLinks: [
      'https://youtube.com/shorts/SoC0faVmmrk',
    ],
  },
  {
    name: 'Burpee',
    youtubeLinks: [
      'https://youtube.com/shorts/jGuv9WphUw0',
    ],
  },
  {
    name: 'Lunge',
    youtubeLinks: [
      'https://youtube.com/shorts/LDTnaPmU9HE',
    ],
  },
  {
    name: 'Deadlift',
    youtubeLinks: [
      'https://youtube.com/shorts/gxHZ0OYRBjI',
      'https://www.youtube.com/watch?v=bsII141KWpI&t=94s',
    ],
  },
  {
    name: 'Bench Press',
    youtubeLinks: [
      'https://youtube.com/shorts/YGHJgHB4PIU',
    ],
  },
  {
    name: 'Dumbbell Press',
    youtubeLinks: [
      'https://youtube.com/shorts/teARc9E-WW4',
    ],
  },
  {
    name: 'Dumbbell Flyes',
    youtubeLinks: [
      'https://youtube.com/shorts/Wkqk3WMIAeY',
    ],
  },
  {
    name: 'Barbell Curl',
    youtubeLinks: [
      'https://youtube.com/shorts/mpEFR1-v12s',
      
    ],
  },
  {
    name: 'Dumbbell Curl',
    youtubeLinks: [
      'https://youtube.com/shorts/Im1l3OrPRp4',
      
    ],
  },
  {
    name: 'Bicep Curl',
    youtubeLinks: [
      'https://youtube.com/shorts/mpEFR1-v12s',
      'https://youtube.com/shorts/Im1l3OrPRp4',
      
    ],
  },
  {
    name: 'Pull-Up',
    youtubeLinks: [
      'https://www.youtube.com/shorts/bdRkHBBfDMs',
    ],
  },
  {
    name: 'Pull Up',
    youtubeLinks: [
      'https://www.youtube.com/shorts/bdRkHBBfDMs',
    ],
  },
  {
    name: 'Mountain Climber',
    youtubeLinks: [
      'https://youtube.com/shorts/SADXvZWs7Ac',
    ],
  },
  {
    name: 'Tricep Dip',
    youtubeLinks: [
      'https://youtube.com/shorts/1bZE5aJfvVc',
    ],
  },
  {
    name: 'Shoulder Press',
    youtubeLinks: [
      'https://youtube.com/shorts/gNhSyjiNy0c',
      'https://youtube.com/shorts/vYG-77uMSaY',
    ]
  },
  {
    name: 'Dumbbell Shoulder Press',
    youtubeLinks: [
      'https://youtube.com/shorts/vYG-77uMSaY',
    ]
  },
  {
    name: 'Overhead Press',
    youtubeLinks: [
      'https://youtube.com/shorts/gNhSyjiNy0c',
    ]
  },
  {
    name: 'Face Pulls',
    youtubeLinks: [
      'https://youtube.com/shorts/F3lsQMekW-4',
    ]
  },
];


// link color
const customComponents = {
  a: ({ href, children }) => (
    <Link href={href} color="background.link" underline="hover">
      {children}
    </Link>
  ),
};

const TrainerGPTPage = () => {
  // guest mode
  const {guestData, guestEquipment, guestMessages, setGuestMessages, setGuestPlan} = useContext(GuestContext)
  // Implementing multi-languages
  const { t, i18n } = useTranslation();
  const { user, isSignedIn } = useUser(); // Clerk user
  const [prefLanguage, setPrefLanguage] = useState('');
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

  // Sending messages
  const [messages, setMessages] = useState([{ role: 'assistant', content: t('welcome', { name: t('guest') }) }]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    const userMessage = { role: 'user', content: message };
    const initialAssistantMessage = { role: 'assistant', content: '' };

    // add user message to list of all messages
    setMessages((prevMessages) => [...prevMessages, userMessage, initialAssistantMessage]);

    setMessage(''); // Clear the input field

    try {
      // RAGS FOR INFO
      const resolvedData = user ? await data : await guestData;
      let responseContent = ``;
      const { Age, Sex, Weight, Height, Goals, Activity, Health, Availability } = resolvedData || {};
      responseContent += `Based on your profile:
      - Age: ${Age || 'Not provided'}
      - Sex: ${Sex || 'Not provided'}
      - Weight: ${Weight || 'Not provided'}
      - Height: ${Height || 'Not provided'}
      - Goals: ${Goals || 'Not provided'}
      - Activity Level: ${Activity || 'Not provided'}
      - Health issues or injuries: ${Health || 'Not provided'}
      - Availability: ${Availability || 'Not provided'}
      `;
      // RAGS FOR EQUIPMENT
      const resolvedEquipmentList = user ? await equipmentList : await guestEquipment;
      let equipmentContent = `Available Equipment:\n`;
      resolvedEquipmentList.forEach((item) => {
        equipmentContent += `${item.name}\n`;
      });
      responseContent += equipmentContent;

      // find exercise names in message, if so, upload youtube links
      const exerciseNames = extractExerciseName(message);
      exerciseNames.forEach((exercise) => {
        let links = getYouTubeLinksForExercise(exercise);
        responseContent += `Here are some YouTube links for ${exercise}: \n\n`;
        links.forEach((link) => {
          responseContent += `${link}\n`;
        });
      });

      // combine input, send api request
      const combinedInput = `User: ${message}\nPersonalized Data: ${responseContent}`;
      const response = await fetch('../api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([...messages, { role: 'user', content: combinedInput }, { role: 'assistant', content: combinedInput }]),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // assistant response COULD IMPLEMENT SAVING WORKOUT PLAN HERE
      let assistantResponse = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        assistantResponse += text;

        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          const updatedMessages = [...prevMessages.slice(0, prevMessages.length - 1), { ...lastMessage, content: lastMessage.content + text }];
          return updatedMessages;
        });
      }
      setExercisePlan(assistantResponse)
      // console.log(assistantResponse)
      // set messages with new message
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg, index) =>
          index === prevMessages.length - 1 ? { ...msg, content: assistantResponse } : msg
        );
        
        // save chat logs
        if (user) {
          saveChatLog(user.id, i18n.language, updatedMessages);
        }
        else{
          setGuestMessages(updatedMessages)
        }

        return updatedMessages;
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." }]);
    }

    setIsLoading(false);
  };

  // Quality of life improvements
  // if press enter, send message
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };
  // scroll to bottom after new message
  useEffect(() => {
    const chatLog = document.querySelector('.chat-log');
    if (chatLog) {
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  }, [messages]);

  // Saving, loading, and clearing chat
  const saveChatLog = async (userId, languageCode, messages) => {
    try {
      const docRef = doc(firestore, 'users', userId, 'chat', languageCode);
      await setDoc(docRef, {
        messages: messages,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error saving chat log:", error);
    }
  };
  const loadChatLog = async (userId, languageCode) => {
    try {
      const docRef = doc(firestore, 'users', userId, 'chat', languageCode);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMessages(data.messages);
      } else {
        const displayName = user?.fullName || 'User';
        const personalizedWelcome = t('welcome', { name: displayName });
        setMessages([{ role: 'assistant', content: personalizedWelcome }]);
      }
    } catch (error) {
      console.error("Error loading chat log:", error);
    }
  };
  const clearChatLog = async () => {
    try {
      if (user) {
        const docRef = doc(firestore, 'users', user.id, 'chat', i18n.language);
        await deleteDoc(docRef);
        const displayName = user.fullName || 'User';
        const personalizedWelcome = t('welcome', { name: displayName });
        setMessages([{ role: 'assistant', content: personalizedWelcome }]);
      } else {
        setMessages([{ role: 'assistant', content: t('welcome', { name: t('guest') }) }]);
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
    } else if (guestMessages.length > 0) {
        setMessages(guestMessages);
    }
      else{
        clearChatLog()
      }
  
}, [user, i18n.language, guestMessages]);

  // USER RAG
  const [data, setData] = useState('');
  const getUserData = async () => {
    if (user) {
      const userId = user.id;
      const userDocRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().userData : null;
    }
    return null;
  };

  // EQUIPMENT RAG
  const [equipmentList, setEquipmentList] = useState([])
  // get YoutubeLinks
  const getYouTubeLinksForExercise = (exerciseName) => {
    const exercise = exerciseData.find(
      (ex) => ex.name.toLowerCase() === exerciseName.toLowerCase()
    );
  
    if (exercise) {
      return exercise.youtubeLinks;
    } else {
      return [];
    }
  };
  // update equipment based on firebase
  const updateEquipment = async () => {
    if (user) {
      const userUID = user.id;
      // const snapshot = query(collection(firestore, pantry_${userUID}));
      // const snapshot = query(collection((firestore, 'users', userUID, 'pantry')));
      const docRef = collection(firestore, 'users', userUID, 'equipment');
      const docs = await getDocs(docRef);
      const equipment = [];
      docs.forEach((doc) => {
        equipment.push({ name: doc.id});
      });
      setEquipmentList(equipment);
    }
  };
  const extractExerciseName = (message) => {
    let ret = []
    // Convert the message to lowercase for case-insensitive matching
    const lowerCaseMessage = message.toLowerCase();
  
    // Iterate through the exerciseData array to find a matching exercise name
    for (let i = 0; i < exerciseData.length; i++) {
      const exercise = exerciseData[i];
      const exerciseName = exercise.name.toLowerCase();
  
      // Check if the exercise name exists in the message
      if (lowerCaseMessage.includes(exerciseName)) {
        ret.push(exercise.name); // Return the original case-sensitive exercise name
      }
    }
  
    // If no match is found, return null or an empty string
    return ret;
  };

  // STORE PLAN
  // Store preferred language on Firebase
  const setExercisePlan = async (response) => {
    if(response.includes("plan")){
      console.log(response)
      if (user) {
        const userId = user.id;
        const userDocRef = doc(firestore, 'users', userId);
        await setDoc(userDocRef, { plan: response }, { merge: true });
      }
      else{
        setGuestPlan(response)
      }
    }
  };

  return (
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
          {/* switch language */}
          <FormControl sx={{ width: '85px' }}>
            <InputLabel variant="standard" htmlFor="uncontrolled-native">
              {t('language')}
            </InputLabel>
            <NativeSelect
              defaultValue={t('en')}
              onChange={handleLanguageChange}
              inputProps={{
                name: t('language'),
                id: 'uncontrolled-native',
              }}
              sx={{
                '& .MuiNativeSelect-select': {
                  '&:focus': { backgroundColor: 'transparent' },
                },
                '&::before': { borderBottom: 'none' },
                '&::after': { borderBottom: 'none' },
              }}
              disableUnderline
            >
              <option value="en">English</option>
              <option value="cn">中文（简体）</option>
              <option value="tc">中文（繁體）</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="jp">日本語</option>
              <option value="kr">한국어</option>
            </NativeSelect>
          </FormControl>
          {/* title */}
          <Box display="flex" flexDirection={"row"} alignItems={"center"}>
            <Typography variant="h6" color="text.primary" textAlign="center">
              {t('trainerGPT')}
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

        {/* body */}
        <Stack
          direction="column"
          width="100vw"
          height={isMobile ? "70%" : "90%"}
        >
          {/* messages */}
          <Stack direction="column" spacing={2} flexGrow={1} overflow='auto' padding={2} className="chat-log">
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              >
                {message.role === 'assistant' && (
                  <AssistantIcon sx={{ mr: 1, color: 'text.primary', fontSize: '2.5rem' }} />
                )}
                <Box
                  bgcolor={message.role === 'assistant' ? 'background.bubbles' : 'background.userBubble'}
                  color={message.role === 'assistant' ? "text.primary" : 'black'}
                  borderRadius={3.5}
                  paddingX={3.5}
                  paddingY={2.5}
                  sx={{
                    maxWidth: '75%',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  <ReactMarkdown components={customComponents}>{message.content}</ReactMarkdown>
                </Box>
                {message.role === 'user' && (
                  <PersonIcon sx={{ ml: 1, color: 'text.primary', fontSize: '2.5rem' }} />
                )}
              </Box>
            ))}
          </Stack>
          {/* textfield, send button, clear chat */}
          <Stack direction="row" spacing={2} padding={2} sx={{ width: '100%', bottom: 0 }}>
            {/* input field */}
            <TextField
              label={t('Message')}
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            ></TextField>
            {/* send button */}
            <Button
              variant="outlined"
              onClick={sendMessage}
              sx={{
                color: 'text.primary',
                borderColor: 'text.primary',
                '&:hover': {
                  backgroundColor: 'text.primary',
                  color: 'background.default',
                  borderColor: 'text.primary',
                },
              }}
            >
              {t('send')}
            </Button>
            {/* clear chat */}
            <Button
              onClick={clearChatLog}
              variant="outlined"
              sx={{
                color: 'text.primary',
                borderColor: 'text.primary',
                '&:hover': {
                  backgroundColor: 'text.primary',
                  color: 'background.default',
                  borderColor: 'text.primary',
                },
              }}
            >
              {t('clear')}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}

export default TrainerGPTPage;
