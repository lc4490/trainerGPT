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

// use Clerk
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";

// use googlesignin
import { onAuthStateChanged } from 'firebase/auth';

// theme imports
import { createTheme, ThemeProvider, useTheme, CssBaseline, useMediaQuery, IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

// translations
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Adjust the path as necessary

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

const NutritionPage = () => {
  // Implementing multi-languages
  const { t, i18n } = useTranslation();
  const { user, isSignedIn } = useUser();

  const [pantry, setPantry] = useState([])
  const [recipes, setRecipes] = useState([])
  const [openRecipeModal, setOpenRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState({});
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
  const [recipeSearchTerm, setRecipeSearchTerm] = useState('');

  // item name/quantity
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  
  // toggle searchbar for pantry and recipes
  const [isFocused, setIsFocused] = useState(false); 
  const [isFocusedRecipe, setIsFocusedRecipe] = useState(false);

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
  
  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
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
                text: t("Identify"),
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
  // helper function to craft and set recipes
  const generateRecipes = async () => {
    const recipes = await craftRecipes(pantry);
    setRecipes(recipes);
  };
  // function to craft ai recipes from list of pantry items (ai)
  async function craftRecipes(pantry) {
    if (pantry.length !== 0) {
        const ingredients = pantry.map(item => item.name).join(', ');
        const translatedPrompt =  t('Generate', { ingredients });

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: translatedPrompt,
                },
            ],
        });

        const result = response.choices[0].message.content.trim().split("\n\n");

        const recipePromises = result.map(async (item) => {
            const parts = item.split("\n");
            let recipe = '';
            let ingredients = '';
            let instructions = '';

            if (parts.length > 0 && parts[0].includes(": ")) {
                recipe = parts[0].split(": ")[1]?.replace(/\*/g, '') || '';
            }
            if (parts.length > 1 && parts[1].includes(": ")) {
                ingredients = parts[1].split(": ")[1]?.replace(/\*/g, '') || '';
            }
            if (parts.length > 2 && parts[2].includes(": ")) {
                instructions = parts[2].split(": ")[1]?.replace(/\*/g, '') || '';
            }

            if (!recipe || !ingredients || !instructions) {
                console.error('Failed to parse recipe details:', item);
                return null;
            }

            const image = await createImage(recipe);
            return { recipe, ingredients, instructions, image };
        });

        const recipes = await Promise.all(recipePromises);
        console.log(recipes)
        console.log(pantry)
        return recipes.filter(recipe => recipe !== null);
    }
    return [];
  }
  // function to craft ai images from label (ai)
  async function createImage(label) {
    return
    try {
        const response = await openai.images.generate({
            model: 'dall-e-3',
            prompt: label,
            n: 1,
            size: "256x256",
            response_format: 'b64_json',
        });
        const ret = response.data;
        if (ret && ret.length > 0) {
            const base64String = ret[0].b64_json;
            return `data:image/png;base64,${base64String}`;
        }
        return null;
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.log("Rate limit exceeded. Retrying in 10 seconds...");
            await sleep(10000); // Wait for 10 seconds
            return createImage(label); // Retry the request
        } else {
            console.error("Error creating image:", error);
        }
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
  const updatePantry = async () => {
    if (user) {
      const userId = user.id;
      const docRef = collection(firestore, 'users', userId, 'pantry');
      const docs = await getDocs(docRef);
      const pantryList = [];
      docs.forEach((doc) => {
        pantryList.push({ name: doc.id, ...doc.data() });
      });
      setPantry(pantryList);
    }
  };
  // add item function
  const addItem = async (item, quantity, image) => {
    if (guestMode) {
      setPantry(prevPantry => [...prevPantry, { name: item, count: quantity, image }]);
    } else {
      if (!user) {
        alert("You must be signed in to add items.");
        return;
      }
      if (isNaN(quantity) || quantity < 0) {
        setOpenWarningAdd(true);
      } else if (quantity >= 1 && item != '') {
        const userId = user.id;
        // const docRef = doc(collection(firestore, `pantry_${userUID}`), item);
        const docRef = doc(firestore, 'users', userId, 'pantry', item);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const { count, image: existingImage } = docSnap.data();
          await setDoc(docRef, { count: count + quantity, image: image || existingImage });
        } else {
          await setDoc(docRef, { count: quantity, image });
        }
        await updatePantry();
      }
    }
  }
  // change quantity function
  const handleQuantityChange = async (item, quantity) => {
    if (guestMode) {
      setPantry(prevPantry => prevPantry.map(p => p.name === item ? { ...p, count: quantity } : p));
    } else {
      if (!user) {
        alert("You must be signed in to change item quantities.");
        return;
      }
      const userId = user.id;
      // const docRef = doc(collection(firestore, `pantry_${userUID}`), item);
      const docRef = doc(firestore, 'users', userId, 'pantry', item);
      const docSnap = await getDoc(docRef);
      const { count, image } = docSnap.data();
      if (0 === quantity) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: quantity, ...(image && { image }) });
      }
      await updatePantry();
    }
  };
  useEffect(() => {
    updatePantry()
  }, [user])

  useEffect(() => {
    generateRecipes()
  }, [pantry])

  // open add modal and open camera at the same time
  const handleOpenAddAndOpenCamera = () => {
    handleOpenAdd();
    // setCameraOpen(true);
  };

  // filter pantry and recipes based on search
  const filteredPantry = pantry.filter(({ name }) => name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredRecipes = recipes.filter(({ recipe }) => recipe.toLowerCase().includes(recipeSearchTerm.toLowerCase()));
  
  // open recipe modal, lock in on specific recipe
  const handleRecipeModal = (index) => {
    setSelectedRecipe(index);
    setOpenRecipeModal(true);
  };

  // const [user, setUser] = useState(null);
  const [guestMode, setGuestMode] = useState(false);

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //       setUser(user);
  //       setGuestMode(false);
  //       updatePantry();
  //     } else {
  //       setUser(null);
  //       setGuestMode(true);
  //       setPantry([]);
  //       setRecipes([]);
  //     }
  //   });
  //   return () => unsubscribe();
  // }, []);

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
        height="100vh"
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
                  {t('Open Camera')}
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
                  {t('Upload Photo')}
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
                      transform: facingMode === 'user' ? "scaleX(-1)" : "none"
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

        {/* recipe modal */}
        <Modal open={openRecipeModal} onClose={() => setOpenRecipeModal(false)}>
          <Box
            overflow="auto"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              height: '90%',
              bgcolor: 'background.default',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {selectedRecipe !== null && recipes[selectedRecipe] && (
              <>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  width="100%"
                  paddingY={2}
                >
                  {recipes[selectedRecipe].image && recipes[selectedRecipe].image !== null ? (
                    <Image 
                      src={recipes[selectedRecipe].image}
                      alt={recipes[selectedRecipe].recipe}
                      width={200}
                      height={200}
                      style={{ borderRadius: '10px', }}
                    />
                  ) : (
                    <Image 
                      src="/recipe.jpg"
                      alt={recipes[selectedRecipe].recipe}
                      width={200}
                      height={200}
                      style={{ borderRadius: '10px', objectFit: 'cover', }}
                    />
                  )}
                </Box>
                <Typography variant="h6" component="h2" fontWeight='600'>
                  {recipes[selectedRecipe].recipe}
                </Typography>
                <Typography sx={{ mt: 2 }}>
                  <strong>{t('Ingredients')}</strong> {recipes[selectedRecipe].ingredients}
                </Typography>
                <Typography sx={{ mt: 2 }}>
                  <strong>{t('Instructions')}</strong> {recipes[selectedRecipe].instructions}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button 
                  variant="outlined"
                  onClick={() => {
                    setOpenRecipeModal(false)
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
                  {t('Close')}
                </Button>
              </>
            )}
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
                {t('myPantry')}
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
          
          {/* banner image */}
          {/* <Image 
            src= {prefersDarkMode ? "/banner_pantry_dark.png" : "/banner_pantry.png"} 
            alt="banner"
            // layout="responsive"
            width={800}
            height={200}
            style={{ width: '100%', height: 'auto'}}
          /> */}
          {/* Banner image */}
            {/* if mobile */}
            {isMobile ? (
              <Box sx={{
                backgroundImage: `url(${prefersDarkMode ? "/pantry_dark.jpg" : "/pantry.jpg"})`,
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
                <Typography sx={{ fontSize: "1.75rem" }}>{t("Welcome to myPantry")}</Typography>
                <Typography sx={{ width: "75%", display: "flex", justifyContent: "center", alignItems: 'center', textAlign: 'center', fontSize: "0.7rem"}}>
                  {t("Add in new pantry items using the + in the top left corner.")}
                </Typography>
                <Typography sx={{ width: "75%", display: "flex", justifyContent: "center", alignItems: 'center', textAlign: 'center', fontSize: "0.7rem" }}>
                  {t("Recipes will generate below based on ingredients available.")}
                </Typography>
              </Box>
            ) : (
              // if desktop
              <Box sx={{
                backgroundImage: `url(${prefersDarkMode ? "/pantry_dark.jpg" : "/pantry.jpg"})`,
                backgroundSize: '100%', // Stretch the image to cover the entire Box
                backgroundPosition: 'center', // Center the image in the Box
                backgroundRepeat: 'no-repeat', // Prevent the image from repeating
                width:"100%",
                height: "450px",
                display: "flex",
                justifyContent: "center",
                alignItems: 'center',
                flexDirection: 'column',
                color: "background.bannerColor",
              }}>
                <Typography sx={{ fontSize: "6.5rem" }}>{t("Welcome to myPantry")}</Typography>
                <Typography sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: 'center', fontSize: "1.5rem" }}>
                  {t("Add in new pantry items using the + in the top left corner.")}
                </Typography>
                <Typography sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: 'center', fontSize: "1.5rem" }}>
                  {t("Recipes will generate below based on ingredients available.")}
                </Typography>
              </Box>
            )}

          {/* recipes */}
          <Stack flexDirection="row">
            {/* title */}
            <Typography padding={2} variant="h4" color="text.primary" fontWeight="bold">{t("Recipes")}</Typography>
            {/* search bar */}
            <Autocomplete
              freeSolo
              disableClearable
              options={recipes.map((option) => option.recipe)}
              onInputChange={(event, newInputValue) => {
                setRecipeSearchTerm(newInputValue);
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
                  onFocus={() => setIsFocusedRecipe(true)}
                  onBlur={() => setIsFocusedRecipe(false)}
                  sx={{
                    position: 'absolute',
                    right: "2%",
                    paddingY: 1,
                    transform: 'translateY(0%)',
                    width: isFocusedRecipe ? '25%' : `${Math.max(recipeSearchTerm.length, 0) + 5}ch`,
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
          {/* recipes stack */}
          <Stack paddingX={2} flexDirection="row" alignItems="flex-start" style={{ overflow: 'scroll' }}>
            {filteredRecipes.map(({ recipe, ingredients, instructions, image }, index) => (
              <Button 
                key={index} 
                sx={{ color: "text.primary", marginRight: 2, flexShrink: 0 }}
                onClick={() => handleRecipeModal(index)}
              >
                {/* recipe item */}
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  alignItems="center"
                  bgcolor="background.default"
                  padding={1}
                  sx={{
                    width: '275px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                  }}
                >
                  {/* recipe image */}
                  <Stack direction="column" justifyContent="space-between" alignItems="center">
                    
                    {image && image !== null ? (
                      <Image 
                        src={image}
                        alt={recipe}
                        width={200}
                        height={200}
                        style={{ borderRadius: '10px', }}
                      />
                    ) : (
                      <Image 
                        src="/recipe.jpg"
                        alt={recipe}
                        width={200}
                        height={200}
                        style={{ borderRadius: '10px', objectFit: 'cover' }}
                      />
                    )}
                  </Stack>
                  {/* recipe name */}
                  <Stack>
                    <Typography
                      variant="h5"
                      color="text.primary"
                      textAlign="center"
                      fontWeight="550"
                      style={{
                        flexGrow: 1,
                        textAlign: "center",
                        overflow: 'hidden',
                        padding: 5,
                      }}
                    >
                      {truncateString(recipe.charAt(0).toUpperCase() + recipe.slice(1), 50)}
                    </Typography>
                  </Stack>
                </Box>
              </Button>
            ))}
          </Stack>

          {/* pantry */}
          <Stack flexDirection="row">
            {/* title */}
            <Typography padding={2} variant="h4" color="text.primary" fontWeight="bold">{t('Pantry')}</Typography>
            {/* search bar */}
            <Autocomplete
              freeSolo
              disableClearable
              options={pantry.map((option) => option.name)}
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
          {/* pantry stack */}
          <Grid container spacing={2} paddingX={1} sx={{paddingBottom: '60px'}}>
            {filteredPantry.map(({ name, count, image }, index) => (
              // pantry item
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
                  {/* pantry ingredient name and quantity change */}
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
                  {/* pantry ingredient image */}
                  <Stack width="100%" direction="column" justifyContent="space-between" alignItems="flex-end">
                    {image ? (
                      <Image
                        src={image}
                        alt={name}
                        width={100}
                        height={100}
                        style={{ borderRadius: '10px', objectFit: 'cover', }}
                      />
                    ) : (
                      <Image
                        src="/ingredients.jpg"
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

export default NutritionPage;
