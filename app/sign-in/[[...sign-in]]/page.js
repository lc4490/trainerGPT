import { SignIn } from '@clerk/nextjs'
import {AppBar, Container, Toolbar, Typography, Button, Link, Box} from '@mui/material'
// light/dark mode
import { createTheme } from '@mui/material';

export default function SignUpPage(){
    return <Box width="100vw" height="100vh" display="flex" justifyContent="center" alignItems="center">
        {/* sign in button */}
        <Box
        display = "flex"
        flexDirection="column"
        justifyContent = "center"
        alignItems="center"
        >
            <Typography variant = "h4">
                Sign In
            </Typography>
            <SignIn />
        </Box>
    </Box>
}