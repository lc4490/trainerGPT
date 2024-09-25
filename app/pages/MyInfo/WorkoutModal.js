import { Modal, Box, Button, Typography, Stack } from "@mui/material";
import ReactMarkdown from 'react-markdown';

const WorkoutModal = ({ openWorkoutModal, setOpenWorkoutModal, handleEditOrSaveWorkout, isEditingWorkout, setIsEditingWorkout, renderEditExercise, allEvents, selectedWorkout, customComponents, setValue, isMobile, upcomingWorkouts, completedWorkouts, setCompletedWorkouts,selectedSkill, setCongratsModal, t }) => (
  
  <Modal open={openWorkoutModal} 
  onClose={() => {
    setOpenWorkoutModal(false)
    setIsEditingWorkout(false)
  }}>
    <Box display="flex" alignItems="center" justifyContent={"center"}>
      <Box
        sx={{
          width: isMobile ? "100vw" : "500px", // Same width as MyInfoPage
          height: "100vh", // Full height
          bgcolor: 'background.default',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          // alignItems: 'center',
          // padding: 2,
          paddingBottom: isMobile ? "100px" : "0px"
        }}
      >
        {/* top banner */}
        <Box 
        width="100%" 
        minHeight="200px"
        // display="flex" 
        // justifyContent="center"
        sx = {{
          backgroundImage: `url(${ "/gym_dark.jpg"})`,
          backgroundSize: '160%', // Stretch the image to cover the entire Box
          backgroundPosition: 'center', // Center the image in the Box
          backgroundRepeat: 'no-repeat', // Prevent the image from repeating
          width:"100%",
          // height: "120px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: 'center',
          flexDirection: 'column',
          color: "white",
        }}>
            <Box  width = "100%" display="flex" justifyContent="end">
              <Button
                onClick={() => { setOpenWorkoutModal(false); }}
                disabled={isEditingWorkout}
                sx={{
                  // height: "55px",
                  fontSize: '1rem',
                  // backgroundColor: 'background.default',
                  color: 'text.primary',
                  borderColor: 'background.default',
                  // borderRadius: '50px',
                  '&:hover': {
                    // backgroundColor: 'background.default',
                    color: 'text.primary',
                    borderColor: 'background.default',
                  },
                }}
              >
                <Typography sx={{ fontSize: "1.1rem" }}>X</Typography>
              </Button>
            </Box>
            {selectedSkill === 0 &&
            <Typography sx={{ fontWeight: 700, fontSize: "3rem", textAlign: "center", color: "white" }}>
              {upcomingWorkouts[selectedWorkout]?.title.split(":")[1]}
            </Typography>
            }
            {selectedSkill === 1 &&
            <Typography sx={{ fontWeight: 700, fontSize: "3rem", textAlign: "center", color: "white" }}>
              {completedWorkouts[selectedWorkout]?.title.split(":")[1]}
            </Typography>
            }
        </Box>

        {/* top buttons */}
        {selectedSkill === 0 && 
        <Box width="100%" display="flex" justifyContent={"space-between"} alignItems="center" paddingY={1}>
            <Stack flexDirection={"row"} gap = {1} paddingX = {isMobile ? 0 : 2} justifyContent={"space-between"} width="100%">
            {console.log(upcomingWorkouts)}
              <Button
                  onClick={()=>(setValue(2))}
                  sx={{
                      height: "55px",
                      fontSize: isMobile ? '0.75rem' : '1rem',
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
                      setCongratsModal(true),
                      setOpenWorkoutModal(false)
                  )}
                  sx={{
                      height: "55px",
                      fontSize: isMobile ? '0.75rem' : '1rem',
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
                  fontSize: isMobile ? '0.9rem' : '1rem',
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
            </Stack>   
        </Box>
        }

        {/* workout content */}
        {selectedSkill === 0 &&
          <Box padding={isMobile ? 2.5 : 5}>
          
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
        }
        {selectedSkill === 1 &&
          <Box padding={isMobile ? 2.5 : 5}>
          
          {isEditingWorkout ? (
            <Box>
              {renderEditExercise(completedWorkouts, completedWorkouts[selectedWorkout]?.extendedProps?.details)}
            </Box>
          ) : (
            <ReactMarkdown components={customComponents}>
              {completedWorkouts[selectedWorkout]?.extendedProps?.details}
            </ReactMarkdown>
          )}
        </Box>
        }
        
      </Box>
    </Box>
  </Modal>
)

export default WorkoutModal;
