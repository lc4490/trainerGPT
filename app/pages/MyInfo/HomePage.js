import { Box, Typography, Button, Stack, keyframes } from "@mui/material";
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

const HomePage = ({isMobile, user, plan, allEvents, handleWorkoutModal, isToday, t}) => (
    <Box
        display="flex"
        flexDirection={"column"}
        paddingX = {isMobile ? 2.5 : 5}
        marginTop = {2.5}
        // gap = {2.5}
        >
        <Typography
        sx={{
            fontSize: "2.5rem",
            fontWeight: "700",
            lineHeight: "1.2",
        }}>
            Welcome, {user  && user.fullName ? (user.fullName.split(" ")[0]) : ("Guest")}.
        </Typography>
        
        {plan ? (
            <Box>
            
                {allEvents.length > 0 ? (
                <Box>
                <Typography
                    sx ={{
                    padding: 1,
                    fontSize: "1.25rem",
                    fontWeight: "300"
                    }}
                    >Upcoming workouts:
                    </Typography>
                    <Stack flexDirection="row" alignItems="flex-start" style={{ overflow: 'scroll' }}>
                    {allEvents
                    .filter(event => new Date(event.start) >= new Date().setHours(0, 0, 0, 0) && event.backgroundColor !== "orange")
                    .sort((a, b) => new Date(a.start) - new Date(b.start))
                    .map(({title, start}, index)=> (
                        <Button
                        key={index} 
                        sx={{ color: "text.primary", flexShrink: 0 }}
                        onClick={() => handleWorkoutModal(index)}
                        >
                        <Box
                            width = {isMobile ? "150px" : "300px"}
                            height = {isMobile ? "150px" : "300px"}
                            display="flex"
                            flexDirection="column"
                            justifyContent="space-between"
                            alignItems="center"
                            bgcolor="background.bubbles"
                            padding={1}
                            sx={{
                            // width: '275px',
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
                            <Typography sx = {{fontWeight: "900", textAlign: "left", fontSize: isMobile ? "1rem" : "2rem"}}>{title.split(":")[1]}</Typography>
                            
                        </Box>
                        </Button>
                    ))}
                    </Stack>
                    </Box>
                ) : (
                <Typography sx = {{fontWeight: "300"}}>Now that you have a workout plan, go to the myPlanner page to create your schedule.</Typography>
                )}
            </Box>
        ):(
            <Typography sx = {{fontWeight: "300", padding: 1}}>Get started by asking trainerGPT for a workout plan!</Typography>
            
            )}
            {plan && allEvents.length <= 0 && (
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
            )}
            
            {/* <ArrowBackIcon sx ={{position: "absolute", top: 350}}/> */}
        </Box>
)
export default HomePage;