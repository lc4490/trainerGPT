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
// router
import { useRouter, useSearchParams } from 'next/navigation';
// info button
import InfoIcon from '@mui/icons-material/Info';

// front end
import Header from './Equipment/Header';
import Banner from './Equipment/Banner';
import AddItemModal from './Equipment/AddItemModal';
import CameraModal from './Equipment/CameraModal';
import InfoModal from './Equipment/InfoModal';
import EquipmentHeader from './Equipment/EquipmentHeader';
// back end
import { lightTheme, darkTheme } from '../theme';
const EquipmentPage = () => {
  // router
  const router = useRouter();
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
  // guest context
  const {guestData, guestImage, guestEquipment, setGuestEquipment, guestMessages} = useContext(GuestContext)
  // info modal
  const [openInfoModal, setOpenInfoModal] = useState(false);

  // open modal declareables
  const handleOpenAdd = () => {
    clearFields()
    setOpenAdd(true)
  };
  const handleCloseAdd = () => {
    clearFields()
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
      if(quantity >=1){
        setGuestEquipment((guestEquipment) => [...guestEquipment, {name: sanitizedItemName, count: quantity, image: image}]);
        setEquipmentList(guestEquipment)
      }
      
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

  // open Info modal
  const handleInfoModal = () => {
    setOpenInfoModal(true);
  }


  return (
    // light/dark mode
    <ThemeProvider theme={theme}>
      <CssBaseline />
        {/* base box */}
        <Box 
          width="100%" 
          height = "100%"
          display="flex" 
          justifyContent="center" 
          alignItems="center"
          flexDirection="column"
          paddingBottom= '60px' // Ensure content is not cut off by the toolbar
          // gap={2}
        >
          <AddItemModal 
            openAdd={openAdd}
            handleCloseAdd={handleCloseAdd}
            image={image}
            setImage={setImage}
            itemName={itemName}
            setItemName={setItemName}
            quantity={quantity}
            setQuantity={setQuantity}
            predictItem={predictItem}
            addItem={addItem}
            setCameraOpen={setCameraOpen}
            t={t}
          />
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

          {/* Main page */}
          <Box width="100%" height="100%" bgcolor="background.default">
            <Header
              handleOpenAddAndOpenCamera={handleOpenAddAndOpenCamera}
              handleSignInClick={handleSignInClick}
              handleInfoModal={handleInfoModal}
              isSignedIn={isSignedIn}
              isMobile={isMobile}
              t={t}
            />
            
            <Banner 
            isMobile={isMobile}
            prefersDarkMode={prefersDarkMode}
            t={t}
            />
            
            <EquipmentHeader 
            equipmentList={equipmentList}
            isFocused={isFocused}
            setIsFocused={setIsFocused}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            t={t}/>
            
            <Grid container spacing={2} paddingX={1} sx={{paddingBottom: '60px'}}>
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
