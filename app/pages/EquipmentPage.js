"use client"

// base imports
import { Box, Stack, Typography, Button, Modal, TextField, Grid, Autocomplete, Divider } from '@mui/material'
import { firestore } from '../firebase'
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react'

// search icon
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

// use image and camera
import Image from 'next/image';
import Webcam from 'react-webcam';

// use Clerk
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";

// translations
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Adjust the path as necessary

// theme imports
import { createTheme, ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';

// openai
import OpenAI from 'openai';

// import guestContext
import { useContext } from 'react';
import { GuestContext } from '../page'; // Adjust the path based on your structure

// light/dark theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      gray: 'lightgray',
      banner: 'banner.png',
      bannerColor: '#3C3C3C'
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
      bannerColor: '#fffff'
    },
    text: {
      primary: '#ffffff',
    },
  },
});

const EquipmentPage = () => {
  // Implementing multi-languages
  const { t, i18n } = useTranslation();
  const { user, isSignedIn } = useUser(); // Clerk user

  // Initialize state variables
  const [equipmentList, setEquipmentList] = useState([])
  const [openAdd, setOpenAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isFocused, setIsFocused] = useState(false); 
  const [cameraOpen, setCameraOpen] = useState(false);
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' is the front camera, 'environment' is the back camera

  const {guestEquipment, setGuestEquipment} = useContext(GuestContext)

  // open modal declareables
  const handleOpenAdd = () => {
    setOpenAdd(true)
  };
  const handleCloseAdd = () => {
    setOpenAdd(false)
  };

  // Camera and image handling
  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    predictItem(imageSrc).then(setItemName);  // Assuming predictItem is a function you have defined
    setCameraOpen(false);
  };

  const switchCamera = () => {
    setFacingMode((prevFacingMode) => (prevFacingMode === 'user' ? 'environment' : 'user'));
  };
  
  // AI (OpenAI) related functions
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  async function predictItem(image){
    if(image){
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: "text",
                text: "Label this piece of gym equipment in as few words as possible",
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

  // Helper functions
  const truncateString = (str, num) => {
    if (str.length <= num) {
      return str;
    }
    return str.slice(0, num) + '...';
  };

  const clearFields = () => {
    setItemName('');
    setQuantity(1);
    setImage(null);
  };

  // ensure that items are not stored in firebase with /, replace "/" with " and "
  const sanitizeItemName = (name) => {
    return name.replace(/\//g, ' and '); // Replace slash with 'and'
  }

  // Update local variabel equipmentList with the firebase equipment or guest equipment
  const updateEquipment = async () => {
    if (user) {
      const userId = user.id;
      const docRef = collection(firestore, 'users', userId, 'equipment');
      const docs = await getDocs(docRef);
      const equipment = [];
      docs.forEach((doc) => {
        equipment.push({ name: doc.id, ...doc.data() });
      });
      setEquipmentList(equipment);
    }
    else{
      setEquipmentList(guestEquipment)
    }
  };

  // update equipment everytime the user changes or guestEquipment changes
  useEffect(() => {
      updateEquipment();
  }, [user, guestEquipment]);

  // add item function. either adds an item to the firebase storage or to the guest storage
  const addItem = async (item, quantity, image) => {
    const sanitizedItemName = sanitizeItemName(item);
    if (isNaN(quantity) || quantity < 0) {
      alert("Quantity must be a positive number.");
      return;
    } 
    if(user){
      if (quantity >= 1 && item) {
        const userId = user.id;
        const docRef = doc(firestore, 'users', userId, 'equipment', sanitizedItemName);
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
    else{
      setGuestEquipment((guestEquipment) => [...guestEquipment, {name: sanitizedItemName, count: 1, image: image}]);
      setEquipmentList(guestEquipment)
    }
  }

  // change quantity or delete item function.
  const handleQuantityChange = async (item, quantity) => {
    if (user) {
        
      const userId = user.id;
      const docRef = doc(firestore, 'users', userId, 'equipment', item);
      if (quantity === 0) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: quantity });
      }
      await updateEquipment();
    }
    else{
      setGuestEquipment(guestEquipment => 
        guestEquipment
            .map(p => p.name === item ? { ...p, count: quantity } : p)
            .filter(p => p.count !== 0) // This line removes the equipment if the count is 0
    );
    setEquipmentList(guestEquipment)
      
    }
  };

  // opens the add modal and the camera at the same time
  const handleOpenAddAndOpenCamera = () => {
    handleOpenAdd();
    // setCameraOpen(true);
  };

  // filter equipment by search term
  const filteredEquipmentList = equipmentList.filter(({ name }) => name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Toggle dark mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);
  const theme = darkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    // light/dark mode
    <ThemeProvider theme={theme}>
      <CssBaseline />
        {/* base box */}
        <Box 
          width="100vw" 
          height= {isMobile ? "100vh" : "90vh"}
          display="flex" 
          justifyContent="center" 
          alignItems="center"
          flexDirection="column"
          gap={2}
          fontFamily="sans-serif"
        >
          {/* Add item modal */}
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
              {/* if image exists, display image. if not, show options to open camera or upload iamge */}
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
                    style={{ borderRadius: '16px', objectFit: 'cover'}}
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
                        borderColor: 'lightgray',
                      },
                      '&:hover fieldset': {
                        borderColor: 'lightgray',
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

          {/* Camera modal */}
          <Modal open={cameraOpen} onClose={() => setCameraOpen(false)}>
            <Box width="100vw" height="100vh" backgroundColor="black">
              <Stack display="flex" justifyContent="center" alignItems="center" flexDirection="column" sx={{ transform: 'translate(0%,25%)' }}>
                {/* camera display */}
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
                    {/* camera, flips if it is user camera, also covers instead of fit */}
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        facingMode: facingMode,
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', // Ensures the video covers the square without distortion
                        transform: facingMode === 'user' ? "scaleX(-1)" : "none"
                      }}
                    />
                  </Box>
                </Box>
                {/* buttons */}
                <Stack flexDirection="row" gap={2} position="relative">
                  {/* take photo */}
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
                  {/* switch camera */}
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
                  {/* exit */}
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

          {/* Main page */}
          <Box width="100%" height="100%" bgcolor="background.default">
            {/* Header including add button, title, sign in */}
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
              {/* Add button */}
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
              {/* Title */}
              <Box display = "flex" flexDirection={"row"} alignItems={"center"}>
                <Typography variant="h6" color="text.primary" textAlign="center">
                  {t("myEquipment")}
                </Typography>
              </Box>
              {/* Sign in */}
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
            
            {/* Banner image */}
            {/* if mobile */}
            {isMobile ? (
              <Box sx={{
                backgroundImage: `url(${prefersDarkMode ? "/gym_dark.jpg" : "/gym.jpg"})`,
                backgroundSize: '160%', // Stretch the image to cover the entire Box
                backgroundPosition: 'center', // Center the image in the Box
                backgroundRepeat: 'no-repeat', // Prevent the image from repeating
                width:"100%",
                height: "120px",
                display: "flex",
                justifyContent: "center",
                alignItems: 'center',
                flexDirection: 'column',
                color: "background.bannerColor",
              }}>
                <Typography sx={{ fontSize: "1.75rem" }}>{t("Welcome to myEquipment")}</Typography>
                <Typography sx={{ width: "75%", display: "flex", justifyContent: "center", alignItems: 'center', textAlign: 'center', fontSize: "0.7rem" }}>
                  {t("Take or upload pictures of gym equipment you have access to using the + in the top left corner.")}
                </Typography>
              </Box>
            ) : (
              // if desktop
              <Box sx={{
                backgroundImage: `url(${prefersDarkMode ? "/gym_dark.jpg" : "/gym.jpg"})`,
                backgroundSize: '125%', // Stretch the image to cover the entire Box
                backgroundPosition: 'left', // Center the image in the Box
                backgroundRepeat: 'no-repeat', // Prevent the image from repeating
                width:"100%",
                height: "450px",
                display: "flex",
                justifyContent: "center",
                alignItems: 'center',
                flexDirection: 'column',
                color: "background.bannerColor",
              }}>
                <Typography sx={{ fontSize: "6.5rem" }}>{t("Welcome to myEquipment")}</Typography>
                <Typography sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: 'center', fontSize: "1.5rem" }}>
                  {t("Take or upload pictures of gym equipment you have access to using the + in the top left corner.")}
                </Typography>
              </Box>
            )}
            
            {/* Equipment list */}
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
            {/* equipments display */}
            <Grid container spacing={2} paddingX={1} style={{ height: '50%', overflow: 'scroll' }}>
              {filteredEquipmentList.map(({ name, count, image }, index) => (
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
                    <Stack width="100%" direction="column" justifyContent="space-between" alignItems="flex-end">
                      {image ? (
                        <Image
                          src={image}
                          alt={name}
                          width={100}
                          height={100}
                          style={{ borderRadius: '10px', objectFit: 'cover' }}
                        />
                      ) : (
                        <Image
                          src="/equipment.png"
                          alt={name}
                          width={100}
                          height={100}
                          style={{ borderRadius: '10px', objectFit: 'cover'}}
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
