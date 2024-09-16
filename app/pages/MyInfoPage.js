"use client"
// base imports
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Select, MenuItem, Container, Box, Typography, Button, TextField, ToggleButtonGroup, ToggleButton, CircularProgress, useMediaQuery, ThemeProvider, CssBaseline, Divider, Modal, Stack, Grid, FormControl, InputLabel, NativeSelect, FormGroup, FormControlLabel, Checkbox, Slider } from '@mui/material';
// Firebase imports
import { firestore } from '../firebase'
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
// Translations
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Adjust the path as necessary
// light/dark mode
import { createTheme } from '@mui/material';
// images
import Image from 'next/image';
import Webcam from 'react-webcam';
// clerk signin
import { SignedIn, SignedOut, UserButton, useUser, isLoaded } from "@clerk/nextjs";

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
      link: 'darkblue',
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

const steps = [
  { title: 'Tell Us About Yourself', content: 'Select your gender', options: ['Male', 'Female'] },
  { title: 'How Old Are You?', content: 'Age is important', inputType: 'string' },
  { title: 'What is Your Weight?', content: 'Enter your weight', inputType: 'string' },
  { title: 'What is Your Height?', content: 'Enter your height', inputType: 'string' },
  { title: 'What is Your Goal?', content: 'Select your goal', options: ['Weight Loss', 'Muscle Gain', 'Improved Endurance', 'General Fitness'] },
  { title: 'Physical Activity Level?', content: 'Select your activity level', options: ['Sedentary', 'Moderate', 'Active'] },
  { title: 'Do you have any existing health issues or injuries?', content: 'Enter any existing health issues or injuries', inputType: 'string' },
  { title: 'How many days a week can you commit to working out?', content: 'Select the number of workout days', inputType: 'dial', range: { min: 1, max: 7 } },
];


const MyInfoPage = () => {
  // router
  const router = useRouter();
  // navigate through slides/steps
  const [currentStep, setCurrentStep] = useState(0);
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
  const { guestData, setGuestData, guestImage, setGuestImage, guestEquipment, guestMessages} = useContext(GuestContext);
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
          // Transfer guest data to the user account
          await transferGuestDataToUser();
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
      const userChatCollectionRef = collection(userDocRef, 'chat');
      const userChatSnapshot = await getDocs(userChatCollectionRef);

      if (userChatSnapshot.empty) {
        // If the user has no chat data, transfer the guest chat data
        const guestChatCollectionRef = collection(guestDocRef, 'chat');
        const guestChatSnapshot = await getDocs(guestChatCollectionRef);

        guestChatSnapshot.forEach(async (item) => {
          const userChatDocRef = doc(userChatCollectionRef, item.id);
          await setDoc(userChatDocRef, item.data());

        });
      }
  
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
      const img = await getImage();
      if (data) {
        setFormData(data); // Set form data from Firestore if available
        setImage(img);
        setIsSummary(true);
      }
  
      // Delete guest data
      await deleteDoc(guestDocRef);
  
      console.log('Guest data transferred to user and guest data deleted.');
    } catch (error) {
      console.error("Error transferring guest data to user:", error);
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
          backgroundColor="background.default"
          paddingBottom= '60px' // Ensure content is not cut off by the toolbar
        >
          {/* camera modal */}
          <Modal open={cameraOpen} onClose={() => setCameraOpen(false)}>
            <Box width="100%" height="100vh" backgroundColor="black">
              <Stack display="flex" justifyContent="center" alignItems="center" flexDirection="column" sx={{ transform: 'translate(0%,25%)' }}>
                <Box
                  sx={{
                    top: '50%',
                    bgcolor: 'black',
                    width: 350,
                    height: 350,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingY: 2,
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: 350,
                      aspectRatio: '1/1',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      backgroundColor: 'black',
                      borderRadius: '16px',
                      overflow: 'hidden',
                    }}
                  >
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        facingMode: facingMode,
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)',
                      }}
                    />
                  </Box>
                </Box>
                <Stack flexDirection="row" gap={2} position="relative">
                  <Button
                    variant="outlined"
                    onClick={captureImage}
                    sx={{
                      color: 'black',
                      borderColor: 'white',
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: 'white',
                        color: 'black',
                        borderColor: 'white',
                      },
                      marginTop: 1,
                    }}
                  >
                    {t("Take Photo")}
                  </Button>
                  <Button
                    onClick={switchCamera}
                    sx={{
                      color: 'black',
                      borderColor: 'white',
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: 'white',
                        color: 'black',
                        borderColor: 'white',
                      },
                      marginTop: 1,
                    }}
                  >
                    {t("Switch Camera")}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setCameraOpen(false);
                    }}
                    sx={{
                      color: 'black',
                      borderColor: 'white',
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: 'white',
                        color: 'black',
                        borderColor: 'white',
                      },
                      marginTop: 1,
                    }}
                  >
                    {t('Exit')}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Modal>
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
                  {t("1. Use the top left button to select your language.")}
                </Typography>
                <Typography sx = {{mt: 2}}>
                 {t("2. Answer the questions about your gender, age, weight, height, goals, activity level, health issues, and workout days.")}
                </Typography>
                <Typography sx = {{mt: 2}}>
                 {t("3. After completing the steps, review your infornmation. The top left button will change to an EDIT button. You can still change your system language in the trainerGPT page.")}
                </Typography>
                <Typography sx = {{mt: 2}}>
                 {t("4. After filling out your information, add an optional profile photo with the Add Photo button.")}
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
          {/* Header Box */}
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
              <Button
                onClick={handleEditOrSave}
                sx={{
                  height: "55px",
                  fontSize: '1rem',
                  backgroundColor: 'background.default',
                  color: 'text.primary',
                  borderColor: 'background.default',
                  '&:hover': {
                    backgroundColor: 'text.primary',
                    color: 'background.default',
                    borderColor: 'text.primary',
                  },
                }}
              >
                {isEditing ? t("Save") : t("Edit")}
              </Button>
              
              {/* Title */}
              <Box display="flex" flexDirection={"row"} alignItems={"center"} gap ={1}>
                <Typography variant="h6" color="text.primary" textAlign="center">
                  {t('My Info')}
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
              {/* SignIn/SignOut Form */}
              <Box >
                {!isSignedIn ? (
                  <Button
                    color="inherit"
                    // href="/sign-in"
                    onClick={handleSignInClick}
                    sx={{
                      justifyContent: "end",
                      right: "2%",
                      backgroundColor: 'background.default',
                      justifyContent: 'center',
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
            {isMobile && (<Divider />)}
            {/* body */}
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
                {/* show summary */}
                  <Box
                    width="100%"
                    height="100vh"
                  >

                    <Box
                      width="100%"
                      height="90%"
                      display="flex"
                      flexDirection="column"
                      // justifyContent={"center"}
                      p= {2.5}
                      gap = {2.5}
                      alignItems="center"
                    >
                      {/* show image or placeholder */}
                      {image ? (
                        <Image
                          src={image}
                          alt={t("image")}
                          width={isMobile ? 300 : 300}
                          height={isMobile ? 300 : 300}
                          style={{
                            borderRadius: "30px",
                            objectFit: 'cover',
                            transform: facingMode === 'user' ? "scaleX(-1)" : "none",
                            aspectRatio: "1/1",
                            // width: '100%', /* Ensure aspect ratio */
                            // height: '100%'  /* Ensure aspect ratio */
                          }}
                        />
                      ) : (
                        <Image
                          src="/profile.jpg"
                          alt={t("banner")}
                          width={isMobile ? 200 : 300}
                          height={isMobile ? 200 : 300}
                          style={{
                            borderRadius: "30px",
                            width: 'auto',  /* Ensure aspect ratio */
                            height: 'auto'  /* Ensure aspect ratio */
                          }}
                        />
                      )}
                      {/* Add photo button */}
                      <Button
                        variant="outlined"
                        onClick={() => setCameraOpen(true)}
                        sx={{
                          width: "150px",
                          height: "40px",
                          fontSize: '0.75rem',
                          backgroundColor: 'text.primary',
                          color: 'background.default',
                          borderColor: 'background.default',
                          borderRadius: '10px',
                          '&:hover': {
                            backgroundColor: 'background.default',
                            color: 'text.primary',
                            borderColor: 'text.primary',
                          },
                        }}
                      >
                        {image ? t("Change photo") : t("Add photo")}
                      </Button>

                      {/* display content summary */}
                      <Grid 
                        container 
                        // spacing={4} // Increase spacing between grid items for better separation
                        sx={{ 
                          justifyContent: 'center', // Center items horizontally
                          width: "90vw", 
                          // overflow: 'auto', // Allow scrolling if content overflows
                          padding: 3, // Add padding around the grid container
                          paddingBottom: "60px", // Add space for the toolbar
                        }}
                      >
                        {orderedKeys.map((key) => (
                          <Grid 
                            item 
                            xs={12} 
                            sm={6} 
                            md={3} 
                            key={key}
                            sx={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', // Center content within each grid item
                              padding: 2, // Add padding inside each grid item for better spacing
                              border: '1px solid', // Add a border to each item for a card-like appearance
                              borderColor: 'divider', // Use theme divider color for border
                              borderRadius: 2, // Round the corners for a smoother look
                              backgroundColor: 'background.paper', // Use the paper background color
                              boxShadow: 3, // Add a subtle shadow for depth
                            }}
                          >
                            <Typography 
                              variant="h6" 
                              align="center" 
                              sx={{ 
                                marginBottom: 1, 
                                color: 'text.primary', // Ensure the text color matches the theme
                              }}
                            >
                              {t(key)}
                            </Typography>
                            {isEditing ? (
                              <Box sx={{ width: '100%' }}>
                                {renderEditField(key, formData[key])}
                              </Box>
                            ) : (
                              <Typography 
                                variant="body1" 
                                color="textSecondary" 
                                align="center" 
                                sx={{ 
                                  fontSize: '1rem', 
                                  fontWeight: 500, 
                                  color: 'text.secondary', // Subtle color for secondary text
                                }}
                              >
                                {key === 'Availability' ? `${formData[key]} ${t("days")}` : formData[key]}
                              </Typography>
                            )}
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Box>
              </Box>
            </Container>
          </Box>
        {/* </Box> */}
    </ThemeProvider>
  );
}

export default MyInfoPage;
