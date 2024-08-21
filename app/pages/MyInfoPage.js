"use client"
// base imports
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Container, Box, Typography, Button, TextField, ToggleButtonGroup, ToggleButton, CircularProgress, useMediaQuery, ThemeProvider, CssBaseline, Divider, Modal, Stack, Grid, FormControl, InputLabel, NativeSelect } from '@mui/material';
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

// steps
const steps = [
  { title: 'Tell Us About Yourself', content: 'Select your gender', options: ['Male', 'Female'] },
  { title: 'How Old Are You?', content: 'Age is important', inputType: 'string' },
  { title: 'What is Your Weight?', content: 'Enter your weight', inputType: 'string' },
  { title: 'What is Your Height?', content: 'Enter your height', inputType: 'string' },
  { title: 'What is Your Goal?', content: 'Select your goal', options: ['Weight Loss', 'Muscle Gain', 'Improved Endurance', 'General Fitness'] },
  { title: 'Physical Activity Level?', content: 'Select your activity level', options: ['Sedentary', 'Moderate', 'Active'] },
  { title: 'Do you have any existing health issues or injuries?', content: 'Enter any existing health issues or injuries', inputType: 'string' },
  { title: 'How many days a week can you commit to working out?', content: 'When can you workout?', inputType: 'string' },
];

const MyInfoPage = () => {
  // router
  const router = useRouter();
  // navigate through slides/steps
  const [currentStep, setCurrentStep] = useState(0);
  // store filledo ut data
  const [formData, setFormData] = useState({});
  // if slides are finished, display summary page
  const [isSummary, setIsSummary] = useState(false);
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
    console.log(formData)
    console.log(unpackData(formData))
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
      if (user) {
        const data = await getUserData();
        const img = await getImage();
        if (data) {
          setFormData(data); // Set form data from Firestore if available
          setImage(img);
          setIsSummary(true);
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
      if (isLoaded) {
        setLoading(false);
      }
    };

    fetchAndSetLanguage();
    initializeData();
  }, [user]);

  // clean up formData 
  function unpackData(data) {
    const ret = {
      "Sex": data[t("Tell Us About Yourself")] || "Not available",
      "Age": data[t('How Old Are You?')] || "Not available",
      "Weight": data[t('What is Your Weight?')] || "Not available",
      "Height": data[t('What is Your Height?')] || "Not available",
      "Goals": data[t('What is Your Goal?')] || "Not available",
      "Activity": data[t('Physical Activity Level?')] || "Not available",
      "Health issues": data[t('Do you have any existing health issues or injuries?')] || "Not available",
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

  // Handle enter key
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (currentStep === steps.length - 1) {
        handleSubmit();
      } else {
        nextStep();
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
          width="100vw"
          height={isMobile ? "100vh" : "90vh"}
        >
          <Box width="100%" height="100%" bgcolor="background.default">
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
              {/* if displaying steps, show language-changer. if displaying summary, show edit mode */}
              {isSummary ? (
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
              ) : (
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
              )}
              {/* Title */}
              <Box display="flex" flexDirection={"row"} alignItems={"center"}>
                <Typography variant="h6" color="text.primary" textAlign="center">
                  {t('My Info')}
                </Typography>
              </Box>
              {/* SignIn/SignOut Form */}
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
                }}
              >
                {/* show summary */}
                {isSummary ? (
                  <Box
                    width="100%"
                    height="100vh"
                  >
                    {/* camera modal */}
                    <Modal open={cameraOpen} onClose={() => setCameraOpen(false)}>
                      <Box width="100vw" height="100vh" backgroundColor="black">
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
                          width={250}
                          height={250}
                          style={{ borderRadius: "30px", objectFit: 'cover', transform: facingMode === 'user' ? "scaleX(-1)" : "none" }}
                        />
                      ) : (
                        <Image
                          src="/profile.jpg"
                          alt={t("banner")}
                          width={isMobile ? 200 : 300}
                          height={isMobile ? 200 : 300}
                          style={{ borderRadius: "30px" }}
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
                      <Grid container spacing={isMobile ? 2: 14} style={{ display: 'flex', justifyContent: 'center', width: isMobile ? "75vw" : "75vw",overflow: 'scroll'}}>
                        {orderedKeys.map((key) => (
                          <Grid item xs={6} sm={3} key={key}>
                            {isEditing ? (
                              <Box key={key} sx={{ }}>
                                <Typography variant="h6" display="flex">{t(key)}</Typography>
                                <TextField
                                  variant="outlined"
                                  fullWidth
                                  value={formData[key] || ''}
                                  onChange={(e) => handleInputChange(key, e.target.value)}
                                  sx={{ }}
                                />
                              </Box>
                            ) : (
                              <Box key={key} sx={{ }}>
                                <Typography variant="h6" display="flex">{t(key)}</Typography>
                                <Typography variant="body1" color="textSecondary" display="flex">{formData[key] || 'N/A'}</Typography>
                              </Box>
                            )}
                          </Grid>
                        ))}
                      </Grid>

                    </Box>
                  </Box>
                ) : (
                  // show slides
                  steps.map((step, index) => (
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

                      {/* display options if options, display inputfield if inputfield */}
                      {step.options && (
                        <ToggleButtonGroup
                          exclusive
                          value={formData[step.title] || ''}
                          onChange={(e, value) => handleInputChange(step.title, value)}
                          onKeyDown={handleKeyPress}
                          sx={{ mb: 4 }}
                        >
                          {step.options.map((option) => (
                            <ToggleButton key={option} value={option}>
                              {t(option)}
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>
                      )}

                      {step.inputType && (
                        <TextField
                          type={step.inputType}
                          fullWidth
                          variant="outlined"
                          onChange={(e) => handleInputChange(step.title, e.target.value)}
                          onKeyDown={handleKeyPress}
                          sx={{ mb: 4 }}
                        />
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
                  ))
                )}
              </Box>
            </Container>
          </Box>
        </Box>
    </ThemeProvider>
  );
}

export default MyInfoPage;
