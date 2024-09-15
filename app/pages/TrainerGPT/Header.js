import { Box, Button, FormControl, MenuItem, Select, Typography, Divider } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { UserButton } from '@clerk/nextjs';

const Header = ({ t, prefLanguage, handleLanguageChange, isSignedIn, handleSignInClick, handleInfoModal, isMobile }) => {
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
    <FormControl 
        id="language-button" 
        sx={{ 
        width: isMobile ? '100px' : '100px',
        minWidth: '100px',
        }}
    >
        <Select
        value={prefLanguage}
        onChange={handleLanguageChange}
        disableunderline="true"
        displayEmpty
        renderValue={(selected) => {
            if (!selected) {
            return <span>{t('English')}</span>;
            }
            const selectedItem = {
            en: 'English',
            cn: '中文（简体）',
            tc: '中文（繁體）',
            es: 'Español',
            fr: 'Français',
            de: 'Deutsch',
            jp: '日本語',
            kr: '한국어'
            }[selected];
            return <span>{selectedItem}</span>;
        }}
        sx={{
            '& .MuiSelect-select': {
            paddingTop: '10px',
            paddingBottom: '10px',
            },
            '& .MuiSelect-icon': {
            color: 'text.primary',
            },
        }}
        >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="cn">中文（简体）</MenuItem>
        <MenuItem value="tc">中文（繁體）</MenuItem>
        <MenuItem value="es">Español</MenuItem>
        <MenuItem value="fr">Français</MenuItem>
        <MenuItem value="de">Deutsch</MenuItem>
        <MenuItem value="jp">日本語</MenuItem>
        <MenuItem value="kr">한국어</MenuItem>
        </Select>
    </FormControl>

    <Box display="flex" flexDirection={"row"} alignItems={"center"} gap={1}>
        <Typography variant="h6" color="text.primary" textAlign="center">
        {t('trainerGPT')}
        </Typography>
        <Button 
        id={"info-icon"}
        onClick={handleInfoModal}
        sx={{ 
            minWidth: "auto",  
            aspectRatio: "1 / 1", 
            borderRadius: "50%",
            width: "20px",
            height: "20px"
        }}>
            <InfoIcon sx={{ color: "lightgray" }}/>
        </Button>
    </Box>

    <Box id={"auth-button"}>
        {!isSignedIn ? (
        <Button 
            color="inherit"
            onClick={handleSignInClick}
            sx={{
            justifyContent: "end",
            right: "2%",
            backgroundColor: 'background.default',
            color: 'text.primary',
            borderColor: 'text.primary',
            justifyContent: 'center',
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
};

export default Header;
