import { Box, CircularProgress, Typography } from '@mui/material';

const Loading = ({ t }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>{t('Loading...')}</Typography>
      </Box>
  );
};

export default Loading;
