import { Modal, Box, Button, Typography } from "@mui/material";
import ReactMarkdown from 'react-markdown';

const WorkoutModal = ({ openWorkoutModal, setOpenWorkoutModal, handleEditOrSaveWorkout, isEditingWorkout, setIsEditingWorkout, renderEditExercise, allEvents, selectedWorkout, customComponents, isMobile, t }) => (
  <Modal open={openWorkoutModal} 
  onClose={() => {
    setOpenWorkoutModal(false)
    setIsEditingWorkout(false)
  }}>
    <Box
      sx={{
        position: 'absolute',
        right: 0, // Align to the right side of the screen
        top: 0,
        width: isMobile ? "100vw" : "calc(100vw - 90px)", // Same width as MyInfoPage
        height: "100vh", // Full height
        bgcolor: 'background.default',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: 2,
      }}
    >
      <Box width="100%" display="flex" justifyContent={"space-between"} alignItems="center" padding={1}>
        <Button
          onClick={handleEditOrSaveWorkout}
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
          {isEditingWorkout ? t("Save") : t("Edit")}
        </Button>
        <Button
          onClick={() => { setOpenWorkoutModal(false); }}
          disabled={isEditingWorkout}
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
      <Box sx={{ paddingX: 2, overflow: "auto", paddingBottom: "60px" }}>
        <Box width="100%" height="75px" display="flex" justifyContent="center">
          <Typography sx={{ fontWeight: 700, fontSize: "2rem" }}>
            {allEvents[selectedWorkout]?.title.split(":")[1]}
          </Typography>
        </Box>
        {isEditingWorkout ? (
          <Box>
            {renderEditExercise(selectedWorkout, allEvents[selectedWorkout]?.extendedProps?.details)}
          </Box>
        ) : (
          <ReactMarkdown components={customComponents}>
            {allEvents[selectedWorkout]?.extendedProps?.details}
          </ReactMarkdown>
        )}
      </Box>
    </Box>
  </Modal>
);

export default WorkoutModal;
