import { Box, Button, Typography, Grid, Modal, Stack } from '@mui/material';
import Image from 'next/image';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const EditPage = ({ editModal, setEditModal, handleEditOrSave, orderedKeys, renderEditField, image, setCameraOpen, facingMode, user, formData, isEditing, isMobile, t}) => (
    <Modal open = {editModal} onClose = {() => setEditModal(false)}>
        <Box
        sx={{
            maxHeight: '100vh',
            // width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            bgcolor: 'background.default',
            color: 'text.primary',
            overflow: 'auto',
        }}
        >
            <Box
            sx={{width: '100%', height: '100%', overflowY: 'scroll'}}
            >
                 <Box width = "100%" display = "flex" justifyContent={"space-between"} alignItems = "center" padding = {1}>
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
                    onClick={()=>{setEditModal(false)}}
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
                        <Typography sx = {{fontSize: "1.1rem"}}>X</Typography>
                    </Button>
                </Box>
            

                <Box
                    width="100%"
                    height="90%"
                    display="flex"
                    flexDirection="column"
                    // justifyContent={"center"}
                    p= {2.5}
                    gap = {2.5}
                    alignItems="center"
                    overflow={"scroll"}
                    
                >
                    {/* show image or placeholder */}
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
                    <Typography sx = {{fontSize: "2.5rem", fontWeight: "700", lineHeight: "1.2",}}>{user ? user.fullName : t("Guest")}</Typography>
                    

                    {/* display content summary */}
                    <Grid 
                    container 
                    // spacing={4} // Increase spacing between grid items for better separation
                    sx={{ 
                        justifyContent: 'center', // Center items horizontally
                        width: "90vw", 
                        overflow: 'auto', // Allow scrolling if content overflows
                        paddingX: 3, // Add padding around the grid container
                        paddingBottom: "60px", // Add space for the toolbar
                    }}
                    >
                    <Box width = "100%" justifyContent={"left"} paddingY={2.5}><Typography sx = {{fontSize: "1.25rem", fontWeight: "300"}}>Info</Typography></Box>
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
                            alignItems: 'center', // Center content within each grid item
                            padding: 2, // Add padding inside each grid item for better spacing
                            border: '1px solid', // Add a border to each item for a card-like appearance
                            borderColor: 'divider', // Use theme divider color for border
                            borderRadius: 2, // Round the corners for a smoother look
                            backgroundColor: 'background.paper', // Use the paper background color
                            boxShadow: 3, // Add a subtle shadow for depth
                        }}
                        >
                        <Typography 
                            variant="h6" 
                            align="center" 
                            sx={{ 
                            marginBottom: 1, 
                            color: 'text.primary', // Ensure the text color matches the theme
                            }}
                        >
                            {t(key)}
                        </Typography>
                        {isEditing ? (
                            <Box sx={{ width: '100%' }}>
                            {renderEditField(key, formData[key])}
                            </Box>
                        ) : (
                            <Typography 
                            variant="body1" 
                            color="textSecondary" 
                            align="center" 
                            sx={{ 
                                fontSize: '1rem', 
                                fontWeight: 500, 
                                color: 'text.secondary', // Subtle color for secondary text
                            }}
                            >
                            {key === 'Availability' ? `${formData[key]} ${t("days")}` : formData[key]}
                            </Typography>
                        )}
                        </Grid>
                    ))}
                    </Grid>
                </Box>
            </Box>
        </Box>
    </Modal>
)
export default EditPage;