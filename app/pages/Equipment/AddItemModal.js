// components/EquipmentPage/AddItemModal.js
import { Box, Button, Modal, Stack, TextField, Divider, Typography } from '@mui/material';
import Image from 'next/image';

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
);

export default AddItemModal;
