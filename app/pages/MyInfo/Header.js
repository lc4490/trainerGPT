import { Box, Button, Typography, Divider } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { UserButton } from '@clerk/nextjs';

const Header = ({ isEditing, setEditModal, handleSignInClick, handleInfoModal, isSignedIn, isMobile, t }) => {
    return (
        <>
        {/* Header Box */}
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
            onClick={()=>{setEditModal(true)}}
            sx={{
                height: "55px",
                fontSize: '1rem',
                backgroundColor: 'background.default',
                color: 'text.primary',
                borderColor: 'background.default',
                '&:hover': {
                backgroundColor: 'text.primary',
                color: 'background.default',
                borderColor: 'text.primary',
                },
            }}
            >
            {isEditing ? t("Save") : t("Profile")}
            </Button>
            
            {/* Title */}
            <Box display="flex" flexDirection={"row"} alignItems={"center"} gap ={1}>
            <Typography variant="h6" color="text.primary" textAlign="center">
                {t('My Info')}
            </Typography>
            <Button 
            onClick={handleInfoModal}
            sx={{ 
                minWidth: "auto",  
                aspectRatio: "1 / 1", 
                borderRadius: "50%",
                width: "20px",  // or adjust as needed
                height: "20px"  // or adjust as needed
            }}>
                <InfoIcon sx={{ color: "lightgray" }}/>
            </Button>
            </Box>
            {/* SignIn/SignOut Form */}
            <Box >
            {!isSignedIn ? (
                <Button
                color="inherit"
                // href="/sign-in"
                onClick={handleSignInClick}
                sx={{
                    justifyContent: "end",
                    right: "2%",
                    backgroundColor: 'background.default',
                    justifyContent: 'center',
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
        {isMobile && (<Divider />)}
        </>
);
}

export default Header;
