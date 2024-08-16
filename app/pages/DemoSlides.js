import { useState, useEffect } from 'react';
import { Box, Typography, Button, useMediaQuery } from '@mui/material';
import Image from 'next/image'; // Adjust based on your setup
import { useTranslation } from 'react-i18next';
import { createTheme } from '@mui/material';

const demoSlides = [
  { title: 'Welcome to the App', content: 'Get ready to improve your fitness with personalized plans.', image: '/slide1.png' },
  { title: 'Track Your Progress', content: 'Monitor your workouts, diet, and progress over time.', image: '/slide2.png' },
  { title: 'Achieve Your Goals', content: 'Set and achieve your fitness goals with our guided plans.', image: '/slide3.png' },
];
// light/dark themes
const lightTheme = createTheme({
    palette: {
      mode: 'light',
      background: {
        default: '#ffffff',
        paper: '#ffffff',
        bubbles: 'lightgray',
        userBubble: '#95EC69',
        link: 'darkblue'
      },
      text: {
        primary: '#000000',
      },
    },
  });
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#121212',
        paper: '#121212',
        bubbles: '#2C2C2C',
        userBubble: '#29B560',
        link: 'lightblue',
      },
      text: {
        primary: '#ffffff',
      },
    },
  });

const DemoSlides = ({ onFinish }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useTranslation();

  const nextSlide = () => {
    if (currentSlide < demoSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onFinish(); // End the demo and proceed to the main content
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
    // Implementing theming
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useState(prefersDarkMode);
    useEffect(() => {
    setDarkMode(prefersDarkMode);
    }, [prefersDarkMode]);
    const theme = darkMode ? darkTheme : lightTheme;

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="background.default"
      color="text.primary"
      padding={2}
    >
      <Typography variant="h4" gutterBottom>
        {t(demoSlides[currentSlide].title)}
      </Typography>
      <Typography variant="body1" textAlign="center" mb={2}>
        {t(demoSlides[currentSlide].content)}
      </Typography>
      <Image
        src={demoSlides[currentSlide].image}
        alt={t(demoSlides[currentSlide].title)}
        width={400}
        height={300}
        style={{ borderRadius: "10px", width: isMobile ? '100%' : '50%', height: 'auto'}}
      />
      <Box display="flex" justifyContent="space-between" mt={4} width="100%">
        <Button
          variant="contained"
          onClick={prevSlide}
          disabled={currentSlide === 0}
        >
          {t('Back')}
        </Button>
        <Button
          variant="contained"
          onClick={nextSlide}
        >
          {currentSlide === demoSlides.length - 1 ? t('Finish') : t('Next')}
        </Button>
      </Box>
    </Box>
  );
};

export default DemoSlides;
