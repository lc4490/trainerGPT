"use client"
import { Box, Stack, Typography, Button, TextField, CssBaseline, ThemeProvider, useMediaQuery, FormControl, InputLabel, NativeSelect, Link, Divider, Modal } from '@mui/material'
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
  const {guestData, guestImage, guestEquipment, guestMessages, setGuestMessages, setGuestPlan} = useContext(GuestContext)
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
      const exerciseNames = extractExerciseName(message, prefLanguage);
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
  const extractExerciseName = (message, language) => {
    let ret = [];
    const lowerCaseMessage = message.toLowerCase();
  
    // Iterate through the exerciseData array to find matching exercise names
    for (let i = 0; i < exerciseData.length; i++) {
      const exercise = exerciseData[i];
      
      // Check if the translations object exists and contains the language key
      if (exercise.translations && exercise.translations[language]) {
        const exerciseName = exercise.translations[language].toLowerCase();
  
        if (lowerCaseMessage.includes(exerciseName)) {
          ret.push(exercise.name); // Return the original English name
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
  // info modal
  const [openInfoModal, setOpenInfoModal] = useState(false);
  // open Info modal
  const handleInfoModal = () => {
    setOpenInfoModal(true);
  }


  return (
    // light/dark theming
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* main box */}
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
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
          <FormControl sx={{ width: isMobile ? '90px': '120px' }}>
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
          <Box display="flex" flexDirection={"row"} alignItems={"center"} gap = {2}>
            <Typography variant="h6" color="text.primary" textAlign="center">
              {t('trainerGPT')}
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
        </Box>

        <Divider />

        {/* body */}
        <Stack
          direction="column"
          width="100vw"
          minHeight="90vh"
          paddingBottom= '60px' // Ensure content is not cut off by the toolbar
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
      </Box>
    </ThemeProvider>
  );
}

export default TrainerGPTPage;
