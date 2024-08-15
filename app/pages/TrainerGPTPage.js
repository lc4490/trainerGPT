// src/pages/trainerGPTPage.js
"use client"
import { Box, Stack, Typography, Button, TextField, CssBaseline, ThemeProvider, useMediaQuery, FormControl, InputLabel, NativeSelect, Link, Divider } from '@mui/material'
import { useEffect, useState } from 'react'
// light/dark mode
import { createTheme } from '@mui/material';
// import icons
import PersonIcon from '@mui/icons-material/Person';
import AssistantIcon from '@mui/icons-material/Assistant';
// translations
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Adjust the path as necessary
// use googlesignin
import { firestore, auth, provider, signInWithPopup, signOut } from '../firebase'
import { collection, getDocs, query, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
// linebreaks
import ReactMarkdown from 'react-markdown';

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
  // Implementing multi-languages
  const { t, i18n } = useTranslation();
  // set preferred language locally
  const [prefLanguage, setPrefLanguage] = useState('');
  // change languages
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    if (user) {
      const displayName = user.displayName || 'User';
      // const firstName = displayName.split(' ')[0]; // Extract the first name
  
      // Set the personalized welcome message
      const personalizedWelcome = t('welcome', { name: displayName });
  
      setMessages([
        { role: 'assistant', content: personalizedWelcome }
      ]);
    }
    else{
      setMessages([{ role: 'assistant', content: t('welcome', {name: t('guest')}) }]);
    }
    
  };
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setPrefLanguage(newLanguage)
    changeLanguage(newLanguage);
    setPreferredLanguage(newLanguage);
  };
  // Store preferred language on firebase
  const setPreferredLanguage = async (language) => {
    if (auth.currentUser) {
      const userUID = auth.currentUser.uid;
      const userDocRef = doc(firestore, 'users', userUID);
      await setDoc(userDocRef, { preferredLanguage: language }, { merge: true });
    }
  };
  const getPreferredLanguage = async () => {
    if (auth.currentUser) {
      const userUID = auth.currentUser.uid;
      const userDocRef = doc(firestore, 'users', userUID);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().preferredLanguage : null;
    }
    return null;
  };
  // fetch/set languages at all tiimes
  useEffect(() => {
    const fetchAndSetLanguage = async () => {
      const preferredLanguage = await getPreferredLanguage();
      if (preferredLanguage) {
        setPrefLanguage(preferredLanguage)
        i18n.changeLanguage(preferredLanguage);
      }
    };

    fetchAndSetLanguage();
  }, []);

  // Implementing theming
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);
  const theme = darkMode ? darkTheme : lightTheme;

  // sending messages
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('welcome', {name: t('guest')}) }
    ]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const sendMessage = async () => {
      if (!message.trim() || isLoading) return;
      setIsLoading(true);
    
      const userMessage = { role: 'user', content: message };
      const initialAssistantMessage = { role: 'assistant', content: '' };
    
      // Update the messages state with the user's message and an empty assistant message
      setMessages((prevMessages) => [
        ...prevMessages,
        userMessage,
        initialAssistantMessage,
      ]);
    
      setMessage(''); // Clear the input field
    
      try {
        // RAGS FOR INFO
        // Retrieve personalized data
        const resolvedData = await data;
        let responseContent = ``;
        const { Age, Sex, Weight, Height, Goals, ActivityLevel, Health, Availability } = resolvedData || {};
        // Build the response
        responseContent += `Based on your profile:
        - Age: ${Age || 'Not provided'}
        - Sex: ${Sex || 'Not provided'}
        - Weight: ${Weight || 'Not provided'}
        - Height: ${Height || 'Not provided'}
        - Goals: ${Goals || 'Not provided'}
        - Activity Level: ${ActivityLevel || 'Not provided'}
        - Health issues or injuries: ${Health || 'Not provided'}
        - Availability: ${Availability || 'Not provided'}

        `;
        // RAGS FOR EQUIPMENT
        const resolvedEquipmentList = await equipmentList;
        let equipmentContent = `Available Equipment:\n`;
        for(let i = 0; i < resolvedEquipmentList.length; i++){
          equipmentContent += `${resolvedEquipmentList[i].name}\n`
        }
        responseContent += equipmentContent
        // RAGS FOR LINKS
        // Extract the exercise name
        const exerciseNames = extractExerciseName(message);
        
        for(let i = 0; i < exerciseNames.length; i++){
          let links = getYouTubeLinksForExercise(exerciseNames[i])
          responseContent += `Here are some YouTube links for ${exerciseNames[i]}: \n\n`;
          links.forEach(link => {
            responseContent += `${link}\n`;
          });
        }
    
        // Combine with AI-generated response (if applicable)
        const combinedInput = `User: ${message}\nPersonalized Data: ${responseContent}`;
    
        // Generate response from the AI model
        const response = await fetch('../api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            ...messages, 
            { role: 'user', content: combinedInput },
            { role: 'assistant', content: combinedInput }
          ]),
        });
    
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
    
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
    
        let assistantResponse = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          assistantResponse += text;
    
          // Update the last assistant message in the messages state
          setMessages((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            const updatedMessages = [
              ...prevMessages.slice(0, prevMessages.length - 1),
              { ...lastMessage, content: lastMessage.content + text },
            ];
    
            return updatedMessages;
          });
        }
    
        // Once the assistant response is complete, save the chat log
        setMessages((prevMessages) => {
          const updatedMessages = prevMessages.map((msg, index) =>
            index === prevMessages.length - 1 ? { ...msg, content: assistantResponse } : msg
          );
    
          if (user) {
            saveChatLog(user.uid, i18n.language, updatedMessages);
          } 
          // else {
          //   saveChatLogLocal(i18n.language, updatedMessages);
          // }
    
          return updatedMessages;
        });
      } catch (error) {
        console.error('Error:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
        ]);
      }
    
      setIsLoading(false);
    };
  // If press enter, send message
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Google Auth
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User signed in:', user);
      setGuestMode(false); // Disable guest mode on successful sign-in
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Sign in failed: ' + error.message);
    }
  };
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
      setUser(null);
      setGuestMode(true); // Enable guest mode on sign-out
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Sign out failed: ' + error.message);
    }
  };
  // Set User
  const [user, setUser] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [name, setName] = useState(null);
  // Check at all times who the user is
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setName(user.displayName);
        setGuestMode(false);
      } else {
        setUser(null);
        setName("Guest");
        setGuestMode(true);
      }
    });
    return () => unsubscribe();
  }, []);
  // Change welcome message based on user
  useEffect(() => {
    if (user) {
      const displayName = " " + user.displayName || 'User';
      // const firstName = displayName.split(' ')[0]; // Extract the first name
  
      // Set the personalized welcome message
      const personalizedWelcome = t('welcome', { name: displayName });
  
      setMessages([
        { role: 'assistant', content: personalizedWelcome }
      ]);
    }
    else{
      const displayName = "guest";
      // const firstName = displayName.split(' ')[0]; // Extract the first name
  
      // Set the personalized welcome message
      const personalizedWelcome = t('welcome', { name: displayName });
  
      setMessages([
        { role: 'assistant', content: personalizedWelcome }
      ]);
    }
  }, [user]); // This useEffect will run whenever the user state changes

  // Utilizing RAG for custom YouTube links
  
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

  // Logging chat history
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
      // const docRef = doc(firestore, 'chatLogs', userId, 'languages', languageCode);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMessages(data.messages);
      } else {
        if (user) {
          const displayName = user.displayName || 'User';
          const personalizedWelcome = t('welcome', { name: displayName });
      
          setMessages([
            { role: 'assistant', content: personalizedWelcome }
          ]);
        } else {
          setMessages([{ role: 'assistant', content: t('welcome', { name: t('guest') }) }]);
        }
      }
    } catch (error) {
      console.error("Error loading chat log:", error);
    }
  };  
  const clearChatLog = async () => {
    try {
      // const docRef = doc(firestore, 'chatLogs', user.uid, 'languages', i18n.language);
      if (user) {
        const docRef = doc(firestore, 'users', user.uid, 'chat', i18n.language);
        await deleteDoc(docRef);
        const displayName = user.displayName || 'User';
        const personalizedWelcome = t('welcome', { name: displayName });
    
        setMessages([
          { role: 'assistant', content: personalizedWelcome }
        ]);
      } else {
        setMessages([{ role: 'assistant', content: t('welcome', { name: t('guest') }) }]);
      }
    } catch (error) {
      console.error("Error clearing chat log:", error);
    }
  };

  // DATA RAG
  const [data, setData] = useState('');
  // Retrieve user data from Firestore
  const getUserData = async () => {
    if (auth.currentUser) {
      const userUID = auth.currentUser.uid;
      const userDocRef = doc(firestore, 'users', userUID);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().userData : null;
    }
    return null;
  };
  // EQUIPMENT RAG
  const [equipmentList, setEquipmentList] = useState([])
  // update pantry based on firebase
  const updateEquipment = async () => {
    if (auth.currentUser) {
      const userUID = auth.currentUser.uid;
      // const snapshot = query(collection(firestore, `pantry_${userUID}`));
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

  // Miscellaneous
  // if user change or language change
  useEffect(() => {
    if (user) {
      loadChatLog(user.uid, i18n.language);
      setData(getUserData())
      updateEquipment()
      } 
    // else {
    //   loadChatLogLocal(i18n.language);
    // }
  }, [user, i18n.language]);
  // scroll chat down as search
  useEffect(() => {
    const chatLog = document.querySelector('.chat-log');
    if (chatLog) {
      chatLog.scrollTop = chatLog.scrollHeight;
    }
  }, [messages]);
  // ismobile
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* og box */}
      <Box
        width="100vw"
        height= {isMobile ? "100vh" : "90vh"}
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
          {/* language control  */}
          <FormControl
          sx={{
            width: '85px', // Adjust the width value as needed
          }}
          >
            
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
                  '&:focus': {
                    backgroundColor: 'transparent',
                  },
                },
                '&::before': {
                  borderBottom: 'none',
                },
                '&::after': {
                  borderBottom: 'none',
                },
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
          {/* <Button>Equipment</Button> */}
          {/* title */}
          <Box display="flex" flexDirection={"row"} alignItems={"center"}>
            <Typography variant="h6" color="text.primary" textAlign="center">
              {t('trainerGPT')}
            </Typography>
          </Box>
          {/* signIn/signOut Form */}
          <Box>
            {!user ? (
              <Button
                onClick={handleSignIn}
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
              <Button
              onClick={handleSignOut}
                sx={{
                  backgroundColor: 'background.default',
                  color: 'text.primary',
                  borderColor: 'text.primary',
                  borderWidth: 2,
                  '&:hover': {
                    backgroundColor: 'darkgray',
                    color: 'text.primary',
                    borderColor: 'text.primary',
                  },
                }}
              >
                {t('signOut')}
              </Button>
            )}
          </Box>
        </Box>

        <Divider />

        {/* chat */}
        <Stack
          direction="column"
          width="100vw"
          height={isMobile ? "70%" : "90%"}
        >
          {/* previous messages log */}

          <Stack direction="column" spacing={2} flexGrow={1} overflow='auto' padding={2} className = "chat-log">
            {
              messages.map((message, index) => (
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
                      maxWidth: '75%', // Ensure the box doesn't take up the entire width
                      wordBreak: 'break-word', // Break long words to avoid overflow
                      // whiteSpace: "balance", // Preserve whitespace and line breaks, but wrap text
                      overflowWrap: 'break-word', // Break long words
                    }}
                  >
                    <ReactMarkdown components={customComponents}>{message.content}</ReactMarkdown>
                  </Box>
                  {message.role === 'user' && (
                    <PersonIcon sx={{ ml: 1, color: 'text.primary', fontSize: '2.5rem' }} />
                  )}
                </Box>
              ))
            }
          </Stack>
          {/* input field */}
          <Stack direction="row" spacing={2} padding={2} sx={{ width: '100%', bottom: 0 }}>
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
            {/* clear history */}
            <Button onClick={clearChatLog} 
            variant="outlined" 
            sx={{
              color: 'text.primary',
              borderColor: 'text.primary',
              '&:hover': {
                backgroundColor: 'text.primary',
                color: 'background.default',
                borderColor: 'text.primary',
              },
            }}>
              {t('clear')}
            </Button>
          </Stack>
        </Stack>
        {/* <Box height = {isMobile ? "50px" : "0px"}></Box> */}
      </Box>
    </ThemeProvider>
  );
}

export default TrainerGPTPage;
