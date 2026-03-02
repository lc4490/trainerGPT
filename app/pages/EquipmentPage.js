"use client";

import {
  Autocomplete,
  Box,
  Button,
  CssBaseline,
  Divider,
  Grid,
  InputAdornment,
  Modal,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { firestore } from "../firebase";
import Image from "next/image";
import { useUser, UserButton } from "@clerk/nextjs";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { darkTheme, lightTheme } from "../theme";
import Webcam from "react-webcam";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";

const AddItemModal = ({ openAdd, handleCloseAdd, image, setImage, itemName, setItemName, quantity, setQuantity, predictItem, addItem, setCameraOpen, t }) => (
  <Modal open={openAdd} onClose={handleCloseAdd}>
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
          sx={{ borderRadius: '16px', overflow: 'hidden' }}
        >
          <Image
            src={image}
            alt={"Captured"}
            width={300}
            height={300}
            style={{ borderRadius: '16px', objectFit: 'cover' }}
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
                  const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
                  if (!validTypes.includes(file.type)) {
                    alert('Unsupported image format. Please upload a PNG, JPEG, GIF, or WEBP file.');
                    return;
                  }
                  const maxSize = 20 * 1024 * 1024;
                  if (file.size > maxSize) {
                    alert('File is too large. Please upload an image smaller than 20 MB.');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImage(reader.result);
                    predictItem(reader.result).then(setItemName);
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
              '& fieldset': { borderColor: 'lightgray' },
              '&:hover fieldset': { borderColor: 'lightgray' },
              '&.Mui-focused fieldset': { borderColor: 'lightgray' },
            },
            '& .MuiInputLabel-root': {
              color: 'text.primary',
              fontSize: '2.5rem',
              fontWeight: '550',
            },
          }}
          InputProps={{ style: { textAlign: 'center', fontSize: '1.5rem' } }}
          InputLabelProps={{ style: { color: 'text.primary', width: '100%', fontSize: '1.5rem' } }}
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
              '&:hover': { backgroundColor: 'darkgray', color: 'text.primary', borderColor: 'text.primary' },
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
                '& fieldset': { borderColor: 'background.default' },
                '&:hover fieldset': { borderColor: 'background.default' },
                '&.Mui-focused fieldset': { borderColor: 'lightgray' },
              },
              '& .MuiInputLabel-root': { color: 'text.primary' },
            }}
            InputLabelProps={{ style: { color: 'text.primary', width: '100%' } }}
          />
          <Button
            sx={{
              backgroundColor: 'lightgray',
              color: 'black',
              borderColor: 'lightgray',
              borderRadius: '50px',
              height: "50px",
              minWidth: "50px",
              '&:hover': { backgroundColor: 'darkgray', color: 'text.primary', borderColor: 'text.primary' },
            }}
            onClick={() => setQuantity(prev => parseInt(prev) + 1)}
          >
            +
          </Button>
        </Stack>
        <Button
          variant="outlined"
          onClick={() => {
            addItem(itemName, parseInt(quantity), image);
            setItemName('');
            setQuantity(1);
            handleCloseAdd();
          }}
          sx={{
            backgroundColor: 'text.primary',
            color: 'background.default',
            borderColor: 'text.primary',
            '&:hover': { backgroundColor: 'darkgray', color: 'text.primary', borderColor: 'text.primary' },
          }}
        >
          {t("Add")}
        </Button>
      </Stack>
    </Box>
  </Modal>
);

const Banner = ({ isMobile, prefersDarkMode, t }) => (
  <>
    {isMobile ? (
      <Box sx={{
        backgroundImage: `url(${prefersDarkMode ? "/gym_dark.jpg" : "/gym_dark.jpg"})`,
        backgroundSize: '160%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: "100%",
        height: "120px",
        display: "flex",
        justifyContent: "center",
        alignItems: 'center',
        flexDirection: 'column',
        color: "white",
      }}>
        <Typography sx={{ fontSize: "1.75rem" }}>{t("Welcome to myEquipment")}</Typography>
        <Typography sx={{ width: "75%", display: "flex", justifyContent: "center", alignItems: 'center', textAlign: 'center', fontSize: "0.7rem" }}>
          {t("Take or upload pictures of gym equipment you have access to using the + in the top left corner.")}
        </Typography>
      </Box>
    ) : (
      <Box sx={{
        backgroundImage: `url(${prefersDarkMode ? "/gym_dark.jpg" : "/gym_dark.jpg"})`,
        backgroundSize: '200%',
        backgroundPosition: 'left',
        backgroundRepeat: 'no-repeat',
        width: "100%",
        height: "450px",
        display: "flex",
        justifyContent: "center",
        alignItems: 'center',
        flexDirection: 'column',
        color: "white",
      }}>
        <Typography sx={{ fontSize: "6.5rem" }}>{t("Welcome to myEquipment")}</Typography>
        <Typography sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: 'center', fontSize: "1.5rem" }}>
          {t("Take or upload pictures of gym equipment you have access to using the + in the top left corner.")}
        </Typography>
      </Box>
    )}
  </>
);

const CameraModal = ({ cameraOpen, setCameraOpen, captureImage, switchCamera, facingMode, webcamRef, t }) => (
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
            position: 'relative',
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
              videoConstraints={{ facingMode }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: facingMode === 'user' ? "scaleX(-1)" : "none",
              }}
            />
          </Box>
        </Box>
        <Stack flexDirection="row" gap={2} position="relative">
          <Button
            variant="outlined"
            onClick={captureImage}
            sx={{
              color: 'black', borderColor: 'white', backgroundColor: 'white',
              '&:hover': { backgroundColor: 'white', color: 'black', borderColor: 'white' },
              marginTop: 1,
            }}
          >
            {t("Take Photo")}
          </Button>
          <Button
            onClick={switchCamera}
            sx={{
              color: 'black', borderColor: 'white', backgroundColor: 'white',
              '&:hover': { backgroundColor: 'white', color: 'black', borderColor: 'white' },
              marginTop: 1,
            }}
          >
            {t("Switch Camera")}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setCameraOpen(false)}
            sx={{
              color: 'black', borderColor: 'white', backgroundColor: 'white',
              '&:hover': { backgroundColor: 'white', color: 'black', borderColor: 'white' },
              marginTop: 1,
            }}
          >
            {t("Exit")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  </Modal>
);

const EquipmentHeader = ({ equipmentList, isFocused, setIsFocused, searchTerm, setSearchTerm, t }) => (
  <>
    <Stack direction="row" alignItems="center" justifyContent="space-between" paddingX={2} paddingY={1}>
      <Typography variant="h4" color="text.primary" fontWeight="bold">
        {t("Equipment")}
      </Typography>
      <Autocomplete
        freeSolo
        disableClearable
        options={equipmentList.map((option) => option.name)}
        onInputChange={(_event, newInputValue) => setSearchTerm(newInputValue)}
        ListboxProps={{
          component: 'div',
          sx: { backgroundColor: 'background.default', color: 'text.primary' },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            sx={{
              paddingY: 1,
              width: isFocused ? '100%' : `${Math.max(searchTerm.length, 0) + 5}ch`,
              transition: 'width 0.3s',
              marginLeft: 'auto',
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'background.default' },
                '&:hover fieldset': { borderColor: 'text.primary' },
                '&.Mui-focused fieldset': { borderColor: 'text.primary' },
              },
              '& .MuiInputBase-input': { color: 'text.primary' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: 'text.primary' }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{ style: { color: 'text.primary', width: '100%', textAlign: 'center' } }}
          />
        )}
      />
    </Stack>
    <Divider />
    <Box height={25}></Box>
  </>
);

const EquipmentPageHeader = ({ handleOpenAddAndOpenCamera, handleInfoModal, isMobile, t }) => (
  <>
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
        variant="outlined"
        onClick={handleOpenAddAndOpenCamera}
        sx={{
          height: "55px",
          fontSize: '1rem',
          backgroundColor: 'background.default',
          color: 'text.primary',
          borderColor: 'background.default',
          borderRadius: '50px',
          '&:hover': { backgroundColor: 'text.primary', color: 'background.default', borderColor: 'text.primary' },
        }}
      >
        <Typography variant="h5">+</Typography>
      </Button>
      <Box display="flex" flexDirection={"row"} alignItems={"center"} gap={1}>
        <Typography variant="h6" color="text.primary" textAlign="center" sx={{ fontWeight: "800" }}>
          {t("myEquipment")}
        </Typography>
        <Button
          onClick={handleInfoModal}
          sx={{ minWidth: "auto", aspectRatio: "1 / 1", borderRadius: "50%", width: "20px", height: "20px" }}
        >
          <InfoIcon sx={{ color: "lightgray" }} />
        </Button>
      </Box>
      <Box>
        <UserButton />
      </Box>
    </Box>
    {isMobile && <Divider />}
  </>
);

const EquipmentInfoModal = ({ openInfoModal, setOpenInfoModal, t }) => (
  <Modal open={openInfoModal} onClose={() => setOpenInfoModal(false)}>
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
      }}
    >
      <Typography variant="h6" component="h2" fontWeight='600'>
        {t("How to use:")}
      </Typography>
      <Typography sx={{ mt: 2 }}>
        {t("1. Use the top left button to add items. You can either take a picture with your device's camera or upload an image from your device (make sure the render size is set to small). If you don't have access to the equipment right now, or you would like to manually enter or edit the AI's prediction, you can also directly type the name of the equipment.")}
      </Typography>
      <Typography sx={{ mt: 2 }}>
        {t("2. After adding a piece of equipment, you can adjust the quantity using the '-' and '+' icons under the item name. Set a quantity to 0 to delete an item.")}
      </Typography>
      <Typography sx={{ mt: 2 }}>
        {t("3. Use the search bar to find specific equipment by name.")}
      </Typography>
      <Typography sx={{ mt: 2 }}>
        {t("4. Sign in using the top right button to create an account or sign in.")}
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <Button
        variant="outlined"
        onClick={() => setOpenInfoModal(false)}
        sx={{
          mt: 2,
          backgroundColor: 'text.primary',
          color: 'background.default',
          borderColor: 'text.primary',
          '&:hover': { backgroundColor: 'darkgray', color: 'text.primary', borderColor: 'text.primary' },
        }}
      >
        {t('Close')}
      </Button>
    </Box>
  </Modal>
);

const EquipmentPage = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { user } = useUser();

  const [equipmentList, setEquipmentList] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFocused, setIsFocused] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("user");
  const [openInfoModal, setOpenInfoModal] = useState(false);

  const handleOpenAdd = () => {
    clearFields();
    setOpenAdd(true);
  };
  const handleCloseAdd = () => {
    clearFields();
    setOpenAdd(false);
  };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    predictItem(imageSrc).then(setItemName);
    setCameraOpen(false);
  };

  const switchCamera = () => {
    setFacingMode((prevFacingMode) =>
      prevFacingMode === "user" ? "environment" : "user",
    );
  };

  async function predictItem(image) {
    if (!image) return;
    const res = await fetch("/api/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "identify",
        image,
        prompt: "Label this piece of gym equipment in as few words as possible",
      }),
    });
    const { result } = await res.json();
    let cleaned = result.replace(/\./g, "");
    return cleaned
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const truncateString = (str, num) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + "...";
  };

  const clearFields = () => {
    setItemName("");
    setQuantity(1);
    setImage(null);
  };

  const sanitizeItemName = (name) => name.replace(/\//g, " and ");

  const updateEquipment = async () => {
    if (user) {
      const userId = user.id;
      const docRef = collection(firestore, "users", userId, "equipment");
      const docs = await getDocs(docRef);
      const equipment = [];
      docs.forEach((doc) => {
        equipment.push({ name: doc.id, ...doc.data() });
      });
      setEquipmentList(equipment);
    }
  };

  useEffect(() => {
    updateEquipment();
  }, [user]);

  const addItem = async (item, quantity, image) => {
    const sanitizedItemName = sanitizeItemName(item);
    if (isNaN(quantity) || quantity < 0) {
      alert("Quantity must be a positive number.");
      return;
    }
    if (user && quantity >= 1 && item) {
      const userId = user.id;
      const docRef = doc(firestore, "users", userId, "equipment", sanitizedItemName);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { count, image: existingImage } = docSnap.data();
        await setDoc(docRef, { count: count + quantity, image: image || existingImage });
      } else {
        await setDoc(docRef, { count: quantity, image });
      }
      await updateEquipment();
    }
  };

  const handleQuantityChange = async (item, quantity) => {
    if (user) {
      const userId = user.id;
      const docRef = doc(firestore, "users", userId, "equipment", item);
      if (quantity === 0) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: quantity });
      }
      await updateEquipment();
    }
  };

  const handleOpenAddAndOpenCamera = () => {
    handleOpenAdd();
  };

  const filteredEquipmentList = equipmentList.filter(({ name }) =>
    name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);
  const theme = darkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleInfoModal = () => {
    setOpenInfoModal(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        width="100%"
        height="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        overflow="scroll"
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
        <EquipmentInfoModal
          openInfoModal={openInfoModal}
          setOpenInfoModal={setOpenInfoModal}
          t={t}
        />

        <Box width="100%" height="100%" bgcolor="background.default">
          <EquipmentPageHeader
            handleOpenAddAndOpenCamera={handleOpenAddAndOpenCamera}
            handleInfoModal={handleInfoModal}
            isMobile={isMobile}
            t={t}
          />

          <Banner isMobile={isMobile} prefersDarkMode={prefersDarkMode} t={t} />

          <EquipmentHeader
            equipmentList={equipmentList}
            isFocused={isFocused}
            setIsFocused={setIsFocused}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            t={t}
          />

          <Grid
            container
            spacing={2}
            paddingX={1}
            sx={{ paddingBottom: isMobile ? "60px" : "0px" }}
          >
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
                      style={{ flexGrow: 1, whiteSpace: "nowrap" }}
                    >
                      {truncateString(
                        name.charAt(0).toUpperCase() + name.slice(1),
                        16,
                      )}
                    </Typography>
                    <Stack
                      width="100%"
                      direction="row"
                      justifyContent="start"
                      alignItems="center"
                    >
                      <Button
                        sx={{
                          height: "25px",
                          minWidth: "25px",
                          backgroundColor: "lightgray",
                          color: "black",
                          borderColor: "lightgray",
                          borderRadius: "50px",
                          "&:hover": { backgroundColor: "darkgray", color: "text.primary", borderColor: "text.primary" },
                        }}
                        onClick={() =>
                          handleQuantityChange(name, Math.max(0, count - 1))
                        }
                      >
                        -
                      </Button>
                      <TextField
                        label=""
                        variant="outlined"
                        value={parseInt(count)}
                        onChange={(e) =>
                          handleQuantityChange(name, parseInt(e.target.value) || 0)
                        }
                        sx={{
                          width: "45px",
                          "& .MuiOutlinedInput-root": {
                            color: "text.primary",
                            "& fieldset": { borderColor: "background.default" },
                            "&:hover fieldset": { borderColor: "background.default" },
                            "&.Mui-focused fieldset": { borderColor: "lightgray" },
                          },
                          "& .MuiInputLabel-root": { color: "text.primary" },
                        }}
                        InputProps={{
                          sx: { textAlign: "center", fontSize: "0.75rem" },
                          inputProps: { style: { textAlign: "center" } },
                        }}
                        InputLabelProps={{
                          style: { color: "text.primary", width: "100%", textAlign: "center" },
                        }}
                      />
                      <Button
                        sx={{
                          height: "25px",
                          minWidth: "25px",
                          backgroundColor: "lightgray",
                          color: "black",
                          borderColor: "lightgray",
                          borderRadius: "50px",
                          "&:hover": { backgroundColor: "darkgray", color: "text.primary", borderColor: "text.primary" },
                        }}
                        onClick={() => handleQuantityChange(name, count + 1)}
                      >
                        +
                      </Button>
                    </Stack>
                  </Stack>
                  <Stack
                    width="100%"
                    direction="column"
                    justifyContent="space-between"
                    alignItems="flex-end"
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={name}
                        width={100}
                        height={100}
                        style={{ borderRadius: "10px", objectFit: "cover" }}
                      />
                    ) : (
                      <Image
                        src="/equipment.png"
                        alt={name}
                        width={100}
                        height={100}
                        style={{ borderRadius: "10px", objectFit: "cover" }}
                      />
                    )}
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EquipmentPage;
