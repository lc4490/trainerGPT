import { Box, Typography, Button, Stack, keyframes } from "@mui/material";
import { useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// Define the pulse keyframe
const bounceX = keyframes`
 0% {
    transform: translateX(-10px);
  }
  50% {
    transform: translateX(-50px);
  }
  100% {
    transform: translateX(-10px);
  }
`;

const bounceY = keyframes`
  0% {
    transform: translateY(-5px);
  }
  50% {
    transform: translateY(5px);
  }
  100% {
    transform: translateY(-5px);
  }
`;

const HomePage = ({isMobile, user, plan, allEvents, handleWorkoutModal, isToday, handleCancelSubscription, hasPremiumAccess, upcomingWorkouts, completedWorkouts, selectedSkill, setSelectedSkill, t}) => (
    <Box
        height="100%"
        overflow="scroll"
        display="flex"
        flexDirection={"column"}
        marginLeft={2.5}
        marginTop = {2.5}
        paddingBottom={"100px"}
        // gap = {2.5}
        >
        <Typography
        sx={{
            fontSize: "2.5rem",
            fontWeight: "800",
            lineHeight: "1.2",
        }}>
            Welcome, {user  && user.fullName ? (user.fullName.split(" ")[0]) : ("Guest")}.
        </Typography>
        
        {plan ? (
            <Box>
            
                {allEvents.length > 0 ? (
                <Box>

                    {/* upcoming events */}
                    <Box padding={1}>
                        <Typography sx={{fontSize: "2rem", fontWeight: "300"}}>Upcoming</Typography>
                    </Box>
                    <Stack flexDirection="row" alignItems="flex-start" style={{ overflow: 'scroll' }}>
                        {upcomingWorkouts
                        .filter(event => 
                            new Date(event.start) >= new Date().setHours(0, 0, 0, 0) && // Ensure the event is in the future or today
                            event.backgroundColor !== "orange" // Exclude events with background color orange
                        )
                        .sort((a, b) => new Date(a.start) - new Date(b.start)) // Sort events by start date
                        .map(({ title, start }, index) => {
                            // Define an array of gradient backgrounds
                            const gradientBackgrounds = [
                                'linear-gradient(90deg, #224061 50%, #433B5F 100%)', 
                                'linear-gradient(90deg, #433B5F 50%, #6A385C 100%)', 
                                'linear-gradient(90deg, #6A385C 50%, #923258 100%)', 
                                'linear-gradient(90deg, #923258 25%, #BB2D55 100%)', 
                                'linear-gradient(270deg, #923258 25%, #BB2D55 100%)', 
                                'linear-gradient(270deg, #6A385C 50%, #923258 100%)', 
                                'linear-gradient(270deg, #433B5F 50%, #6A385C 100%)', 
                                'linear-gradient(270deg, #224061 50%, #433B5F 100%)',
                            ];
                            
                            const eventBackground = gradientBackgrounds[index % gradientBackgrounds.length]; // Cycle through the gradients

                            return (
                                <Button
                                    key={index}
                                    sx={{ color: "white", flexShrink: 0 }}
                                    onClick={() => (
                                        handleWorkoutModal(index),
                                        setSelectedSkill(0)
                                        )} // Ensure correct index is passed here
                                >
                                    <Box
                                        width={isMobile ? "150px" : "300px"}
                                        height={isMobile ? "150px" : "300px"}
                                        display="flex"
                                        flexDirection="column"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        padding={1}
                                        // paddingX={2.5}
                                        sx={{
                                            background: eventBackground, // Apply gradient background here
                                            borderRadius: '10px',
                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Stack width="100%">
                                            <Typography sx={{ fontSize: isMobile ? "0.7rem" : "1rem", textAlign: "end" }}>
                                                Scheduled for {isToday(start) ? 'Today' : new Date(start).toLocaleDateString('en-US', { weekday: 'long' })}
                                            </Typography>
                                        </Stack>
                                        <Typography sx={{ fontWeight: "900", textAlign: "center", fontSize: isMobile ? "1rem" : "2rem" }}>
                                            {title}
                                        </Typography>
                                    </Box>
                                </Button>
                            );
                        })}
                    </Stack>

                    <Box height={25}></Box>
                    

                    {/* completed events */}
                    <Box padding={1}>
                        <Typography sx={{fontSize: "2rem", fontWeight: "300"}}>Completed</Typography>
                    </Box>
                    <Stack flexDirection="row" alignItems="flex-start" style={{ overflow: 'scroll' }}>
                        {completedWorkouts
                        // Removed date filter as these are completed events
                        .sort((a, b) => new Date(a.start) - new Date(b.start)) // Sort events by start date
                        .map(({ title, start }, index) => {
                            // Define an array of gradient backgrounds
                            const gradientBackgrounds = [
                                'linear-gradient(90deg, #224061 50%, #433B5F 100%)', 
                                'linear-gradient(90deg, #433B5F 50%, #6A385C 100%)', 
                                'linear-gradient(90deg, #6A385C 50%, #923258 100%)', 
                                'linear-gradient(90deg, #923258 25%, #BB2D55 100%)', 
                                'linear-gradient(270deg, #923258 25%, #BB2D55 100%)', 
                                'linear-gradient(270deg, #6A385C 50%, #923258 100%)', 
                                'linear-gradient(270deg, #433B5F 50%, #6A385C 100%)', 
                                'linear-gradient(270deg, #224061 50%, #433B5F 100%)',
                            ];
                            
                            const eventBackground = gradientBackgrounds[index % gradientBackgrounds.length]; // Cycle through the gradients

                            return (
                                <Button
                                    key={index}
                                    sx={{ color: "white", flexShrink: 0 }}
                                    onClick={() => (
                                        handleWorkoutModal(index),
                                        setSelectedSkill(1)
                                    )} // Ensure correct index is passed here
                                >
                                    <Box
                                        width={isMobile ? "150px" : "300px"}
                                        height={isMobile ? "150px" : "300px"}
                                        display="flex"
                                        flexDirection="column"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        padding={1}
                                        sx={{
                                            background: "darkgray",
                                            borderRadius: '10px',
                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Stack width="100%">
                                            <Typography sx={{ fontSize: isMobile ? "0.7rem" : "1rem", textAlign: "end" }}>
                                                Completed {/* Mark as completed */}
                                            </Typography>
                                        </Stack>
                                        <Typography sx={{ fontWeight: "900", textAlign: "left", fontSize: isMobile ? "1rem" : "2rem" }}>
                                            {title.split(":")[1]}
                                        </Typography>
                                    </Box>
                                </Button>
                            );
                        })}
                    </Stack>
                </Box>
            
                ) : (
                <Typography sx = {{fontWeight: "300"}}>Now that you have a workout plan, go to the myPlanner page to create your schedule.</Typography>
                )}
            </Box>
        ):(
            <Typography sx = {{fontWeight: "300", padding: 1}}>Get started by asking trainerGPT for a workout plan!</Typography>
            
            )}
            {/* {plan && allEvents.length <= 0 && (
                isMobile ? (
                    <ArrowDownwardIcon sx = {{position: "absolute", left: "68.6%", bottom: "10%", animation: `${bounceY} 2s infinite`}} />
                ) : (
                    <ArrowBackIcon sx = {{position: "absolute", top: 270, animation: `${bounceX} 2s infinite`}} />
                )
            )}

            {!plan && allEvents.length <= 0 && (
                isMobile ? (
                    <ArrowDownwardIcon sx = {{position: "absolute", left: "47%", bottom: "10%", animation: `${bounceY} 2s infinite`}} />
                ) : (
                    <ArrowBackIcon sx = {{position: "absolute", top: 190, animation: `${bounceX} 2s infinite`}} />
                )
            )} */}
            
            {/* <ArrowBackIcon sx ={{position: "absolute", top: 350}}/> */}
            {hasPremiumAccess && <Box display = "flex"justifyContent={"end"}>
                <Button
                onClick={handleCancelSubscription}
                sx={{
                    justifyContent: "end",
                    right: "2%",
                    backgroundColor: 'red',
                    color: 'white',
                    borderColor: 'text.primary',
                    justifyContent: 'center',
                    '&:hover': {
                        backgroundColor: 'text.primary',
                        color: 'background.default',
                        borderColor: 'text.primary',
                    },
                }}
                >Cancel Subscription
                </Button>
            </Box>}
    </Box>
)
export default HomePage;