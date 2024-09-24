import { Modal, Box, Button, Typography, Stack } from "@mui/material";
import ReactMarkdown from 'react-markdown';

const WorkoutModal = ({ openWorkoutModal, setOpenWorkoutModal, handleEditOrSaveWorkout, isEditingWorkout, setIsEditingWorkout, renderEditExercise, allEvents, selectedWorkout, customComponents, setValue, isMobile, upcomingWorkouts, completedWorkouts, setCompletedWorkouts,selectedSkill, t }) => (
  
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
        {console.log(selectedWorkout)}
        {console.log(completedWorkouts)}
        {selectedSkill === 0 && 
            <Stack flexDirection={"row"} gap = {1}>
            {console.log(upcomingWorkouts)}
            <Button
                onClick={()=>(setValue(2))}
                sx={{
                    height: "55px",
                    fontSize: '1rem',
                    backgroundColor: 'background.default',
                    color: 'text.primary',
                    border: 1,
                    borderColor: 'text.primary',
                    borderRadius: 2.5,
                    '&:hover': {
                    backgroundColor: 'text.primary',
                    color: 'background.default',
                    borderColor: 'text.primary',
                    },
                }}
                >
                    Talk to Trainer
                </Button>
            <Button
                onClick={()=>(
                    setCompletedWorkouts([...completedWorkouts, upcomingWorkouts[selectedWorkout]]),
                    setOpenWorkoutModal(false)
                )}
                sx={{
                    height: "55px",
                    fontSize: '1rem',
                    backgroundColor: 'background.default',
                    color: 'text.primary',
                    border: 1,
                    borderColor: 'text.primary',
                    borderRadius: 2.5,
                    '&:hover': {
                    backgroundColor: 'text.primary',
                    color: 'background.default',
                    borderColor: 'text.primary',
                    },
                }}
                >
                    Mark as Completed
                </Button>
                <Button
                onClick={handleEditOrSaveWorkout}
                sx={{
                    height: "55px",
                    fontSize: '1rem',
                    backgroundColor: 'background.default',
                    color: 'text.primary',
                    border: 1,
                    borderColor: 'text.primary',
                    borderRadius: 2.5,
                    '&:hover': {
                    backgroundColor: 'text.primary',
                    color: 'background.default',
                    borderColor: 'text.primary',
                    },
                }}
                >
                {isEditingWorkout ? t("Save") : t("Edit")}
                </Button>
        </Stack>}
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
      {console.log(selectedSkill === 0)}
      {selectedSkill === 0 ? (
        
        <>
        {console.log("upcoming")}
        <Box sx={{ paddingX: 2, overflow: "auto", paddingBottom: "60px" }}>
        <Box width="100%" height="75px" display="flex" justifyContent="center">
          <Typography sx={{ fontWeight: 700, fontSize: "2rem" }}>
            {upcomingWorkouts[selectedWorkout]?.title.split(":")[1]}
          </Typography>
        </Box>
        {isEditingWorkout ? (
          <Box>
            {renderEditExercise(selectedWorkout, upcomingWorkouts[selectedWorkout]?.extendedProps?.details)}
          </Box>
        ) : (
          <ReactMarkdown components={customComponents}>
            {upcomingWorkouts[selectedWorkout]?.extendedProps?.details}
          </ReactMarkdown>
        )}
      </Box>
        </>
        ) : 
        (<>
        <Box sx={{ paddingX: 2, overflow: "auto", paddingBottom: "60px" }}>
        <Box width="100%" height="75px" display="flex" justifyContent="center">
          <Typography sx={{ fontWeight: 700, fontSize: "2rem" }}>
            {completedWorkouts[selectedWorkout]?.title.split(":")[1]}
          </Typography>
        </Box>
        {isEditingWorkout ? (
          <Box>
            {renderEditExercise(selectedWorkout, completedWorkouts[selectedWorkout]?.extendedProps?.details)}
          </Box>
        ) : (
          <ReactMarkdown components={customComponents}>
            {completedWorkouts[selectedWorkout]?.extendedProps?.details}
          </ReactMarkdown>
        )}
      </Box>
        </>

        ) }
      
    </Box>
  </Modal>
)

export default WorkoutModal;
