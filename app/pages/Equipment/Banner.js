import { Box, Typography } from '@mui/material';

const Banner = ({ isMobile, prefersDarkMode, t }) => {
    return (
    <>
    {/* Banner image */}
    {/* if mobile */}
    {isMobile ? (
        <Box sx={{
        backgroundImage: `url(${prefersDarkMode ? "/gym_dark.jpg" : "/gym_dark.jpg"})`,
        backgroundSize: '160%', // Stretch the image to cover the entire Box
        backgroundPosition: 'center', // Center the image in the Box
        backgroundRepeat: 'no-repeat', // Prevent the image from repeating
        width:"100%",
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
        // if desktop
        <Box sx={{
        backgroundImage: `url(${prefersDarkMode ? "/gym_dark.jpg" : "/gym_dark.jpg"})`,
        backgroundSize: '200%', // Stretch the image to cover the entire Box
        backgroundPosition: 'left', // Center the image in the Box
        backgroundRepeat: 'no-repeat', // Prevent the image from repeating
        width:"100%",
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
}

export default Banner;
