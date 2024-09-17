import { Box, Button, Typography, Grid, Modal } from '@mui/material';
import Image from 'next/image';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const EditPage = ({ editModal, setEditModal, handleEditOrSave, orderedKeys, renderEditField, image, setCameraOpen, facingMode, user, formData, isEditing, setIsEditing, isMobile, t }) => (
    <Modal open={editModal} 
    onClose={() => {
        setEditModal(false); 
        setIsEditing(false); // Reset isEditing to false when modal closes
    }}>
        <Box
        sx={{
            position: 'absolute', // Ensure the modal is positioned correctly
            right: 0, // Align the modal to the right side of the screen
            top: 0, // Align it to the top
            width: isMobile ? '100vw' : 'calc(100vw - 90px)', // Same width as MyInfoPage
            height: '100vh', // Full height
            bgcolor: 'background.default',
            color: 'text.primary',
            overflowY: 'auto', // Scroll if content overflows
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: 2,
        }}
        >
            <Box width="100%" display="flex" justifyContent="space-between" alignItems="center" padding={1}>
                <Button
                    onClick={handleEditOrSave}
                    sx={{
                        height: "55px",
                        fontSize: '1rem',
                        backgroundColor: 'background.default',
                        color: 'text.primary',
                        border: 1,
                        borderColor: 'text.primary',
                        '&:hover': {
                            backgroundColor: 'text.primary',
                            color: 'background.default',
                            borderColor: 'text.primary',
                        },
                    }}
                >
                    {isEditing ? t("Save") : t("Edit")}
                </Button>

                <Button 
                    onClick={() => setEditModal(false)}
                    disabled={isEditing}
                    sx={{
                        height: "55px",
                        fontSize: '1rem',
                        backgroundColor: 'background.default',
                        color: 'text.primary',
                        borderColor: 'background.default',
                        borderRadius: '50px',
                        '&:hover': {
                            backgroundColor: 'background.default',
                            color: 'text.primary',
                            borderColor: 'background.default',
                        },
                    }}
                >
                    <Typography sx={{ fontSize: "1.1rem" }}>X</Typography>
                </Button>
            </Box>

            <Box width="100%" height="90%" display="flex" flexDirection="column" p={2.5} gap={2.5} alignItems="center" overflow="auto">
                {/* Show image or placeholder */}
                <Box style={{ position: 'relative', display: 'inline-block' }}>
                    {image ? (
                        <Image
                            src={image}
                            alt={t("image")}
                            width={isMobile ? 200 : 300}
                            height={isMobile ? 200 : 300}
                            style={{
                                borderRadius: "9999px",
                                objectFit: 'cover',
                                transform: facingMode === 'user' ? "scaleX(-1)" : "none",
                                aspectRatio: "1/1",
                            }}
                        />
                    ) : (
                        <Image
                            src="/profile.jpg"
                            alt={t("banner")}
                            width={isMobile ? 200 : 300}
                            height={isMobile ? 200 : 300}
                            style={{
                                borderRadius: "9999px",
                                width: 'auto',
                                height: 'auto',
                            }}
                        />
                    )}

                    {/* Button positioned in the top right */}
                    <Button
                        onClick={() => setCameraOpen(true)}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            zIndex: 1, // Ensure the button stays above the image
                            backgroundColor: 'text.primary',
                            color: 'background.default',
                            borderColor: 'background.default',
                            borderRadius: '9999px',
                            aspectRatio: 1,
                            '&:hover': {
                                backgroundColor: 'background.default',
                                color: 'text.primary',
                                borderColor: 'text.primary',
                            },
                        }}
                    >
                        {image ? (<EditIcon />) : (<AddIcon />)}
                    </Button>
                </Box>

                <Typography sx={{ fontSize: "2.5rem", fontWeight: "700", lineHeight: "1.2" }}>
                    {user ? user.fullName : t("Guest")}
                </Typography>

                {/* Display content summary */}
                <Grid container sx={{ justifyContent: 'center', width: "90vw", paddingX: 3, paddingBottom: "60px" }}>
                    <Box width="100%" justifyContent="left" paddingY={2.5}>
                        <Typography sx={{ fontSize: "1.25rem", fontWeight: "300" }}>Info</Typography>
                    </Box>
                    {orderedKeys.map((key) => (
                        <Grid 
                            item 
                            xs={isEditing ? 12 : 6} 
                            sm={6} 
                            md={3} 
                            key={key}
                            sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center',
                                padding: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                backgroundColor: 'background.paper',
                                boxShadow: 3,
                            }}
                        >
                            <Typography variant="h6" align="center" sx={{ marginBottom: 1, color: 'text.primary' }}>
                                {t(key)}
                            </Typography>
                            {isEditing ? (
                                <Box sx={{ width: '100%' }}>
                                    {renderEditField(key, formData[key])}
                                </Box>
                            ) : (
                                <Typography variant="body1" color="textSecondary" align="center" sx={{ fontSize: '1rem', fontWeight: 500, color: 'text.secondary' }}>
                                    {key === 'Availability' ? `${formData[key]} ${t("days")}` : formData[key]}
                                </Typography>
                            )}
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    </Modal>
);

export default EditPage;
