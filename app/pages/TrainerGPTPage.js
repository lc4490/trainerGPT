"use client"
import { Box, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { useEffect, useState, useCallback } from 'react'
// translations
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Adjust the path as necessary
// Clerk imports
import { useUser } from "@clerk/nextjs";
// Firebase imports
import { firestore } from '../firebase'
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
// import guestContext
import { useContext } from 'react';
import { GuestContext } from '../page'; // Adjust the path based on your structure
// router
import { useRouter, useSearchParams } from 'next/navigation';

// front end
import Header from './TrainerGPT/Header';
import Loading from '../Loading';
import InfoModal from './TrainerGPT/InfoModal';
import ChatLog from './TrainerGPT/ChatLog';

// backend data
import { lightTheme, darkTheme } from '../theme';
import { exerciseData } from './TrainerGPT/exerciseData'; 
import { customComponents } from '../customMarkdownComponents'; 


const TrainerGPTPage = () => {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser(); 
  // guest mode
  const {guestData, setGuestData, guestImage, guestEquipment, setGuestEquipment, guestMessages, setGuestMessages, guestPlan, setGuestPlan, guestEvents} = useContext(GuestContext)
  const {localData, setLocalData, localImage, localEquipment, localMessages, setLocalMessages, setLocalPlan} = useContext(GuestContext)
  // Implementing multi-languages
  const { t, i18n } = useTranslation();
  const [prefLanguage, setPrefLanguage] = useState('');
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    if (user) {
      const displayName = user.fullName || 'User';
      const personalizedWelcome = t('welcome', { name: displayName });
      setMessages([{ role: 'assistant', content: personalizedWelcome }]);
      setLocalMessages([{ role: 'assistant', content: t('welcome', { name: t('guest') }) }]);
    } else {
      setMessages([{ role: 'assistant', content: t('welcome', { name: t('guest') }) }]);
      setGuestMessages([{ role: 'assistant', content: t('welcome', { name: t('guest') }) }]);
      setLocalMessages([{ role: 'assistant', content: t('welcome', { name: t('guest') }) }]);
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
        setLoading(false)
      }
      if(!user){
        setLocalData({})
        setLocalMessages([{ role: 'assistant', content: t('welcome', { name: t('guest') }) }]);
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
            
          }
          // Transfer guest data to the user account
        } else {
          if (guestData && guestData.Age) {
            setData(guestData)
            setFormData(guestData);
          } else {
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
  // store filledo ut data
  const [formData, setFormData] = useState({});
  // is loading, display loading page
  const [loading, setLoading] = useState(true); // Loading state


  // Sending messages
  const [messages, setMessages] = useState([{ role: 'assistant', content: t('welcome', { name: t('guest') }) }]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
      if (!message.trim() || isLoading) return;
      setIsLoading(true);
      // if message includes equipment
      console.log(message)
      let equipments = [];
      if (message.includes(":")) {
          let parts = message.split(":");
          if (parts[0].toLowerCase().includes("equipment")) {
              // Split by comma first, then split each part by "and"
              equipments = parts[1].split(",").flatMap(part => part.split("and"));
              
              // Trim whitespace from each equipment item
              equipments = equipments.map(equipment => equipment.trim());
          }
      }
    
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
        for(const element of exerciseNames){
          let links = getYouTubeLinksForExercise(element)
          responseContent += `Here are some YouTube links for ${element}: \n\n`;
          links.forEach(link => {
            responseContent += `${link}\n`;
          });
        }
        console.log(responseContent)
    
        // Combine with AI-generated response (if applicable)
        const combinedInput = `User: ${message}\n${responseContent}`;
    
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
          equipments.forEach(async (equipment) => {
            const sanitizedItemName = equipment.replace(/\//g, ' and ');
            const quantity = 1; // Assuming a default quantity of 1 for each equipment item
          
            if (user) {
              const userId = user.id;
              const docRef = doc(firestore, 'users', userId, 'equipment', sanitizedItemName);
              const docSnap = await getDoc(docRef);
          
              if (docSnap.exists()) {
                const { count, image: existingImage } = docSnap.data();
                await setDoc(docRef, { count: count + quantity, image: existingImage });
              } else {
                await setDoc(docRef, { count: quantity, image: '' }); // Assuming no image by default
              }
            } else {
              setGuestEquipment((prevGuestEquipment) => {
                // Check if the equipment is already in the guestEquipment array
                const equipmentExists = prevGuestEquipment.some(
                  (item) => item.name.toLowerCase() === sanitizedItemName.toLowerCase()
                );
              
                if (!equipmentExists) {
                  const updatedEquipment = [
                    ...prevGuestEquipment,
                    { name: sanitizedItemName, count: quantity, image: '' } // Assuming no image by default
                  ];
                  setEquipmentList(updatedEquipment); // Update the equipment list based on the latest state
                  return updatedEquipment;
                }
              
                // If the equipment already exists, return the previous state without modification
                return prevGuestEquipment;
              });
            }
          });          

          if (user) {
            saveChatLog(user.id, i18n.language, updatedMessages);
          } else {
            setGuestMessages(updatedMessages);
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
        setGuestMessages([{ role: 'assistant', content: t('welcome', { name: t('guest') }) }]);
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
      if (user) {
        const userId = user.id;
        const userDocRef = doc(firestore, 'users', userId);
        await setDoc(userDocRef, { plan: response }, { merge: true });
      }
      else{
        console.log("guest")
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
    await setDoc(guestDocRef, {plan: guestPlan}, {merge: true})
  
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

      // Save events data
      const eventCollectionRef = collection(guestDocRef, 'events');
      for (const event of guestEvents) {
        const eventDocRef = doc(eventCollectionRef, event?.id?.toString());
        await setDoc(eventDocRef, event)
      }
  
      
  
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
  // text to speech
  const [isListening, setIsListening] = useState(false); // Track whether speech recognition is in progress
  const [isSpeaking, setIsSpeaking] = useState(false); // Track whether speech synthesis is in progress
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = prefLanguage;

      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setMessage(finalTranscript + interimTranscript); // Update the message input field with both final and interim results
      };
      

      recognitionInstance.onend = () => {
        setIsListening(false);
        setMessage('')
      };
      

      setRecognition(recognitionInstance);
    } else {
      alert(t('Your browser does not support speech recognition.'));
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      const audio = new Audio('/start-sound.mp3'); // Use a small audio file for the cue
      audio.play();
      recognition.lang = microphoneLocale
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
      // Stop the speech
      window.speechSynthesis.cancel(); // Stop speech synthesis completely
      setIsSpeaking(false);
    } else if (!isListening) {
      // Start listening for speech input
      startListening();
    } else {
      // Stop listening
      stopListening();
      sendMessage();
    }
  };

  // Function to handle custom locale mapping
  const getMicrophoneLocale = (language) => {
    if (language === 'cn') {
      return 'zh-cn';  // Map 'cn' or 'tc' to 'zh' for Chinese
    }
    if(language === 'tc'){
      return 'zh-tw'
    }
    if(language ==='jp'){
      return 'ja'
    }
    if(language ==='kr'){
      return 'ko'
    }
    return language; // Default to the selected language
  };

  const microphoneLocale = getMicrophoneLocale(i18n.language); // Get the correct locale for FullCalendar

  // loading page
  if (loading) {
    return <Loading t={t} />;
  }

  return (
    // light/dark theming
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* main box */}
      <Box
        width="100%"
        height = "100%"
        display="flex"
        flexDirection="column"
        // paddingBottom= '60px' // Ensure content is not cut off by the toolbar
      >
        {/* info modal */}
        <InfoModal t={t} openInfoModal={openInfoModal} setOpenInfoModal={setOpenInfoModal} />

        {/* header box */}
        <Header
          t={t}
          prefLanguage={prefLanguage}
          handleLanguageChange={handleLanguageChange}
          isSignedIn={isSignedIn}
          handleSignInClick={handleSignInClick}
          handleInfoModal={handleInfoModal}
          isMobile={isMobile}
        />

        {/* body */}
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
          t={t}
          isMobile={isMobile}
        />
      </Box>
    </ThemeProvider>
  );
}

export default TrainerGPTPage;
