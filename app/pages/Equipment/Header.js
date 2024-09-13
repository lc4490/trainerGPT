import { Box, Button, Typography, Divider } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { UserButton } from '@clerk/nextjs';

const Header = ({ handleOpenAddAndOpenCamera, handleSignInClick, handleInfoModal, isSignedIn, t }) => {
    return (
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
        '&:hover': {
          backgroundColor: 'text.primary',
          color: 'background.default',
          borderColor: 'text.primary',
        },
      }}
    >
      <Typography variant="h5">+</Typography>
    </Button>

    <Box display="flex" flexDirection={"row"} alignItems={"center"} gap={1}>
      <Typography variant="h6" color="text.primary" textAlign="center">
        {t("myEquipment")}
      </Typography>
      <Button 
        onClick={handleInfoModal}
        sx={{
          minWidth: "auto",  
          aspectRatio: "1 / 1", 
          borderRadius: "50%",
          width: "20px",
          height: "20px"
        }}
      >
        <InfoIcon sx={{ color: "lightgray" }}/>
      </Button>
    </Box>

    <Box>
      {!isSignedIn ? (
        <Button 
          color="inherit"
          onClick={handleSignInClick}
          sx={{
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
  </>
);
}

export default Header;
