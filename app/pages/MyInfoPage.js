"use client"
// base imports
import { useEffect, useState, useRef } from 'react';
import { Select, MenuItem, Container, Box, Typography, Button, TextField, ToggleButtonGroup, ToggleButton, CircularProgress, useMediaQuery, ThemeProvider, CssBaseline, Divider, Modal, Stack, Grid, FormControl, InputLabel, NativeSelect, FormGroup, FormControlLabel, Checkbox, Slider } from '@mui/material';
// Firebase imports
import { firestore } from '../firebase'
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
// Translations
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Adjust the path as necessary
// images
// clerk signin
import { useUser,  } from "@clerk/nextjs";

// import guestContext
import { useContext } from 'react';
import { GuestContext } from '../page'; // Adjust the path based on your structure
// router
import { useRouter, useSearchParams } from 'next/navigation';

import InfoModal from './MyInfo/InfoModal';
import CameraModal from './MyInfo/CameraModal';
import WorkoutModal from './MyInfo/WorkoutModal';
import Header from './MyInfo/Header';
import EditPage from './MyInfo/EditPage';
import HomePage from './MyInfo/HomePage';

import { customComponents } from '../customMarkdownComponents';
import { lightTheme, darkTheme } from '../theme';

const MyInfoPage = () => {
  // router
  const router = useRouter();
  // store filledo ut data
  const [formData, setFormData] = useState({});
  // if slides are finished, display summary page
  const [isSummary, setIsSummary] = useState(true);
  // is loading, display loading page
  const [loading, setLoading] = useState(true); // Loading state
  // edit mode
  const [isEditing, setIsEditing] = useState(false);
  // camera
  const [image, setImage] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' is the front camera, 'environment' is the back camera
  const webcamRef = useRef(null);
  // translation
  const { t } = useTranslation();
  // clerk user
  const { user, isSignedIn, isLoaded } = useUser(); // Clerk hook to get the current user
  // light/dark mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = prefersDarkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // guest context
  const { guestData, setGuestData, guestImage, setGuestImage, guestEquipment, guestMessages, guestPlan, guestEvents} = useContext(GuestContext);
  const { localData, setLocalData, localImage, setLocalImage, localEquipment, localMessages} = useContext(GuestContext);
  // info modal
  const [openInfoModal, setOpenInfoModal] = useState(false);

  // set filled out data
  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value});
  }

  // handle edit mode
  const handleEditOrSave = () => {
    if(isEditing){
      handleSubmit()
    }
    setIsEditing(!isEditing)
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
    if (isEditing) {
      await saveUserData((formData));
      setIsEditing(false);
    } else {
      await saveUserData(unpackData(formData));
      setFormData(unpackData(formData));
      setIsSummary(true); // Show summary page
    }
  };

  // Retrieve user data from Firestore
  const getUserData = async () => {
    if (user) {
      const userDocRef = doc(firestore, 'users', user.id);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().userData : null;
    }
    else{
      return guestData
    }
    // return null;
  };

  // send image to firestore or guest storage
  const sendImage = async (imageSrc) => {
    if(imageSrc){
      if (user) {
        const userDocRef = doc(firestore, 'users', user.id);
        await setDoc(userDocRef, { profilePic: imageSrc }, { merge: true });
      }
      else{
        setGuestImage(imageSrc)
      }
    }
    
  };

  // get image from firestore or guest storage
  const getImage = async () => {
    if (user) {
      const userDocRef = doc(firestore, 'users', user.id);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().profilePic : null;
    }
    else{
      return guestImage
    }
  };

  // camera fucntions
  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    sendImage(imageSrc);
    setCameraOpen(false);
  };
  const switchCamera = () => {
    setFacingMode((prevFacingMode) => (prevFacingMode === 'user' ? 'environment' : 'user'));
  };

  // Multi-language implementation
  const [prefLanguage, setPrefLanguage] = useState('');
  
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
      const userDocRef = doc(firestore, 'users', user.id);
      await setDoc(userDocRef, { preferredLanguage: language }, { merge: true });
    }
  };

  const getPreferredLanguage = async () => {
    if (user) {
      const userDocRef = doc(firestore, 'users', user.id);
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
      if(localData.Age){
        setFormData(localData)
        setIsSummary(true)
        setLoading(false)
        setImage(localImage)
      }
      if(!user){
        setLocalData({})
        setLocalImage("")
      }
      if(isLoaded){
        if (user) {
          const data = await getUserData();
          const img = await getImage();
          if (data) {
            setFormData(data); // Set form data from Firestore if available
            setLocalData(data)
            setImage(img);
            setLocalImage(img)
            // setIsSummary(true);
          }
        } else {
          if (guestData && guestData.Age) {
            setFormData(guestData);
            setIsSummary(true);
            setImage(guestImage);
          } else {
            setIsSummary(false);
            setFormData(guestData);
            setImage(null);
          }
        }
      }
      setLoading(false);
    
    };

    fetchAndSetLanguage();
    initializeData();
  }, [user]);

  // clean up formData 
  function unpackData(data) {
    const ret = {
      "Sex": data[("Tell Us About Yourself")] || t("Not available"),
      "Age": data[('How Old Are You?')] || t("Not available"),
      "Weight": data[('What is Your Weight?')] + weightUnit || t("Not available"),
      "Height": data[('What is Your Height?')] + heightUnit || t("Not available"),
      "Goals": data[('What is Your Goal?')] || t("Not available"),
      "Activity": data[('Physical Activity Level?')] || t("Not available"),
      "Health issues": data[('Do you have any existing health issues or injuries?')] || t("Not available"),
      "Availability": data[t('How many days a week can you commit to working out?')] || "Not available",
    };
    return ret;
  }
  // order formData
  const orderedKeys = [
    'Sex',
    'Age',
    'Weight',
    'Height',
    'Goals',
    'Activity',
    'Health issues',
    'Availability',
  ];

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

  // customize edit fields
  const renderEditField = (key, value) => {
    switch (key) {
      case 'Sex':
        return (
          <ToggleButtonGroup
            exclusive
            value={value || ''}
            onChange={(e, newValue) => handleInputChange(key, newValue)}
            sx={{ 
              mb: 2,
              display: 'flex', 
              justifyContent: 'center', 
            }}
          >
            <ToggleButton value="Male">{t('Male')}</ToggleButton>
            <ToggleButton value="Female">{t('Female')}</ToggleButton>
          </ToggleButtonGroup>
        );
  
      case 'Age':
        return (
          <TextField
            type="text"
            value={parseInt(value) || ''}
            onChange={(e) => handleInputChange(key, parseInt(e.target.value))}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
        );
  
      case 'Goals':
        return (
          <ToggleButtonGroup
            exclusive
            value={value || ''}
            onChange={(e, newValue) => handleInputChange(key, newValue)}
            sx={{ 
              mb: 2, 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', // Two columns
            }}
          >
            {['Weight Loss', 'Muscle Gain', 'Improved Endurance', 'General Fitness'].map(option => (
              <ToggleButton key={option} value={option}>
                {t(option)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        );
  
      case 'Activity':
        return (
          <ToggleButtonGroup
            exclusive
            value={value || ''}
            onChange={(e, newValue) => handleInputChange(key, newValue)}
            sx={{ 
              mb: 2,
              display: 'flex', 
              justifyContent: 'center', 
              width: '100%',
            }}
          >
            {['Sedentary', 'Moderate', 'Active'].map(option => (
              <ToggleButton key={option} value={option}>
                {t(option)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        );
       
      case 'Weight':
        // Extract numeric value and unit from the string
        const weightMatch = value.match(/(\d+\.?\d*)(kg|lbs)/);
        let weightValue = weightMatch ? parseFloat(weightMatch[1]) : '';
        let weightUnit = weightMatch ? weightMatch[2] : 'kg';

        const handleUnitChange = (e, newUnit) => {
          if (newUnit && newUnit !== weightUnit) {
            if (newUnit === 'lbs') {
              weightValue = (weightValue * 2.20462).toFixed(1); // Convert kg to lbs
            } else {
              weightValue = (weightValue / 2.20462).toFixed(1); // Convert lbs to kg
            }
            weightUnit = newUnit;
            handleInputChange(key, `${weightValue}${weightUnit}`);
            // handleWeightUnitChange(e, newUnit); // Update weight unit globally if necessary
          }
        };

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                endAdornment: <Typography variant="body1">{weightUnit}</Typography>,
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
    
      case 'Height':
        // Extract numeric value and unit from the string
        const heightMatch = value.match(/(\d+\.?\d*)\s*(cm|ft\/in)|(\d+)'(\d+)"/);

        let heightValue = '';
        let heightUnit = 'cm';

        if (heightMatch) {
            if (heightMatch[2] === 'cm') {
                // If the match is for cm
                heightValue = parseFloat(heightMatch[1]);
                heightUnit = 'cm';
            } else if (heightMatch[3] && heightMatch[4]) {
                // If the match is for ft/in
                const feet = parseInt(heightMatch[3], 10);
                const inches = parseInt(heightMatch[4], 10);
                heightValue = `${feet}'${inches}"`;
                heightUnit = 'ft/in';
            }
        }
    
        const handleUnitChangeH = (e, newUnit) => {
            if (newUnit && newUnit !== heightUnit) {
                if (newUnit === 'ft/in') {
                    // Convert cm to feet and inches
                    const totalInches = (heightValue / 2.54).toFixed(1); // cm to inches
                    const feet = Math.floor(totalInches / 12);
                    const inches = Math.round(totalInches % 12);
                    heightValue = `${feet}'${inches}"`;
                } else {
                    // Convert feet and inches to cm
                    const heightParts = heightValue.match(/(\d+)'(\d+)"/);
                    if (heightParts) {
                        const feet = parseInt(heightParts[1], 10);
                        const inches = parseInt(heightParts[2], 10);
                        heightValue = ((feet * 12 + inches) * 2.54).toFixed(1); // Convert to cm
                    }
                }
                heightUnit = newUnit;
                handleInputChange(key, `${heightValue}${heightUnit}`);
            }
        };
    
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                    // type="text" // Use text to allow entry of feet and inches
                    fullWidth
                    variant="outlined"
                    value={heightValue}
                    onChange={(e) => {
                      if (heightUnit === 'ft/in') {
                        // Pass the value as-is for ft/in format, without converting to float
                        const newHeightValue = e.target.value;
                        handleInputChange(key, `${newHeightValue}${heightUnit}`);
                      } else {
                        // Convert the value to a float for all other cases
                        const newHeightValue = parseFloat(e.target.value);
                        handleInputChange(key, `${newHeightValue}${heightUnit}`);
                      }
                    }}
                    sx={{ mb: 4 }}
                    placeholder={heightUnit === 'ft/in' ? "e.g., 5'8\"" : "Enter height in cm"}
                    InputProps={{
                        endAdornment: <Typography variant="body1">{heightUnit}</Typography>,
                    }}
                />
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
      
      case 'Availability':
        // Adding the slider (dial) for workout days
        return (
          <Box sx={{ mb: 4 }}>
            <Typography gutterBottom>{t('Availability')}</Typography>
            <Slider
              defaultValue={value || 3}  // Default value if no value is set
              step={1}
              marks
              min={1}
              max={7}
              valueLabelDisplay="auto"
              value={value || 1} // Default to 1 day if no value exists
              onChange={(e, newValue) => handleInputChange(key, newValue)}
            />
          </Box>
        );
        default:
        return (
          <TextField
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
        );
    }
  };

  // open Info modal
  const handleInfoModal = () => {
    setOpenInfoModal(true);
  }

  // State to manage weight and unit
  const [weightUnit, setWeightUnit] = useState('kg'); // Default to kg

  // state to manage height and unit
  const [heightUnit, setHeightUnit] = useState('cm'); // Default to cm

  // the kacey effect
  // getting plan
  const [plan, setPlan] = useState(null);
  // Function to get the plan
  const getPlan = async () => {
    try {
      if (user) {
        const userDocRef = doc(firestore, 'users', user.id);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          return userDoc.data().plan;
        }
      } else {
        // Handle guest plan retrieval if needed
        return guestPlan;
      }
    } catch (error) {
      console.error("Error getting plan:", error);
      return null;
    }
  };

  // UseEffect to call getPlan and set the state
  useEffect(() => {
    const fetchPlan = async () => {
      const fetchedPlan = await getPlan();
      setPlan(fetchedPlan);
      setLoading(false); // Stop loading once the plan is fetched
    };
    fetchPlan();
  }, [user, guestPlan]);

  const [allEvents, setAllEvents] = useState([]);
  const updateEvents = async () => {
    setLoading(true)
    if (user) {
      const userId = user.id;
      const docRef = collection(firestore, 'users', userId, 'events');
      const docs = await getDocs(docRef);
      const events = [];
      docs.forEach((doc) => {
        events.push({ name: doc.id, ...doc.data() });
      });
      setAllEvents(events);
    }
    else{
      setAllEvents(guestEvents)
    }
    setLoading(false)
  };

  useEffect(() => {
      updateEvents();
  }, [user, guestEvents]);

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  // premium mode
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);

  // handle payment, check if user has premium
  useEffect(() => {
    if (isLoaded && user) {
      const fetchPremiumMode = async () => {
        const userDocRef = doc(firestore, 'users', user.id);
        const userDoc = await getDoc(userDocRef);
        setHasPremiumAccess(userDoc.exists() && userDoc.data().premium === true);
      };
      fetchPremiumMode();
    } else {
      setHasPremiumAccess(false);
    }
  }, [isLoaded, user]);  

  const handleCancelSubscription = async () => {
    try {
      const userDocRef = doc(firestore, 'users', user.id);
      const userDoc = await getDoc(userDocRef);
      let subscriptionId = ""
      if(userDoc.exists() && userDoc.data()){
        subscriptionId = userDoc.data().subscriptionId
      }
      console.log(subscriptionId)
        const res = await fetch('/api/cancel_subscription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subscriptionId,  // Pass the subscription ID to the backend
                cancelAtPeriodEnd: true,  // Set to true if you want to cancel at the end of the billing period
            }),
        });

        const data = await res.json();
        if (data.success) {
            alert('Your subscription has been successfully canceled.');
            await setDoc(userDocRef, { premium: false }, { merge: true });
            await setDoc(userDocRef, { subscriptionId: null }, { merge: true });
            window.location.reload();  // Reload the page after payment
        } else {
            console.error('Error cancelling subscription:', data.error);
        }
    } catch (error) {
        console.error('Error cancelling subscription:', error);
    }

};


  // workout modal
  const handleWorkoutModal = (index) => {
    setSelectedWorkout(index);
    setOpenWorkoutModal(true);
  };

  const [openWorkoutModal, setOpenWorkoutModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState({});

  const [isEditingWorkout, setIsEditingWorkout] = useState(false)

  const handleEditOrSaveWorkout = () => {
    if(isEditing){
      // handleSubmit()
    }
    setIsEditingWorkout(!isEditingWorkout)
  }
  const renderEditExercise = (index, value) => {
    return (
      <TextField
      type="text"
      value={value}
      onChange={(e) => handleInputChangeWorkout(index, e.target.value)}
      fullWidth
      variant="outlined"
      multiline
      minRows={3} // Match the height and appearance of the multiline markdown text
      InputProps={{
        sx: {
          fontSize: '1rem', // Match typography used in customComponents
          lineHeight: 1.6,  // Match lineHeight from customComponents
          padding: 0,       // Remove default padding for seamless integration
          fontFamily: 'inherit', // Inherit font for a consistent look
        },
      }}
      sx={{
        mb: 2,
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            border: 'none', // Remove border for cleaner appearance
          },
        },
      }}
    />
  )
  }

  const handleInputChangeWorkout = (index, value) => {
    if(user){
      const updatedEvents = [...allEvents];
      updatedEvents[index].extendedProps.details = value;
      setAllEvents(updatedEvents);
    }
    else{
      const updatedEvents = [...guestEvents];
      updatedEvents[index].extendedProps.details = value;
      setAllEvents(guestEvents);
    }
  }

  useEffect(() => {
    const updateEventsInFirestore = async () => {
      if (user) {
        const userId = user.id;
        const eventsCollectionRef = collection(firestore, 'users', userId, 'events');
  
        try {
          // Fetch all events in Firestore
          const querySnapshot = await getDocs(eventsCollectionRef);
  
          // Delete each event
          const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);
  
  
          // Re-upload all the events in `allEvents`
          allEvents?.forEach(async (event) => {
            const docRef = doc(firestore, 'users', userId, 'events', event?.id?.toString());
  
            // Upload the new event to Firestore
            await setDoc(docRef, event);
          });
  
        } catch (error) {
          console.error("Error updating events in Firestore:", error);
        }
      }
    };
  
    if (allEvents.length >= 0) {
      updateEventsInFirestore();
    }
  }, [allEvents, user]);

  const [editModal, setEditModal] = useState(false)

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
    // light/dark mode
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
          <CameraModal 
          cameraOpen={cameraOpen}
          setCameraOpen={setCameraOpen}
          captureImage={captureImage}
          switchCamera={switchCamera}
          facingMode={facingMode}
          webcamRef={webcamRef}
          t={t}
          />
          <InfoModal 
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
          isMobile={isMobile}
          t={t}
          />
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
          <Header 
          handleEditOrSave={handleEditOrSave}
          isEditing={isEditing}
          setEditModal={setEditModal}
          handleSignInClick={handleSignInClick}
          handleInfoModal={handleInfoModal}
          isSignedIn={isSignedIn}
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
          t={t}
          />

        </Box>
    </ThemeProvider>
  );
}

export default MyInfoPage;
