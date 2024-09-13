import { Box, Typography, Button, Modal } from '@mui/material';

const InfoModal = ({ openInfoModal, setOpenInfoModal, t }) => (
    <Modal open = {openInfoModal} onClose = {() => setOpenInfoModal(false)}>
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
        }}>
        <Typography variant="h6" component="h2" fontWeight='600'>
            {t("How to use:")}
            </Typography>
            <Typography sx={{ mt: 2 }}>
            {t("1. Use the top left button to add items. You can either take a picture with your device's camera or upload an image from your device (make sure the render size is set to small). If you don't have access to the equipment right now, or you would like to manually enter or edit the AI's prediction, you can also directly type the name of the equipment.")}
            </Typography>
            <Typography sx = {{mt: 2}}>
            {t("2. After adding a piece of equipment, you can adjust the quantity using the '-' and '+' icons under the item name. Set a quantity to 0 to delete an item.")}
            </Typography>
            <Typography sx = {{mt: 2}}>
            {t("3. Use the search bar to find specific equipment by name.")}
            </Typography>
            <Typography sx = {{mt: 2}}>
            {t("4. Sign in using the top right button to create an account or sign in.")}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button 
            variant="outlined"
            onClick={() => {
                setOpenInfoModal(false)
            }}
            sx={{
                mt: 2,
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
        </Box>
    </Modal>
);

export default InfoModal;
