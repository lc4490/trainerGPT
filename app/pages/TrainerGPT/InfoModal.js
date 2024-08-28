import { Box, Button, Modal, Typography } from '@mui/material';

const InfoModal = ({ t, openInfoModal, setOpenInfoModal }) => {
  return (
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
          {t("1. After filling out your information in the MyInfo page and entering your available equipment in the equipment page, trainerGPT is all ready to help you reach your fitness goals!")}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          {t("2. You can further elaborate on more specific goals with trainerGPT. Try to treat it how you would treat any other personal trainer.")}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          {t("3. When you are ready, ask trainerGPT to craft you a custom workout plan. You can tell trainerGPT to further modify the program to your liking. (If it gets cut off due to internet issues, just tell it to continue).")}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          {t("4. If you have questions about specific exercises, you can also ask trainerGPT how to do specific exercises.")}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          {t("5. Sign in using the top right button to create an account or sign in.")}
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
};

export default InfoModal;
