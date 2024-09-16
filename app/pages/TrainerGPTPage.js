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
import Loading from './TrainerGPT/Loading';
import InfoModal from './TrainerGPT/InfoModal';
import ChatLog from './TrainerGPT/ChatLog';
import StepForm from './TrainerGPT/StepForm';

// backend data
import { lightTheme, darkTheme } from '../theme';
import { exerciseData } from './TrainerGPT/exerciseData'; 
import { steps } from './TrainerGPT/steps'; 
import { customComponents } from '../customMarkdownComponents'; 


const TrainerGPTPage = () => {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser(); 
  // guest mode
  const {guestData, setGuestData, guestImage, guestEquipment, setGuestEquipment, guestMessages, setGuestMessages, setGuestPlan} = useContext(GuestContext)
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
        setIsSummary(true)
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
      "Weight": data[('What is Your Weight?')] + weightUnit|| t("Not available"),
      "Height": data[('What is Your Height?')] + heightUnit|| t("Not available"),
      "Goals": data[('What is Your Goal?')] || t("Not available"),
      "Activity": data[('Physical Activity Level?')] || t("Not available"),
      "Health issues": data[('Do you have any existing health issues or injuries?')] || t("Not available"),
      "Availability": data[t('How many days a week can you commit to working out?')] || "Not available",
    };
    return ret;
  }

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

  // State to manage weight and unit
  const [weightUnit, setWeightUnit] = useState('kg'); // Default to kg

  const handleWeightUnitChange = (event, newUnit) => {
    if (newUnit !== null) {
      setWeightUnit(newUnit);

      // Convert the weight if a value is already entered
      if (formData['What is Your Weight?']) {
        const currentWeight = parseFloat(formData['What is Your Weight?']);
        const convertedWeight = newUnit === 'lbs'
          ? (currentWeight * 2.20462).toFixed(1) // kg to lbs
          : (currentWeight / 2.20462).toFixed(1); // lbs to kg
        setFormData({ ...formData, 'What is Your Weight?': convertedWeight});
      }
    }
  };

  // state to manage height and unit
  const [heightUnit, setHeightUnit] = useState('cm'); // Default to cm
  const handleHeightUnitChange = (event, newUnit) => {
    if (newUnit !== null) {
        setHeightUnit(newUnit);

        // Convert the height if a value is already entered
        if (formData['What is Your Height?']) {
            let convertedHeight = '';
            if (newUnit === 'ft/in') {
                // Convert cm to feet/inches
                const totalInches = parseFloat(formData['What is Your Height?']) / 2.54;
                const feet = Math.floor(totalInches / 12);
                const inches = Math.round(totalInches % 12);
                convertedHeight = `${feet}'${inches}"`;
            } else {
                // Convert feet/inches to cm
                const heightParts = formData['What is Your Height?'].match(/(\d+)'(\d+)"/);
                if (heightParts) {
                    const feet = parseInt(heightParts[1], 10);
                    const inches = parseInt(heightParts[2], 10);
                    convertedHeight = ((feet * 12 + inches) * 2.54).toFixed(1); // Convert to cm
                }
            }
            setFormData({ 
                ...formData, 
                'What is Your Height?': convertedHeight, 
                'heightUnit': newUnit 
            });
        } else {
            setFormData({ 
                ...formData, 
                'heightUnit': newUnit 
            });
        }
    }
  };

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
        paddingBottom= '60px' // Ensure content is not cut off by the toolbar
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
