import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion';
import { Container, Box, Typography, Button, TextField, ToggleButtonGroup, ToggleButton, CircularProgress, useMediaQuery, ThemeProvider, CssBaseline, Divider, Modal, Stack, Grid, FormControl, InputLabel, NativeSelect} from '@mui/material';
// Firebase imports
import { firestore, auth, provider, signInWithPopup, signOut } from '../firebase';
import { collection, getDocs, query, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
// Translations
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Adjust the path as necessary
// light/dark mode
import { createTheme } from '@mui/material';
// images
import Image from 'next/image';
import Webcam from 'react-webcam';

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

const steps = [
  { title: 'Tell Us About Yourself', content: 'Select your gender', options: ['Male', 'Female'] },
  { title: 'How Old Are You?', content: 'Age is important', inputType: 'string' },
  { title: 'What is Your Weight?', content: 'Enter your weight', inputType: 'string' },
  { title: 'What is Your Height?', content: 'Enter your height', inputType: 'string' },
  { title: 'What is Your Goal?', content: 'Select your goal', options: ['Weight Loss', 'Muscle Gain', 'Improved Endurance', 'General Fitness'] },
  { title: 'Physical Activity Level?', content: 'Select your activity level', options: ['Sedentary', 'Moderate', 'Active'] },
  { title: 'Do you have any existing health issues or injuries?', content: 'Enter any existing health issues or injuries',inputType: 'string'},
  // { title: 'Do you have any workout preferences', content: 'Enter any workout preferences',inputType: 'string'},
  { title: 'How many days a week can you commit to working out?', content: 'When can you workout?',inputType: 'string'},
];

const MyInfoPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSummary, setIsSummary] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  const { t } = useTranslation();

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  }

  // Save user form data to Firestore
  const saveUserData = async (data) => {
    if (auth.currentUser) {
      const userUID = auth.currentUser.uid;
      const userDocRef = doc(firestore, 'users', userUID);
      await setDoc(userDocRef, { userData: data }, { merge: true });
    }
  };

  // Handle form submission and save data to Firestore
  const handleSubmit = async () => {
    if (isEditing) {
      // Save the updated form data to Firestore
      await saveUserData(unpackData(formData));
      setIsEditing(false);
    } else {
      await saveUserData(unpackData(formData)); // Save form data to Firestore
      setFormData(unpackData(formData));
      handleSignIn();
      setIsSummary(true); // Show summary page
    }
  };  

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

  // Google Auth
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User signed in:', user);
      setGuestMode(false); // Disable guest mode on successful sign-in
    } catch (error) {
      console.error('Error signing in:', error);
      alert(t('Sign in failed: ') + error.message);
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
      alert(t('Sign out failed: ') + error.message);
    }
  };

  // Set User
  const [user, setUser] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [name, setName] = useState(null);

  // Check at all times who the user is
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setName(user.displayName);
        setGuestMode(false);
        const data = await getUserData();
        const img = await getImage();
        if (data) {
          setFormData(data);  // Set form data from Firestore if available
          setImage(img);
          setIsSummary(true);
        }
      } else {
        setUser(null);
        setName(t("Guest"));
        setGuestMode(true);
      }
      setLoading(false); // Stop loading when user check is done
    });
    return () => unsubscribe();
  }, []);

  // Implementing multi-languages
  const { i18n } = useTranslation();
  // set preferred language locally
  const [prefLanguage, setPrefLanguage] = useState('');
  // change languages
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    
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

  // fetch/set languages at all times
  useEffect(() => {
    const fetchAndSetLanguage = async () => {
      const preferredLanguage = await getPreferredLanguage();
      if (preferredLanguage) {
        setPrefLanguage(preferredLanguage)
        i18n.changeLanguage(preferredLanguage);
      }
      console.log(preferredLanguage)
    };

    fetchAndSetLanguage();
  }, []);

  function unpackData(data) {
    const ret = {
        "Sex":data[t("Tell Us About Yourself")],
        "Age":data[t('How Old Are You?')],
        "Weight":data[t('What is Your Weight?')],
        "Height":data[t('What is Your Height?')],
        "Goals":data[t('What is Your Goal?')],
        "Activity level": data[t('Physical Activity Level?')],
        "Health issues": data[t('Do you have any existing health issues or injuries?')],
        // "Preferences": data['Do you have any workout preferences'],
        "Availability": data[t('How many days a week can you commit to working out?')]

    }
    return ret
  }
  const orderedKeys = [
    'Sex',
    'Age',
    'Weight',
    'Height',
    'Goals',
    'Activity level',
    'Health issues',
    'Availability',
  ];

    //   handle enter key
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

  // Implementing theming
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);
  const theme = darkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // add and camera modals
  // camera/image
  const [cameraOpen, setCameraOpen] = useState(false);
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' is the front camera, 'environment' is the back camera
  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    sendImage(imageSrc)
    setCameraOpen(false);
  };
  const switchCamera = () => {
    setFacingMode((prevFacingMode) => (prevFacingMode === 'user' ? 'environment' : 'user'));
  };
  // open add modal and open camera at the same time
  const handleOpenCamera = () => {
    setCameraOpen(true);
  };
  const sendImage = async (image) =>{
    if (auth.currentUser && image){
      const userUID = auth.currentUser.uid;
      const userDocRef = doc(firestore, 'users', userUID)
      await setDoc(userDocRef, {profilePic: image}, {merge: true})
    }
  }
  const getImage = async () => {
    if (auth.currentUser) {
      const userUID = auth.currentUser.uid;
      const userDocRef = doc(firestore, 'users', userUID);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().profilePic : null;
    }
    return null;
  }
  // edit mode
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    saveUserData(formData)
    setIsEditing(!isEditing)
  }
  
  // Display a loading spinner while the app is initializing
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
      width = "100vw"
      height= {isMobile ? "100vh" : "90vh"}
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
          {isSummary ? (
            <Button
              onClick={handleEdit}
              sx={{
                  height: "55px",
                  fontSize: '1rem',
                  backgroundColor: 'background.default',
                  color: 'text.primary',
                  borderColor: 'background.default',
                  // borderRadius: '50px',
                  '&:hover': {
                    backgroundColor: 'text.primary',
                    color: 'background.default',
                    borderColor: 'text.primary',
                  },
                }}
              >
              {isEditing ? t("Save") : t("Edit")}
            </Button>
          ) :
          (
            <FormControl
            sx={{width: '85px'}}>
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
          
          {/* title */}
          <Box display="flex" flexDirection={"row"} alignItems={"center"}>
              <Typography variant="h6" color="text.primary" textAlign="center">
              {t('My Info')}
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
        <Divider></Divider>
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
          // backgroundColor: "red",
          }}
          >
              {isSummary ? (
              <Box
              height = "100vh"
              >
                  <Box
                  width="100vw"
                  height= {isMobile ? "100vh" : "90vh"}
                  >
                    <Modal open={cameraOpen} onClose={() => setCameraOpen(false)}>
                      <Box width="100vw" height="100vh" backgroundColor="black">
                        <Stack display="flex" justifyContent="center" alignItems="center" flexDirection="column" sx={{ transform: 'translate(0%,25%)' }}>
                          <Box
                            sx={{
                              // position: 'absolute',
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
                                // width: '50%', // This makes the width of the container 50% of its parent
                                maxWidth: 350, // Optional: Limit the maximum width
                                aspectRatio: '1/1', // Ensures the box is a square
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative', // Allows the button to be positioned over the video feed
                                backgroundColor: 'black', // Background color for the box
                                borderRadius: '16px', // Optional: adds rounded corners
                                overflow: 'hidden', // Ensures the video doesn't overflow the container
                              }}
                            >
                              <Webcam
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{
                                  facingMode: facingMode,
                                  // aspectRatio: 4/3,
                                }}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover', // Ensures the video covers the square without distortion
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

                      {/* other info */}
                      {/* rest */}
                      
                      <Box
                      width = "100%"
                      height="90%"
                      display="flex"
                      flexDirection="column"
                      justifyContent={"center"}
                      alignItems="center"
                      >
                      {image ? (
                        <Image
                        src={image}
                        alt={t("image")}
                        width={250}
                        height={250}
                        style={{ borderRadius: "30px", objectFit: 'cover',transform: "scaleX(-1)"}}
                      />
                      ) : (
                        <Image 
                        src= "/profile.jpg"
                        alt={t("banner")}
                        // layout="responsive"
                        width={300}
                        height={300}
                        style={{ borderRadius: "30px"}}
                      />
                      )}
                      {/* add photo button */}
                      <Button
                      variant="outlined" 
                      onClick={handleOpenCamera}
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
                        {image ? (t("Change photo")) : (t("Add photo"))}
                      </Button>
                      
                      {/* <Box> */}
                      <Grid container spacing={2} paddingX={1} style={{ justifyContent: 'center', width: "300px",height: '50%', overflow: 'scroll' }}>
                          {/* <Typography variant="h4" gutterBottom>{t("Summary")}</Typography> */}
                          {orderedKeys.map((key) => (
                          <Grid item xs={6} sm={6} key={key}>
                            {isEditing ? (
                                <Box key={key} sx={{ }}>
                                <Typography variant="h6" display = "flex" >{t(key)}</Typography>
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
                                <Typography variant="h6" display = "flex" >{t(key)}</Typography>
                                <Typography variant="body1" color="textSecondary" display="flex">{formData[key] || 'N/A'}</Typography>
                              </Box>
                            )}
                          </Grid>
                          ))}
                      </Grid>
                      </Box>
                      
                  </Box>
              </Box>
              ) : (
              steps.map((step, index) => (
            
              <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 50 }}
              animate={currentStep === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
              style={{ display: currentStep === index ? 'block' : 'none', width: '100%' }}
              >
              <Typography variant="h4" gutterBottom>{t(step.title)}</Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>{t(step.content)}</Typography>

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

              <Box 
              sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
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
    </ThemeProvider>
  );
}

export default MyInfoPage;
