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
import { darkTheme, lightTheme } from "../theme";
import Webcam from "react-webcam";
import SearchIcon from "@mui/icons-material/Search";
import InfoIcon from "@mui/icons-material/Info";

const GRAD = "linear-gradient(90deg, #E53935, #FB8C00)";

// ─── Add Item Modal ────────────────────────────────────────────────────────────
const AddItemModal = ({
  openAdd, handleCloseAdd, image, setImage, itemName, setItemName,
  quantity, setQuantity, predictItem, addItem, setCameraOpen, t,
}) => (
  <Modal open={openAdd} onClose={handleCloseAdd}>
    <Box
      sx={{
        position: "absolute",
        top: "10%",
        width: "100%",
        height: "90%",
        bgcolor: "background.default",
        border: "none",
        boxShadow: 24,
        p: 3,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        gap: 3,
        color: "text.primary",
        borderRadius: 3,
      }}
    >
      {image ? (
        <Box
          display="flex"
          justifyContent="center"
          width="100%"
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <Image
            src={image}
            alt="Captured"
            width={300}
            height={300}
            style={{ borderRadius: "12px", objectFit: "cover" }}
          />
        </Box>
      ) : (
        <Stack direction="row" gap={2}>
          <Button
            variant="outlined"
            onClick={() => setCameraOpen(true)}
            sx={{
              color: "text.primary",
              borderColor: "divider",
              borderRadius: "999px",
              "&:hover": { bgcolor: "text.primary", color: "background.default" },
            }}
          >
            {t("Open Camera")}
          </Button>
          <Button
            variant="outlined"
            component="label"
            sx={{
              color: "text.primary",
              borderColor: "divider",
              borderRadius: "999px",
              "&:hover": { bgcolor: "text.primary", color: "background.default" },
            }}
          >
            {t("Upload Photo")}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const validTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
                if (!validTypes.includes(file.type)) {
                  alert("Unsupported format. Use PNG, JPEG, GIF, or WEBP.");
                  return;
                }
                if (file.size > 20 * 1024 * 1024) {
                  alert("File too large. Max 20 MB.");
                  return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImage(reader.result);
                  predictItem(reader.result).then(setItemName);
                };
                reader.readAsDataURL(file);
              }}
            />
          </Button>
        </Stack>
      )}

      <Divider sx={{ width: "100%" }} />

      <TextField
        variant="outlined"
        fullWidth
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        placeholder={t("Item name")}
        sx={{
          "& .MuiOutlinedInput-root": {
            color: "text.primary",
            fontSize: "1.5rem",
            fontWeight: 600,
            "& fieldset": { borderColor: "divider" },
            "&:hover fieldset": { borderColor: "text.primary" },
            "&.Mui-focused fieldset": { borderColor: "text.primary" },
          },
        }}
        InputProps={{ style: { textAlign: "center" } }}
      />

      <Stack width="100%" direction="column" spacing={2}>
        <Stack direction="row" justifyContent="center" alignItems="center" gap={1}>
          <Button
            onClick={() => setQuantity((p) => Math.max(0, parseInt(p) - 1))}
            sx={{
              height: 40, minWidth: 40, borderRadius: "50%",
              bgcolor: "action.hover", color: "text.primary",
              "&:hover": { bgcolor: "text.primary", color: "background.default" },
            }}
          >
            −
          </Button>
          <TextField
            variant="outlined"
            value={parseInt(quantity)}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            sx={{
              width: 60,
              "& .MuiOutlinedInput-root": {
                color: "text.primary",
                "& fieldset": { borderColor: "divider" },
              },
            }}
            InputProps={{
              inputProps: { style: { textAlign: "center", fontWeight: 700 } },
            }}
          />
          <Button
            onClick={() => setQuantity((p) => parseInt(p) + 1)}
            sx={{
              height: 40, minWidth: 40, borderRadius: "50%",
              bgcolor: "action.hover", color: "text.primary",
              "&:hover": { bgcolor: "text.primary", color: "background.default" },
            }}
          >
            +
          </Button>
        </Stack>
        <Button
          onClick={() => {
            addItem(itemName, parseInt(quantity), image);
            setItemName("");
            setQuantity(1);
            handleCloseAdd();
          }}
          sx={{
            background: GRAD,
            color: "white",
            borderRadius: "999px",
            py: 1.5,
            fontWeight: 700,
            "&:hover": { opacity: 0.85 },
          }}
        >
          {t("Add")}
        </Button>
      </Stack>
    </Box>
  </Modal>
);

// ─── Camera Modal ──────────────────────────────────────────────────────────────
const CameraModal = ({ cameraOpen, setCameraOpen, captureImage, switchCamera, facingMode, webcamRef, t }) => (
  <Modal open={cameraOpen} onClose={() => setCameraOpen(false)}>
    <Box width="100vw" height="100vh" bgcolor="black" display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={2}>
      <Box
        sx={{
          width: 320, height: 320,
          borderRadius: 3, overflow: "hidden",
          border: "2px solid rgba(255,255,255,0.2)",
        }}
      >
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode }}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: facingMode === "user" ? "scaleX(-1)" : "none",
          }}
        />
      </Box>
      <Stack flexDirection="row" gap={1.5}>
        {[
          { label: t("Take Photo"), onClick: captureImage },
          { label: t("Switch Camera"), onClick: switchCamera },
          { label: t("Exit"), onClick: () => setCameraOpen(false) },
        ].map(({ label, onClick }) => (
          <Button
            key={label}
            onClick={onClick}
            sx={{
              bgcolor: "white", color: "black", borderRadius: "999px",
              "&:hover": { bgcolor: "rgba(255,255,255,0.85)" },
            }}
          >
            {label}
          </Button>
        ))}
      </Stack>
    </Box>
  </Modal>
);

// ─── Info Modal ────────────────────────────────────────────────────────────────
const EquipmentInfoModal = ({ openInfoModal, setOpenInfoModal, t }) => (
  <Modal open={openInfoModal} onClose={() => setOpenInfoModal(false)}>
    <Box
      overflow="auto"
      sx={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 350, height: "75%",
        bgcolor: "background.default",
        border: "none", borderRadius: 3,
        boxShadow: 24, p: 4,
        display: "flex", flexDirection: "column",
      }}
    >
      <Typography fontWeight={700}>{t("How to use:")}</Typography>
      <Typography sx={{ mt: 2, fontSize: "0.9rem" }}>
        {t("1. Use the top left button to add items. You can either take a picture with your device's camera or upload an image from your device (make sure the render size is set to small). If you don't have access to the equipment right now, or you would like to manually enter or edit the AI's prediction, you can also directly type the name of the equipment.")}
      </Typography>
      <Typography sx={{ mt: 2, fontSize: "0.9rem" }}>
        {t("2. After adding a piece of equipment, you can adjust the quantity using the '-' and '+' icons under the item name. Set a quantity to 0 to delete an item.")}
      </Typography>
      <Typography sx={{ mt: 2, fontSize: "0.9rem" }}>
        {t("3. Use the search bar to find specific equipment by name.")}
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
      <Button
        onClick={() => setOpenInfoModal(false)}
        sx={{
          mt: 2, background: GRAD, color: "white",
          borderRadius: "999px", "&:hover": { opacity: 0.85 },
        }}
      >
        {t("Close")}
      </Button>
    </Box>
  </Modal>
);

// ─── EquipmentPage ─────────────────────────────────────────────────────────────
const EquipmentPage = () => {
  const { t } = useTranslation();
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

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  useEffect(() => { setDarkMode(prefersDarkMode); }, [prefersDarkMode]);
  const theme = darkMode ? darkTheme : lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const clearFields = () => { setItemName(""); setQuantity(1); setImage(null); };
  const handleOpenAdd = () => { clearFields(); setOpenAdd(true); };
  const handleCloseAdd = () => { clearFields(); setOpenAdd(false); };

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    predictItem(imageSrc).then(setItemName);
    setCameraOpen(false);
  };
  const switchCamera = () =>
    setFacingMode((p) => (p === "user" ? "environment" : "user"));

  async function predictItem(img) {
    if (!img) return;
    const res = await fetch("/api/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "identify", image: img,
        prompt: "Label this piece of gym equipment in as few words as possible",
      }),
    });
    const { result } = await res.json();
    return result
      .replace(/\./g, "")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  const truncateString = (str, num) =>
    str.length <= num ? str : str.slice(0, num) + "...";

  const sanitizeItemName = (name) => name.replace(/\//g, " and ");

  const updateEquipment = async () => {
    if (user) {
      const userId = user.id;
      const colRef = collection(firestore, "users", userId, "equipment");
      const docs = await getDocs(colRef);
      const equipment = [];
      docs.forEach((d) => equipment.push({ name: d.id, ...d.data() }));
      setEquipmentList(equipment);
    }
  };
  useEffect(() => { updateEquipment(); }, [user]);

  const addItem = async (item, qty, img) => {
    const sanitized = sanitizeItemName(item);
    if (isNaN(qty) || qty < 1 || !item) return;
    if (user) {
      const userId = user.id;
      const docRef = doc(firestore, "users", userId, "equipment", sanitized);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { count, image: existingImage } = docSnap.data();
        await setDoc(docRef, { count: count + qty, image: img || existingImage });
      } else {
        await setDoc(docRef, { count: qty, image: img });
      }
      await updateEquipment();
    }
  };

  const handleQuantityChange = async (item, qty) => {
    if (!user) return;
    const userId = user.id;
    const docRef = doc(firestore, "users", userId, "equipment", item);
    if (qty === 0) {
      await deleteDoc(docRef);
    } else {
      const docSnap = await getDoc(docRef);
      const existingImage = docSnap.exists() ? docSnap.data().image : null;
      await setDoc(docRef, { count: qty, ...(existingImage && { image: existingImage }) });
    }
    await updateEquipment();
  };

  const filteredEquipmentList = equipmentList.filter(({ name }) =>
    name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AddItemModal
        openAdd={openAdd} handleCloseAdd={handleCloseAdd}
        image={image} setImage={setImage}
        itemName={itemName} setItemName={setItemName}
        quantity={quantity} setQuantity={setQuantity}
        predictItem={predictItem} addItem={addItem}
        setCameraOpen={setCameraOpen} t={t}
      />
      <CameraModal
        cameraOpen={cameraOpen} setCameraOpen={setCameraOpen}
        captureImage={captureImage} switchCamera={switchCamera}
        facingMode={facingMode} webcamRef={webcamRef} t={t}
      />
      <EquipmentInfoModal
        openInfoModal={openInfoModal} setOpenInfoModal={setOpenInfoModal} t={t}
      />

      <Box width="100%" height="100%" display="flex" flexDirection="column" bgcolor="background.default" overflow="auto">

        {/* ── Header ── */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          paddingX={2.5}
          paddingY={1.25}
          bgcolor="background.default"
          sx={{
            borderBottom: "1px solid",
            borderColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
            flexShrink: 0,
          }}
        >
          <Button
            onClick={handleOpenAdd}
            variant="outlined"
            sx={{
              height: 44, minWidth: 44,
              borderColor: "divider", borderRadius: "22px",
              color: "text.primary", bgcolor: "background.default",
              "&:hover": { bgcolor: "text.primary", color: "background.default" },
            }}
          >
            <Typography variant="h5" lineHeight={1}>+</Typography>
          </Button>

          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography
              sx={{
                fontWeight: 800, fontSize: "1.1rem",
                background: GRAD,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontFamily: '"Gilroy", "Arial", sans-serif',
              }}
            >
              {t("myEquipment")}
            </Typography>
            <Button
              onClick={() => setOpenInfoModal(true)}
              sx={{ minWidth: "auto", width: 28, height: 28, borderRadius: "50%", p: 0 }}
            >
              <InfoIcon sx={{ color: "text.disabled", fontSize: "1.1rem" }} />
            </Button>
          </Box>

          <UserButton />
        </Box>

        {/* ── Banner ── */}
        <Box
          sx={{
            width: "100%",
            height: isMobile ? 140 : 180,
            position: "relative",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <Image
            src={darkMode ? "/gym_dark.jpg" : "/gym.jpg"}
            alt="gym"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        </Box>

        {/* ── Equipment section header ── */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          paddingX={2.5}
          paddingY={1.5}
        >
          <Typography fontWeight={700} fontSize="1rem" color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
            {t("Equipment")}
          </Typography>
          <Autocomplete
            freeSolo
            disableClearable
            options={equipmentList.map((o) => o.name)}
            onInputChange={(_e, val) => setSearchTerm(val)}
            ListboxProps={{
              sx: { bgcolor: "background.default", color: "text.primary" },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={t("Search")}
                sx={{
                  width: isFocused ? 200 : `${Math.max(searchTerm.length, 8)}ch`,
                  transition: "width 0.3s",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "999px",
                    "& fieldset": { borderColor: "divider" },
                    "&:hover fieldset": { borderColor: "text.primary" },
                    "&.Mui-focused fieldset": { borderColor: "text.primary" },
                  },
                  "& .MuiInputBase-input": { color: "text.primary" },
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.disabled", fontSize: "1rem" }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Stack>
        <Divider />

        {/* ── Equipment grid ── */}
        <Grid
          container
          spacing={2}
          paddingX={2.5}
          paddingTop={2}
          paddingBottom={isMobile ? "80px" : 4}
        >
          {filteredEquipmentList.map(({ name, count, image }, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                bgcolor="background.paper"
                padding={2}
                sx={{
                  border: "1px solid",
                  borderColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                  borderRadius: 3,
                  transition: "box-shadow 0.15s",
                  "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.10)" },
                }}
              >
                {/* Name + quantity controls */}
                <Stack gap={1}>
                  <Typography
                    fontWeight={700}
                    fontSize="0.95rem"
                    color="text.primary"
                    noWrap
                    sx={{ maxWidth: 140 }}
                  >
                    {truncateString(
                      name.charAt(0).toUpperCase() + name.slice(1),
                      18,
                    )}
                  </Typography>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Button
                      onClick={() => handleQuantityChange(name, Math.max(0, count - 1))}
                      sx={{
                        height: 28, minWidth: 28, borderRadius: "50%",
                        bgcolor: "action.hover", color: "text.primary", p: 0,
                        "&:hover": { bgcolor: "text.primary", color: "background.default" },
                      }}
                    >
                      −
                    </Button>
                    <TextField
                      variant="outlined"
                      value={parseInt(count)}
                      onChange={(e) =>
                        handleQuantityChange(name, parseInt(e.target.value) || 0)
                      }
                      sx={{
                        width: 44,
                        "& .MuiOutlinedInput-root": {
                          color: "text.primary",
                          "& fieldset": { borderColor: "divider" },
                        },
                      }}
                      InputProps={{
                        inputProps: {
                          style: { textAlign: "center", fontSize: "0.8rem", fontWeight: 700, padding: "4px 0" },
                        },
                      }}
                    />
                    <Button
                      onClick={() => handleQuantityChange(name, count + 1)}
                      sx={{
                        height: 28, minWidth: 28, borderRadius: "50%",
                        bgcolor: "action.hover", color: "text.primary", p: 0,
                        "&:hover": { bgcolor: "text.primary", color: "background.default" },
                      }}
                    >
                      +
                    </Button>
                  </Stack>
                </Stack>

                {/* Image */}
                <Image
                  src={image || "/equipment.png"}
                  alt={name}
                  width={88}
                  height={88}
                  style={{ borderRadius: 10, objectFit: "cover" }}
                />
              </Box>
            </Grid>
          ))}

          {/* Empty state */}
          {filteredEquipmentList.length === 0 && (
            <Grid item xs={12}>
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={8}
                gap={1}
              >
                <Typography color="text.disabled" fontSize="0.9rem">
                  {searchTerm
                    ? t("No equipment matches your search.")
                    : t("No equipment yet. Tap + to add your first item.")}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default EquipmentPage;
