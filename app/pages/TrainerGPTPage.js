"use client"
import { MenuItem, Select, ToggleButtonGroup, ToggleButton, FormGroup, FormControlLabel, Checkbox, Box, Stack, Typography, Button, TextField, CssBaseline, ThemeProvider, useMediaQuery, FormControl, InputLabel, NativeSelect, Link, Divider, Modal,Container, CircularProgress } from '@mui/material'
import { useEffect, useState, useCallback } from 'react'
import { createTheme } from '@mui/material';
import { motion } from 'framer-motion';
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
// router
import { useRouter, useSearchParams } from 'next/navigation';
// info button
import InfoIcon from '@mui/icons-material/Info';

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
    translations: {
      en: 'Push-Up',
      cn: '俯卧撑',
      tc: '俯臥撐',
      es: 'Flexión',
      fr: 'Pompe',
      de: 'Liegestütz',
      jp: 'プッシュアップ',
      kr: '푸쉬업',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/0RdBA5ntIy0',
    ],
  },
  {
    name: 'Push Up',
    translations: {
      en: 'Push Up',
      cn: '俯卧撑',
      tc: '俯臥撐',
      es: 'Flexión',
      fr: 'Pompe',
      de: 'Liegestütz',
      jp: 'プッシュアップ',
      kr: '푸쉬업',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/0RdBA5ntIy0',
    ],
  },
  {
    name: 'Squat',
    translations: {
      en: 'Squat',
      cn: '深蹲',
      tc: '深蹲',
      es: 'Sentadilla',
      fr: 'Accroupissement',
      de: 'Kniebeuge',
      jp: 'スクワット',
      kr: '스쿼트',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/LnMFhMJ70HM',
    ],
  },
  {
    name: 'Plank',
    translations: {
      en: 'Plank',
      cn: '平板支撑',
      tc: '平板支撐',
      es: 'Plancha',
      fr: 'Planche',
      de: 'Planke',
      jp: 'プランク',
      kr: '플랭크',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/SoC0faVmmrk',
    ],
  },
  {
    name: 'Burpee',
    translations: {
      en: 'Burpee',
      cn: '波比跳',
      tc: '波比跳',
      es: 'Burpee',
      fr: 'Burpee',
      de: 'Burpee',
      jp: 'バーピー',
      kr: '버피',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/jGuv9WphUw0',
    ],
  },
  {
    name: 'Lunge',
    translations: {
      en: 'Lunge',
      cn: '弓步',
      tc: '弓步',
      es: 'Zancada',
      fr: 'Fente',
      de: 'Ausfallschritt',
      jp: 'ランジ',
      kr: '런지',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/LDTnaPmU9HE',
    ],
  },
  {
    name: 'Deadlift',
    translations: {
      en: 'Deadlift',
      cn: '硬拉',
      tc: '硬舉',
      es: 'Peso muerto',
      fr: 'Soulevé de terre',
      de: 'Kreuzheben',
      jp: 'デッドリフト',
      kr: '데드리프트',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/gxHZ0OYRBjI',
      'https://www.youtube.com/watch?v=bsII141KWpI&t=94s',
    ],
  },
  {
    name: 'Bench Press',
    translations: {
      en: 'Bench Press',
      cn: '卧推',
      tc: '臥推',
      es: 'Press de banca',
      fr: 'Développé couché',
      de: 'Bankdrücken',
      jp: 'ベンチプレス',
      kr: '벤치프레스',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/YGHJgHB4PIU',
    ],
  },
  {
    name: 'Dumbbell Press',
    translations: {
      en: 'Dumbbell Press',
      cn: '哑铃推举',
      tc: '啞鈴推舉',
      es: 'Press con mancuernas',
      fr: 'Développé avec haltères',
      de: 'Kurzhantel-Drücken',
      jp: 'ダンベルプレス',
      kr: '덤벨 프레스',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/teARc9E-WW4',
    ],
  },
  {
    name: 'Dumbbell Flyes',
    translations: {
      en: 'Dumbbell Flyes',
      cn: '哑铃飞鸟',
      tc: '啞鈴飛鳥',
      es: 'Aperturas con mancuernas',
      fr: 'Écartés avec haltères',
      de: 'Kurzhantel-Fliegen',
      jp: 'ダンベルフライ',
      kr: '덤벨 플라이',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/Wkqk3WMIAeY',
    ],
  },
  {
    name: 'Barbell Curl',
    translations: {
      en: 'Barbell Curl',
      cn: '杠铃弯举',
      tc: '槓鈴彎舉',
      es: 'Curl con barra',
      fr: 'Curl barre',
      de: 'Langhantel-Curl',
      jp: 'バーベルカール',
      kr: '바벨 컬',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/mpEFR1-v12s',
    ],
  },
  {
    name: 'Dumbbell Curl',
    translations: {
      en: 'Dumbbell Curl',
      cn: '哑铃弯举',
      tc: '啞鈴彎舉',
      es: 'Curl con mancuernas',
      fr: 'Curl haltère',
      de: 'Kurzhantel-Curl',
      jp: 'ダンベルカール',
      kr: '덤벨 컬',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/Im1l3OrPRp4',
    ],
  },
  {
    name: 'Bicep Curl',
    translations: {
      en: 'Bicep Curl',
      cn: '肱二头肌弯举',
      tc: '肱二頭肌彎舉',
      es: 'Curl de bíceps',
      fr: 'Curl biceps',
      de: 'Bizeps-Curl',
      jp: 'バイセップカール',
      kr: '이두근 컬',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/mpEFR1-v12s',
      'https://youtube.com/shorts/Im1l3OrPRp4',
    ],
  },
  {
    name: 'Pull-Up',
    translations: {
      en: 'Pull-Up',
      cn: '引体向上',
      tc: '引體向上',
      es: 'Dominada',
      fr: 'Traction',
      de: 'Klimmzug',
      jp: 'プルアップ',
      kr: '풀업',
    },
    youtubeLinks: [
      'https://www.youtube.com/shorts/bdRkHBBfDMs',
    ],
  },
  {
    name: 'Pull Up',
    translations: {
      en: 'Pull Up',
      cn: '引体向上',
      tc: '引體向上',
      es: 'Dominada',
      fr: 'Traction',
      de: 'Klimmzug',
      jp: 'プルアップ',
      kr: '풀업',
    },
    youtubeLinks: [
      'https://www.youtube.com/shorts/bdRkHBBfDMs',
    ],
  },
  {
    name: 'Mountain Climber',
    translations: {
      en: 'Mountain Climber',
      cn: '登山者',
      tc: '登山者',
      es: 'Escalador de montaña',
      fr: 'Grimpeur de montagne',
      de: 'Bergsteiger',
      jp: 'マウンテンクライマー',
      kr: '마운틴 클라이머',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/SADXvZWs7Ac',
    ],
  },
  {
    name: 'Tricep Dip',
    translations: {
      en: 'Tricep Dip',
      cn: '三头肌下压',
      tc: '三頭肌下壓',
      es: 'Fondo de triceps',
      fr: 'Dips triceps',
      de: 'Trizeps-Dip',
      jp: 'トライセップディップ',
      kr: '트라이셉 딥',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/1bZE5aJfvVc',
    ],
  },
  {
    name: 'Shoulder Press',
    translations: {
      en: 'Shoulder Press',
      cn: '肩推',
      tc: '肩推',
      es: 'Press de hombros',
      fr: 'Développé épaules',
      de: 'Schulterdrücken',
      jp: 'ショルダープレス',
      kr: '숄더 프레스',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/gNhSyjiNy0c',
      'https://youtube.com/shorts/vYG-77uMSaY',
    ]
  },
  {
    name: 'Dumbbell Shoulder Press',
    translations: {
      en: 'Dumbbell Shoulder Press',
      cn: '哑铃肩推',
      tc: '啞鈴肩推',
      es: 'Press de hombros con mancuernas',
      fr: 'Développé épaules avec haltères',
      de: 'Kurzhantel-Schulterdrücken',
      jp: 'ダンベルショルダープレス',
      kr: '덤벨 숄더 프레스',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/vYG-77uMSaY',
    ]
  },
  {
    name: 'Overhead Press',
    translations: {
      en: 'Overhead Press',
      cn: '头顶推举',
      tc: '頭頂推舉',
      es: 'Press por encima de la cabeza',
      fr: 'Développé militaire',
      de: 'Überkopfdrücken',
      jp: 'オーバーヘッドプレス',
      kr: '오버헤드 프레스',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/gNhSyjiNy0c',
    ]
  },
  {
    name: 'Face Pulls',
    translations: {
      en: 'Face Pulls',
      cn: '面拉',
      tc: '面拉',
      es: 'Jalones hacia la cara',
      fr: 'Tirage au visage',
      de: 'Gesichtsziehen',
      jp: 'フェイスプル',
      kr: '페이스 풀',
    },
    youtubeLinks: [
      'https://youtube.com/shorts/F3lsQMekW-4',
    ]
  },
];

const steps = [
  { title: 'Tell Us About Yourself', content: 'Select your gender', options: ['Male', 'Female'] },
  { title: 'How Old Are You?', content: 'Age is important', inputType: 'string' },
  { title: 'What is Your Weight?', content: 'Enter your weight', inputType: 'string' },
  { title: 'What is Your Height?', content: 'Enter your height', inputType: 'string' },
  { title: 'What is Your Goal?', content: 'Select your goal', options: ['Weight Loss', 'Muscle Gain', 'Improved Endurance', 'General Fitness'] },
  { title: 'Physical Activity Level?', content: 'Select your activity level', options: ['Sedentary', 'Moderate', 'Active'] },
  { title: 'Do you have any existing health issues or injuries?', content: 'Enter any existing health issues or injuries', inputType: 'string' },
  { 
    title: 'How many days a week can you commit to working out?', 
    content: 'Select the days you can work out:', 
    inputType: 'checkbox', 
    options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 
  },
];

// link color
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


const TrainerGPTPage = () => {
  // router
  const router = useRouter();
  // guest mode
  const {guestData, setGuestData, guestImage, guestEquipment, guestMessages, setGuestMessages, setGuestPlan} = useContext(GuestContext)
  const {localData, setLocalData, localImage, localEquipment, localMessages, setLocalMessages, setLocalPlan} = useContext(GuestContext)
  // Implementing multi-languages
  const { t, i18n } = useTranslation();
  const { user, isSignedIn, isLoaded } = useUser(); // Clerk user
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
  // upon user change, get prefLanguage and also data
  useEffect(() => {
    const fetchAndSetLanguage = async () => {
      const preferredLanguage = await getPreferredLanguage();
      if (preferredLanguage) {
        setPrefLanguage(preferredLanguage);
        i18n.changeLanguage(preferredLanguage);
      }
    };

    const initializeData = async () => {
      // fix loading speed. store all acquired data from firebase into guest storage. 
      if(localData.Age && localMessages.length > 0){
        setData(localData)
        setFormData(localData)
        setMessages(localMessages)
        setIsSummary(true)
        setLoading(false)
      }
      if(!user){
        setLocalData({})
        setLocalMessages([])
      }
      if(isLoaded){
        if (user) {
          const data = await getUserData();
          if (data) {
            setData(data)
            setFormData(data); // Set form data from Firestore if available
            setLocalData(data)
            await loadChatLog(user.id, i18n.language);
            await updateEquipment();
            // setIsSummary(true)
            
          }
          // Transfer guest data to the user account
          await transferGuestDataToUser();
        } else {
          if (guestData && guestData.Age) {
            setData(guestData)
            setFormData(guestData);
            setIsSummary(true);
          } else {
            setIsSummary(false);
            setFormData(guestData);
          }
          if(guestMessages.length > 0){
            setMessages(guestMessages)
          }
          else{
            clearChatLog()
          }
        }
        setLoading(false);
      }
    };

    fetchAndSetLanguage();
    initializeData();
  }, [user]);

  // Implementing theming
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);
  const theme = darkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    setFormData({ ...formData, [key]: value});
  }

  // Save user form data to Firestore
  const saveUserData = async (data) => {
    if (user) {
      const userDocRef = doc(firestore, 'users', user.id);
      await setDoc(userDocRef, { userData: data }, { merge: true });
    }
    else{
      setGuestData(data)
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
      "Sex": data[("Tell Us About Yourself")] || t("Not available"),
      "Age": data[('How Old Are You?')] || t("Not available"),
      "Weight": data[('What is Your Weight?')] || t("Not available"),
      "Height": data[('What is Your Height?')] || t("Not available"),
      "Goals": data[('What is Your Goal?')] || t("Not available"),
      "Activity": data[('Physical Activity Level?')] || t("Not available"),
      "Health issues": data[('Do you have any existing health issues or injuries?')] || t("Not available"),
      "Availability": data[('How many days a week can you commit to working out?')]
        ? (() => {
              const abbreviatedDays = data[('How many days a week can you commit to working out?')]
                .map(day => t(day.substring(0, 3)))
                .join(',');
              return abbreviatedDays.length === 27 ? "Everyday" : abbreviatedDays;
            })()
          : t("Not available"),

    };
    return ret;
  }

  // Sending messages
  const [messages, setMessages] = useState([{ role: 'assistant', content: t('welcome', { name: t('guest') }) }]);
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
        let responseContent = ``;
        // RAGS FOR INFO
        const resolvedData = user ? await data : await guestData;
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

        // RAGS FOR LINKS
        // Extract the exercise name
        const exerciseNames = extractExerciseName(message); // Implement this as needed
        console.log(exerciseNames)
        for(const element of exerciseNames){
          let links = getYouTubeLinksForExercise(element)
          responseContent += `Here are some YouTube links for ${element}: \n\n`;
          links.forEach(link => {
            responseContent += `${link}\n`;
          });
        }
    
        // Combine with AI-generated response (if applicable)
        const combinedInput = `User: ${message}\nYouTube Links: ${responseContent}`;
        console.log(combinedInput)
    
        // Generate response from the AI model
        const response = await fetch('/api/chat', {
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
        setExercisePlan(assistantResponse)
        // Once the assistant response is complete, save the chat log
        setMessages((prevMessages) => {
          const updatedMessages = prevMessages.map((msg, index) =>
            index === prevMessages.length - 1 ? { ...msg, content: assistantResponse } : msg
          );
    
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
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
        ]);
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

  // Handle enter key
  const handleKeyPressStep = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (currentStep === steps.length - 1) {
        handleSubmit();
      } else {
        nextStep();
      }
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
        setLocalMessages(data.messages)
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
  const extractExerciseName = (message, language) => {
    let ret = [];
    const lowerCaseMessage = message.toLowerCase();
  
    // Iterate through the exerciseData array to find matching exercise names
    for (const element of exerciseData) {
      const exercise = element;
      for (const [language, translation] of Object.entries(exercise.translations)) {
        if (lowerCaseMessage.includes(translation.toLowerCase())){
          ret.push(exercise.name)
        }
      }
    }
    return ret;
  };  

  // STORE PLAN
  // Store preferred language on Firebase
  const setExercisePlan = async (response) => {
    if(response.includes(t("plan"))){
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

  // Save guest data when sign-in button is clicked
  const handleSignInClick = async () => {
    await saveGuestDataToFirebase();
    router.push('/sign-in'); // Redirect to the sign-in page
  };
  const saveGuestDataToFirebase = async () => {
    const guestDocRef = doc(firestore, 'users', 'guest');
    // Save guest user data and profile picture
    await setDoc(guestDocRef, { userData: guestData }, { merge: true });
    await setDoc(guestDocRef, { profilePic: guestImage }, { merge: true });
  
    try {
      // Save guest equipment data
      const equipmentCollectionRef = collection(guestDocRef, 'equipment');
      for (const item of guestEquipment) {
        const equipmentDocRef = doc(equipmentCollectionRef, item.name);
        await setDoc(equipmentDocRef, {
          count: item.count || 0,
          image: item.image || null,
        });
      }
  
      // Save guest chat data
      const chatCollectionRef = collection(guestDocRef, 'chat');
      const chatDocRef = doc(chatCollectionRef, 'en'); // Assuming 'en' is the language
      await setDoc(chatDocRef, {
        messages: guestMessages || [],
        timestamp: new Date().toISOString(),
      });
  
      
  
      console.log('Guest data saved to Firebase.');
    } catch (error) {
      console.error("Error saving guest data to Firebase:", error);
    }
  };
  const transferGuestDataToUser = async () => {
    const guestDocRef = doc(firestore, 'users', 'guest');
    const userDocRef = doc(firestore, 'users', user.id);
  
    try {
      // Transfer equipment data
      const guestEquipmentCollectionRef = collection(guestDocRef, 'equipment');
      const userEquipmentCollectionRef = collection(userDocRef, 'equipment');
  
      const guestEquipmentSnapshot = await getDocs(guestEquipmentCollectionRef);
      guestEquipmentSnapshot.forEach(async (item) => {
        const userEquipmentDocRef = doc(userEquipmentCollectionRef, item.id);
        const userEquipmentDoc = await getDoc(userEquipmentDocRef);
  
        if (!userEquipmentDoc.exists()) {
          // Only set guest equipment data if the user does not have it
          await setDoc(userEquipmentDocRef, item.data());
        }
        await deleteDoc(item.ref);
      });
  
      // Check if the user has any existing chat data
      const guestChatCollectionRef = collection(guestDocRef, 'chat');
      const userChatCollectionRef = collection(userDocRef, 'chat');
      
      const guestChatSnapshot = await getDocs(guestChatCollectionRef);
      guestChatSnapshot.forEach(async (item) => {
        const userChatDocRef = doc(userChatCollectionRef, item.id);
        const userChatDoc = await getDoc(userChatDocRef)

        if(!userChatDoc.exists()){
          await setDoc(userChatDocRef, item.data());
        }
        await deleteDoc(item.ref);
      })
  
      // Transfer user data and profile picture
      const guestDoc = await getDoc(guestDocRef);
      if (guestDoc.exists()) {
        const guestData = guestDoc.data();
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
  
          // Merge guest data only if user data does not exist
          const mergedUserData = {
            userData: userData?.userData || guestData.userData,
            profilePic: userData?.profilePic || guestData.profilePic,
          };
  
          await setDoc(userDocRef, mergedUserData, { merge: true });
        } else {
          // If no user document exists, set the guest data directly
          await setDoc(userDocRef, {
            userData: guestData.userData,
            profilePic: guestData.profilePic,
          }, { merge: true });
        }
      }
  
      // Refresh the data in the app
      const data = await getUserData();
      if (data) {
        setFormData(data); // Set form data from Firestore if available
        setIsSummary(true);
      }
  
      // Delete guest data
      await deleteDoc(guestDocRef);
  
      console.log('Guest data transferred to user and guest data deleted.');
    } catch (error) {
      console.error("Error transferring guest data to user:", error);
    }
  };
  // info modal
  const [openInfoModal, setOpenInfoModal] = useState(false);
  // open Info modal
  const handleInfoModal = () => {
    setOpenInfoModal(true);
  }

  // loading page
  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            bgcolor: 'background.default',
            color: 'text.primary'
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>{t('Loading...')}</Typography>
        </Box>
      </Container>
    );
  }


  return (
    // light/dark theming
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* main box */}
      <Box
        width="100vw"
        height="90vh"
        display="flex"
        flexDirection="column"
        paddingBottom= '60px' // Ensure content is not cut off by the toolbar
      >
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
                  {t("1. After filling out your information in the MyInfo page and entering your available equipment in the equipment page, trainerGPT is all ready to help you reach your fitness goals!")}
                </Typography>
                <Typography sx = {{mt: 2}}>
                 {t("2. You can further elaborate on more specific goals with trainerGPT. Try to treat it how you would treat any other personal trainer.")}
                </Typography>
                <Typography sx = {{mt: 2}}>
                 {t("3. When you are ready, ask trainerGPT to craft you a custom workout plan. You can tell trainerGPT to further modify the program to your liking. (If it gets cut off due to internet issues, just tell it to continue).")}
                </Typography>
                <Typography sx = {{mt: 2}}>
                 {t("4. If you have questions about specific exercises, you can also ask trainerGPT how to do specific exercises.")}
                </Typography>
                <Typography sx = {{mt: 2}}>
                 {t("5. Sign in using the top right button to create an account or sign in.")}
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
          <FormControl 
            id="language-button" 
            sx={{ 
              width: isMobile ? '85px' : '85px',
              minWidth: '120px', // Ensures it doesn't get too small
            }}
          >
            <Select
              value={prefLanguage}
              onChange={handleLanguageChange}
              disableunderline={true}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return <span>{t('English')}</span>;
                }
                const selectedItem = {
                  en: 'English',
                  cn: '中文（简体）',
                  tc: '中文（繁體）',
                  es: 'Español',
                  fr: 'Français',
                  de: 'Deutsch',
                  jp: '日本語',
                  kr: '한국어'
                }[selected];
                return <span>{selectedItem}</span>;
              }}
              sx={{
                '& .MuiSelect-select': {
                  paddingTop: '10px',
                  paddingBottom: '10px',
                },
                '& .MuiSelect-icon': {
                  color: 'text.primary', // Adjust color as needed
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


          {/* title */}
          <Box display="flex" flexDirection={"row"} alignItems={"center"} gap = {1}>
            <Typography variant="h6" color="text.primary" textAlign="center">
              {t('trainerGPT')}
            </Typography>
            <Button 
                id= {"info-icon"}
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
          <Box id = {"auth-button"}>
              {!isSignedIn ? (
                <Button 
                  color="inherit"
                  // href="/sign-in"
                  onClick={handleSignInClick}
                  sx={{
                    justifyContent: "end",
                    right: "2%",
                    backgroundColor: 'background.default',
                    color: 'text.primary',
                    borderColor: 'text.primary',
                    justifyContent: 'center',
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

        <Divider />

        {/* body */}
        {isSummary ? (
          <Stack
          direction="column"
          width="100vw"
          minHeight={isMobile ? "80vh" : "90vh"}
          paddingBottom= '60px' // Ensure content is not cut off by the toolbar
        >
          {/* messages */}
          <Stack direction="column" spacing={2} flexGrow={1} overflow='auto' padding={2} className="chat-log" >
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
                  padding={2.5}
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
          ) : (
            
            // show slides
            <Container maxWidth="sm">
              <Box
                sx={{
                  minHeight: '80vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  bgcolor: 'background.default',
                  color: 'text.primary',
                  paddingBottom: '60px', // Ensure content is not cut off by the toolbar
                }}
              >
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                animate={currentStep === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5 }}
                style={{ display: currentStep === index ? 'block' : 'none', width: '100%' }}
              >
                {/* title */}
                <Typography variant="h4" gutterBottom>{t(step.title)}</Typography>
                {/* content */}
                <Typography variant="body1" color="textSecondary" gutterBottom>{t(step.content)}</Typography>
            
                {/* Handle different input types */}
                {step.options && step.inputType === 'checkbox' ? (
                  <FormGroup sx={{ mb: 4 }}>
                    {step.options.map((option) => (
                      <FormControlLabel
                        key={option}
                        control={
                          <Checkbox
                            checked={formData[step.title]?.includes(option) || false}
                            onChange={(e) => {
                              const updatedSelection = e.target.checked
                                ? [...(formData[step.title] || []), option]
                                : formData[step.title].filter((day) => day !== option);
                              
                              // Sort the selected days in order
                              const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                              const sortedSelection = updatedSelection.sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));
                              
                              // Update the formData with the sorted selection
                              handleInputChange(step.title, sortedSelection);
                            }}
                          />
                        }
                        label={t(option)}
                      />
                    ))}
                  </FormGroup>
                ) : step.options ? (
                  <ToggleButtonGroup
                    exclusive
                    value={formData[step.title] || ''}
                    onChange={(e, value) => handleInputChange(step.title, value)}
                    onKeyDown={handleKeyPressStep}
                    sx={{ mb: 4 }}
                  >
                    {step.options.map((option) => (
                      <ToggleButton key={option} value={option}>
                        {t(option)}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                ) : (
                  step.inputType && (
                    <TextField
                      type={step.inputType}
                      fullWidth
                      variant="outlined"
                      onChange={(e) => handleInputChange(step.title, e.target.value)}
                      onKeyDown={handleKeyPressStep}
                      sx={{ mb: 4 }}
                    />
                  )
                )}
            
                {/* front/back buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    {t('Back')}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                  >
                    {currentStep === steps.length - 1 ? t('Finish') : t('Next')}
                  </Button>
                </Box>
              </motion.div>
            ))}          
          </Box>
          </Container>
          )}
      </Box>
    </ThemeProvider>
  );
}

export default TrainerGPTPage;
