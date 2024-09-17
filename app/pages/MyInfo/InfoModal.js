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
            {t("1. Use the top left button to select your language.")}
            </Typography>
            <Typography sx = {{mt: 2}}>
            {t("2. Answer the questions about your gender, age, weight, height, goals, activity level, health issues, and workout days.")}
            </Typography>
            <Typography sx = {{mt: 2}}>
            {t("3. After completing the steps, review your infornmation. The top left button will change to an EDIT button. You can still change your system language in the trainerGPT page.")}
            </Typography>
            <Typography sx = {{mt: 2}}>
            {t("4. After filling out your information, add an optional profile photo with the Add Photo button.")}
            </Typography>
            <Typography sx = {{mt: 2}}>
            {t("5. Sign in using the top right button to create an account or sign in.")}
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
