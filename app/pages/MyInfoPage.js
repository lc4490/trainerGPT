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
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";

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
  { title: 'How many days a week can you commit to working out?', content: 'When can you workout?', inputType: 'string' },
];

const MyInfoPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSummary, setIsSummary] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' is the front camera, 'environment' is the back camera

  const { t } = useTranslation();
  const { user, isSignedIn } = useUser(); // Clerk hook to get the current user
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = prefersDarkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const webcamRef = useRef(null);

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  }

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
    return null;
  };

  const sendImage = async (imageSrc) => {
    if (user && imageSrc) {
      const userDocRef = doc(firestore, 'users', user.id);
      await setDoc(userDocRef, { profilePic: imageSrc }, { merge: true });
    }
  };

  const getImage = async () => {
    if (user) {
      const userDocRef = doc(firestore, 'users', user.id);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().profilePic : null;
    }
    return null;
  };

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
          setFormData(data);  // Set form data from Firestore if available
          setImage(img);
          setIsSummary(true);
        }
      }
      else{
        setIsSummary(false)
        setFormData({})
        setImage(null)
      }
      setLoading(false);
    };

    fetchAndSetLanguage();
    initializeData();
  }, [user]);

  function unpackData(data) {
    const ret = {
      "Sex": data[t("Tell Us About Yourself")],
      "Age": data[t('How Old Are You?')],
      "Weight": data[t('What is Your Weight?')],
      "Height": data[t('What is Your Height?')],
      "Goals": data[t('What is Your Goal?')],
      "Activity": data[t('Physical Activity Level?')],
      "Health issues": data[t('Do you have any existing health issues or injuries?')],
      "Availability": data[t('How many days a week can you commit to working out?')],
    };
    return ret;
  }

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
          <Divider />
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
              {isSummary ? (
                <Box
                  width="100%"
                  height="100vh"
                >
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
                    justifyContent={"center"}
                    alignItems="center"
                  >
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
                        width={300}
                        height={300}
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

                    <Grid container spacing={2} paddingX={1} style={{ justifyContent: 'center', width: "300px", height: '50%', overflow: 'scroll' }}>
                      {orderedKeys.map((key) => (
                        <Grid item xs={6} sm={6} key={key}>
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
