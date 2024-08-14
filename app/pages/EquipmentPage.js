"use client"

// base imports
import { Box, Stack, Typography, Button, Modal, TextField, Grid, Autocomplete, Divider } from '@mui/material'
import { firestore, auth, provider, signInWithPopup, signOut } from '../firebase'
import { collection, getDocs, query, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react'

// search icon
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

// use image and camera
import Image from 'next/image';
// import { Camera, switchCamera } from 'react-camera-pro';
import Webcam from 'react-webcam';

// use openai
const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
import { OpenAI } from 'openai';

// use googlesignin
import { onAuthStateChanged } from 'firebase/auth';

// translations
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Adjust the path as necessary

// theme imports
import { createTheme, ThemeProvider, useTheme, CssBaseline, useMediaQuery, IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      gray: 'lightgray',
      banner: 'banner.png',
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
      gray: 'darkgray',
      banner: 'banner.png',
    },
    text: {
      primary: '#ffffff',
    },
  },
});

const EquipmentPage = () => {
  // Implementing multi-languages
  const { t, i18n } = useTranslation();
  // change languages
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
        i18n.changeLanguage(preferredLanguage);
      }
    };

    fetchAndSetLanguage();
  }, []);
  // declare
  const [pantry, setPantry] = useState([])
  const [equipmentList, setEquipmentList] = useState([])
  // open modal declareables
  const [openAdd, setOpenAdd] = useState(false);
  const handleOpenAdd = () => {
    clearFields();
    setOpenAdd(true)
  };
  const handleCloseAdd = () => {
    clearFields();
    setOpenAdd(false)
  };
  // search term for pantry and recipes
  const [searchTerm, setSearchTerm] = useState('');

  // item name/quantity
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  
  // toggle searchbar for pantry and recipes
  const [isFocused, setIsFocused] = useState(false); 

  // camera/image
  const [cameraOpen, setCameraOpen] = useState(false);
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' is the front camera, 'environment' is the back camera
  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    predictItem(imageSrc).then(setItemName);  // Assuming predictItem is a function you have defined
    setCameraOpen(false);
  };
  const switchCamera = () => {
    setFacingMode((prevFacingMode) => (prevFacingMode === 'user' ? 'environment' : 'user'));
  };
  
  // ai
  const openai = new OpenAI({
    apiKey: openaiApiKey,
    dangerouslyAllowBrowser: true
  });
  // function to predict item label from picture (ai)
  async function predictItem(image){
    if(image){
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: "text",
                text: "Identify the main object in this picture in as few words as possible",
              },
              {
                type: "image_url",
                image_url: {
                  url: image,
                  detail: "low",
                },
              },
            ],
          },
        ],
      })
      let result = response.choices[0].message.content.trim();
      result = result.replace(/\./g, '');
      result = result.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      return result;
    }
  }

  // helper functions
  // shorten string so that it doesn't overflow
  const truncateString = (str, num) => {
    if (str.length <= num) {
      return str;
    }
    return str.slice(0, num) + '...';
  };
  // clear item fields after clickoff
  const clearFields = () => {
    setItemName('');
    setQuantity(1);
    setImage(null);
  };
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
        equipment.push({ name: doc.id, ...doc.data() });
      });
      setEquipmentList(equipment);
    }
  };

  useEffect(() => {
    updateEquipment()
  }, [])
  // add item function
  const addItem = async (item, quantity, image) => {
    if (guestMode) {
      setEquipmentList(prevPantry => [...prevPantry, { name: item, count: quantity, image }]);
    } else {
      if (!auth.currentUser) {
        alert("You must be signed in to add items.");
        return;
      }
      if (isNaN(quantity) || quantity < 0) {
        setOpenWarningAdd(true);
      } else if (quantity >= 1 && item != '') {
        const userUID = auth.currentUser.uid;
        // const docRef = doc(collection(firestore, `pantry_${userUID}`), item);
        const docRef = doc(firestore, 'users', userUID, 'equipment', item);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const { count, image: existingImage } = docSnap.data();
          await setDoc(docRef, { count: count + quantity, image: image || existingImage });
        } else {
          await setDoc(docRef, { count: quantity, image });
        }
        await updateEquipment();
      }
    }
  }

  // change quantity function
  const handleQuantityChange = async (item, quantity) => {
    if (guestMode) {
      setEquipmentList(prevEquipment => prevEquipment.map(p => p.name === item ? { ...p, count: quantity } : p));
    } else {
      if (!auth.currentUser) {
        alert("You must be signed in to change item quantities.");
        return;
      }
      const userUID = auth.currentUser.uid;
      // const docRef = doc(collection(firestore, `pantry_${userUID}`), item);
      const docRef = doc(firestore, 'users', userUID, 'equipment', item);
      const docSnap = await getDoc(docRef);
      const { count, image } = docSnap.data();
      if (0 === quantity) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: quantity, ...(image && { image }) });
      }
      await updateEquipment();
    }
  };

  // open add modal and open camera at the same time
  const handleOpenAddAndOpenCamera = () => {
    handleOpenAdd();
    setCameraOpen(true);
  };

  // filter pantry and recipes based on search
  const filteredEquipmentList = equipmentList.filter(({ name }) => name.toLowerCase().includes(searchTerm.toLowerCase()));

  // sign in function for google auth
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
  // sign out function for google auth
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
      setUser(null);
      setGuestMode(true); // Enable guest mode on sign-out
      setEquipmentList([]); // Clear guest data
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Sign out failed: ' + error.message);
    }
  };

  // declareables for user and guest mode
  const [user, setUser] = useState(null);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setGuestMode(false);
        updateEquipment();
      } else {
        setUser(null);
        setGuestMode(true);
        setEquipmentList([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // toggle dark mode
  // Detect user's preferred color scheme
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);

  // Update dark mode state when the user's preference changes
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  const theme = darkMode ? darkTheme : lightTheme;

  // ismobile
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        width="100vw" 
        // height="100vh"
        height= {isMobile ? "100vh" : "90vh"}
        display="flex" 
        justifyContent="center" 
        alignItems="center"
        flexDirection="column"
        gap={2}
        bgcolor="red"
        fontFamily="sans-serif"
      >
        {/* add modal */}
        <Modal
          open={openAdd}
          onClose={handleCloseAdd}
        >
          <Box 
            sx={{
              position: 'absolute',
              top: '10%',
              width: '100%',
              height: '90%',
              bgcolor: 'background.default',
              border: '2px solid #000',
              boxShadow: 24,
              p: 2,
              display: "flex",
              alignItems: 'center',
              flexDirection: 'column',
              gap: 3,
              color: "text.primary",
              borderColor: "text.primary",
              borderRadius: "15px",
            }}
          >
            {image && (
              <Box
                display="flex"
                justifyContent="center"
                width="100%"
                sx={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                <Image 
                  src={image}
                  alt={"Captured"}
                  width={300}
                  height={300}
                  style={{ borderRadius: '16px', objectFit: 'cover', transform: "scaleX(-1)" }}
                />
              </Box>
            )}
            {!image && (
              <>
                <Button 
                  variant="outlined"
                  onClick={() => setCameraOpen(true)}
                  sx={{
                    color: 'text.primary',
                    borderColor: 'text.primary',
                    '&:hover': {
                      backgroundColor: 'background.default',
                      color: 'text.primary',
                      borderColor: 'text.primary',
                    },
                  }}
                >
                  {t("Open Camera")}
                </Button>
                {/* upload photo */}
                <Button 
                  variant="outlined"
                  component="label"
                  sx={{
                    color: 'text.primary',
                    borderColor: 'text.primary',
                    '&:hover': {
                      backgroundColor: 'background.default',
                      color: 'text.primary',
                      borderColor: 'text.primary',
                    },
                  }}
                >
                  {t("Upload Photo")}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Validate file type
                        const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
                        if (!validTypes.includes(file.type)) {
                          alert('Unsupported image format. Please upload a PNG, JPEG, GIF, or WEBP file.');
                          return;
                        }

                        // Validate file size
                        const maxSize = 20 * 1024 * 1024; // 20 MB in bytes
                        if (file.size > maxSize) {
                          alert('File is too large. Please upload an image smaller than 20 MB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImage(reader.result);
                          predictItem(reader.result).then(setItemName)
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </Button>

              </>
            )}
            <Divider sx={{ width: '100%', backgroundColor: 'background.default' }} />
            <Box width="100%" height="25%">
              <TextField 
                label="" 
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'text.primary',
                    fontSize: '2.5rem',
                    fontWeight: '550',
                    '& fieldset': {
                      borderColor: 'background.default',
                    },
                    '&:hover fieldset': {
                      borderColor: 'background.default',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'lightgray',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.primary',
                    fontSize: '2.5rem',
                    fontWeight: '550',
                  },
                }}
                InputProps={{
                  style: {
                    textAlign: 'center',
                    fontSize: '1.5rem',
                  }
                }}
                InputLabelProps={{
                  style: { 
                    color: 'text.primary', 
                    width: '100%',
                    fontSize: '1.5rem',
                  },
                }}
              />
            </Box>
            <Stack width="100%" direction="column" spacing={2} justifyContent="space-between">
              <Stack width="100%" direction="row" justifyContent="end" alignItems="center">
                <Button 
                  sx={{
                    backgroundColor: 'lightgray',
                    color: 'black',
                    borderColor: 'lightgray',
                    borderRadius: '50px',
                    height: "50px",
                    minWidth: "50px",
                    '&:hover': {
                      backgroundColor: 'darkgray',
                      color: 'text.primary',
                      borderColor: 'text.primary',
                    },
                  }}
                  onClick={() => setQuantity(prev => Math.max(0, parseInt(prev) - 1))}
                >
                  -
                </Button>
                <TextField 
                  label="" 
                  variant="outlined"
                  value={parseInt(quantity)}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  sx={{
                    width: "50px",
                    '& .MuiOutlinedInput-root': {
                      color: 'text.primary',
                      '& fieldset': {
                        borderColor: 'background.default',
                      },
                      '&:hover fieldset': {
                        borderColor: 'background.default',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'lightgray',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'text.primary',
                    },
                  }}
                  InputLabelProps={{
                    style: { color: 'text.primary', width: '100%' },
                  }}
                />
                <Button 
                  sx={{
                    backgroundColor: 'lightgray',
                    color: 'black',
                    borderColor: 'lightgray',
                    borderRadius: '50px',
                    height: "50px",
                    minWidth: "50px",
                    '&:hover': {
                      backgroundColor: 'darkgray',
                      color: 'text.primary',
                      borderColor: 'text.primary',
                    },
                  }}
                  onClick={() => setQuantity(prev => parseInt(prev) + 1)}
                >
                  +
                </Button>
              </Stack>
              <Button 
                variant="outlined"
                onClick={() => {
                  addItem(itemName, parseInt(quantity), image)
                  setItemName('')
                  setQuantity(1)
                  handleCloseAdd()
                }}
                sx={{
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
                {t("Add")}
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* camera modal */}
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
                      transform: "scaleX(-1)"
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
                  {t("Exit")}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Modal>

        {/* main page */}
        <Box width="100%" height="100%" bgcolor="background.default">
          {/* header including add button, title, sign in */}
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
            {/* add button */}
            <Button 
              variant="outlined" 
              onClick={handleOpenAddAndOpenCamera}
              sx={{
                height: "55px",
                fontSize: '1rem',
                backgroundColor: 'background.default',
                color: 'text.primary',
                borderColor: 'background.default',
                borderRadius: '50px',
                '&:hover': {
                  backgroundColor: 'text.primary',
                  color: 'background.default',
                  borderColor: 'text.primary',
                },
              }}
            >
              <Typography variant="h5">+</Typography>
            </Button>
            {/* title */}
            <Box display = "flex" flexDirection={"row"} alignItems={"center"}>
              {/* <IconButton 
                  sx={{ ml: 1 }} 
                  onClick={() => setDarkMode(!darkMode)} 
                  color="inherit"
                >
                  {darkMode ? <Brightness7 /> : <Brightness4 />}
                </IconButton> */}
              <Typography variant="h6" color="text.primary" textAlign="center">
                {t("myEquipment")}
              </Typography>
            </Box>
            {/* sign in */}
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
          
          {/* banner image */}
          {/* <Image 
            src= {prefersDarkMode ? "/banner_dark.png" : "/banner.png"} 
            alt="banner"
            // layout="responsive"
            width={800}
            height={200}
            style={{ width: '100%', height: 'auto'}}
          /> */}

          {/* equipment */}
          <Stack flexDirection="row">
            {/* title */}
            <Typography padding={2} variant="h4" color="text.primary" fontWeight="bold">{t("Equipment")}</Typography>
            {/* search bar */}
            <Autocomplete
              freeSolo
              disableClearable
              options={equipmentList.map((option) => option.name)}
              onInputChange={(event, newInputValue) => {
                setSearchTerm(newInputValue);
              }}
              ListboxProps={{
                component: 'div',
                sx: {
                  backgroundColor: 'background.default',
                  color: 'text.primary',
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  sx={{
                    position: 'absolute',
                    right: "2%",
                    paddingY: 1,
                    transform: 'translateY(0%)',
                    width: isFocused ? '25%' : `${Math.max(searchTerm.length, 0) + 5}ch`,
                    transition: 'width 0.3s',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'background.default',
                      },
                      '&:hover fieldset': {
                        borderColor: 'text.primary',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'text.primary',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'text.primary',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon style={{ color: 'text.primary' }} />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    style: { color: 'text.primary', width: '100%', textAlign: 'center', right: '1%' },
                  }}
                />
              )}
            />
          </Stack>
          <Divider />
          <Box height={25}></Box>
          {/* equipment stack */}
          <Grid container spacing={2} paddingX={1} style={{ height: '50%', overflow: 'scroll' }}>
            {filteredEquipmentList.map(({ name, count, image }, index) => (
              // equipment item
              <Grid item xs={12} sm={4} key={index}>
                <Box
                  width="100%"
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  backgroundColor="background.default"
                  padding={2.5}
                  border="1px solid lightgray"
                  borderRadius="10px"
                >
                  {/* equipment name and quantity change */}
                  <Stack>
                    <Typography
                      variant="h6"
                      color="text.primary"
                      textAlign="left"
                      style={{
                        flexGrow: 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {truncateString(name.charAt(0).toUpperCase() + name.slice(1), 16)}
                    </Typography>
                    {/* quantity adjuster */}
                    <Stack width="100%" direction="row" justifyContent="start" alignItems="center">
                      <Button
                        sx={{
                          height: "25px",
                          minWidth: "25px",
                          backgroundColor: 'lightgray',
                          color: 'black',
                          borderColor: 'lightgray',
                          borderRadius: '50px',
                          '&:hover': {
                            backgroundColor: 'darkgray',
                            color: 'text.primary',
                            borderColor: 'text.primary',
                          },
                        }}
                        onClick={() => handleQuantityChange(name, Math.max(0, count - 1))}
                      >
                        -
                      </Button>
                      <TextField
                        label=""
                        variant="outlined"
                        value={parseInt(count)}
                        onChange={(e) => handleQuantityChange(name, parseInt(e.target.value) || 0)}
                        sx={{
                          width: "45px",
                          '& .MuiOutlinedInput-root': {
                            color: 'text.primary',
                            '& fieldset': {
                              borderColor: 'background.default',
                            },
                            '&:hover fieldset': {
                              borderColor: 'background.default',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'lightgray',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'text.primary',
                          },
                        }}
                        InputProps={{
                          sx: {
                            textAlign: 'center',
                            fontSize: '0.75rem',
                          },
                          inputProps: {
                            style: { textAlign: 'center' },
                          },
                        }}
                        InputLabelProps={{
                          style: { color: 'text.primary', width: '100%', textAlign: 'center' },
                        }}
                      />
                      <Button
                        sx={{
                          height: "25px",
                          minWidth: "25px",
                          backgroundColor: 'lightgray',
                          color: 'black',
                          borderColor: 'lightgray',
                          borderRadius: '50px',
                          '&:hover': {
                            backgroundColor: 'darkgray',
                            color: 'text.primary',
                            borderColor: 'text.primary',
                          },
                        }}
                        onClick={() => handleQuantityChange(name, count + 1)}
                      >
                        +
                      </Button>
                    </Stack>
                  </Stack>
                  {/* equipment ingredient image */}
                  <Stack width="100%" direction="column" justifyContent="space-between" alignItems="flex-end">
                    {image ? (
                      <Image
                        src={image}
                        alt={name}
                        width={100}
                        height={100}
                        style={{ borderRadius: '10px', objectFit: 'cover', transform: "scaleX(-1)" }}
                      />
                    ) : (
                      <Image
                        src="/ingredients.jpg"
                        alt={name}
                        width={100}
                        height={100}
                        style={{ borderRadius: '10px', objectFit: 'cover', transform: "scaleX(-1)"}}
                      />
                    )}
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Box height={25}></Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default EquipmentPage;

