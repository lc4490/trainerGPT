import { Box, Button, Stack, Modal } from "@mui/material";
import Webcam from 'react-webcam';

const CameraModal = ({cameraOpen, setCameraOpen, captureImage, switchCamera, facingMode, webcamRef, t}) => (
    <Modal open={cameraOpen} onClose={() => setCameraOpen(false)}>
        <Box width="100%" height="100vh" backgroundColor="black">
        <Stack display="flex" justifyContent="center" alignItems="center" flexDirection="column" sx={{ transform: 'translate(0%,25%)' }}>
            <Box
            sx={{
                top: '50%',
                bgcolor: 'black',
                width: 350,
                height: 350,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingY: 2,
                position: 'relative'
            }}
            >
            <Box
                sx={{
                maxWidth: 350,
                aspectRatio: '1/1',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                backgroundColor: 'black',
                borderRadius: '16px',
                overflow: 'hidden',
                }}
            >
                <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                    facingMode: facingMode,
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                }}
                />
            </Box>
            </Box>
            <Stack flexDirection="row" gap={2} position="relative">
            <Button
                variant="outlined"
                onClick={captureImage}
                sx={{
                color: 'black',
                borderColor: 'white',
                backgroundColor: 'white',
                '&:hover': {
                    backgroundColor: 'white',
                    color: 'black',
                    borderColor: 'white',
                },
                marginTop: 1,
                }}
            >
                {t("Take Photo")}
            </Button>
            <Button
                onClick={switchCamera}
                sx={{
                color: 'black',
                borderColor: 'white',
                backgroundColor: 'white',
                '&:hover': {
                    backgroundColor: 'white',
                    color: 'black',
                    borderColor: 'white',
                },
                marginTop: 1,
                }}
            >
                {t("Switch Camera")}
            </Button>
            <Button
                variant="outlined"
                onClick={() => {
                setCameraOpen(false);
                }}
                sx={{
                color: 'black',
                borderColor: 'white',
                backgroundColor: 'white',
                '&:hover': {
                    backgroundColor: 'white',
                    color: 'black',
                    borderColor: 'white',
                },
                marginTop: 1,
                }}
            >
                {t('Exit')}
            </Button>
            </Stack>
        </Stack>
        </Box>
    </Modal>
);

export default CameraModal;