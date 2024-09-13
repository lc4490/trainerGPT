// components/EquipmentPage/CameraModal.js
import { Box, Button, Modal, Stack } from '@mui/material';
import Webcam from 'react-webcam';

const CameraModal = ({ cameraOpen, setCameraOpen, captureImage, switchCamera, facingMode, webcamRef, t }) => (
    <Modal open={cameraOpen} onClose={() => setCameraOpen(false)}>
        <Box width="100vw" height="100vh" backgroundColor="black">
        <Stack display="flex" justifyContent="center" alignItems="center" flexDirection="column" sx={{ transform: 'translate(0%,25%)' }}>
            {/* camera display */}
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
                maxWidth: 350, // Optional: Limit the maximum width
                aspectRatio: '1/1', // Ensures the box is a square
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative', // Allows the button to be positioned over the video feed
                backgroundColor: 'black', // Background color for the box
                borderRadius: '16px', // Optional: adds rounded corners
                overflow: 'hidden', // Ensures the video doesn't overflow the container
                }}
            >
                {/* camera, flips if it is user camera, also covers instead of fit */}
                <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                    facingMode: facingMode,
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover', // Ensures the video covers the square without distortion
                    transform: facingMode === 'user' ? "scaleX(-1)" : "none"
                }}
                />
            </Box>
            </Box>
            {/* buttons */}
            <Stack flexDirection="row" gap={2} position="relative">
            {/* take photo */}
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
            {/* switch camera */}
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
            {/* exit */}
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
                {t("Exit")}
            </Button>
            </Stack>
        </Stack>
        </Box>
    </Modal>
);

export default CameraModal;
