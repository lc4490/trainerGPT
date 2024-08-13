import { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import { Container, Box, Typography, Button, TextField, ToggleButtonGroup, ToggleButton, CircularProgress } from '@mui/material';
// Firebase imports
import { firestore, auth, provider, signInWithPopup, signOut } from '../firebase';
import { collection, getDocs, query, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
// Translations
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // Adjust the path as necessary

const steps = [
  { title: 'Tell Us About Yourself', content: 'Select your gender', options: ['Male', 'Female'] },
  { title: 'How Old Are You?', content: 'Age is important', inputType: 'number' },
  { title: 'What is Your Weight?', content: 'Enter your weight', inputType: 'number' },
  { title: 'What is Your Height?', content: 'Enter your height', inputType: 'number' },
  { title: 'What is Your Goal?', content: 'Select your goal', options: ['Get Fitter', 'Gain Weight', 'Lose Weight', 'Building Muscles', 'Improving Endurance'] },
  { title: 'Physical Activity Level?', content: 'Select your activity level', options: ['Beginner', 'Intermediate', 'Advanced'] },
];

const MyInfoPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSummary, setIsSummary] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  // Save user form data to Firestore
  const saveUserData = async (data) => {
    if (auth.currentUser) {
      const userUID = auth.currentUser.uid;
      const userDocRef = doc(firestore, 'users', userUID);
      await setDoc(userDocRef, { userData: data }, { merge: true });
    }
  };

  // Handle form submission and save data to Firestore
  const handleSubmit = async () => {
    await saveUserData(formData);  // Save form data to Firestore
    handleSignIn();
    setIsSummary(true);            // Show summary page
  };

  // Retrieve user data from Firestore
  const getUserData = async () => {
    if (auth.currentUser) {
      const userUID = auth.currentUser.uid;
      const userDocRef = doc(firestore, 'users', userUID);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().userData : null;
    }
    return null;
  };

  // Google Auth
  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User signed in:', user);
      setGuestMode(false); // Disable guest mode on successful sign-in
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Sign in failed: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
      setUser(null);
      setGuestMode(true); // Enable guest mode on sign-out
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Sign out failed: ' + error.message);
    }
  };

  // Set User
  const [user, setUser] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [name, setName] = useState(null);

  // Check at all times who the user is
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setName(user.displayName);
        setGuestMode(false);
        const data = await getUserData();
        if (data) {
          setFormData(data);  // Set form data from Firestore if available
          setIsSummary(true);
        }
      } else {
        setUser(null);
        setName("Guest");
        setGuestMode(true);
      }
      setLoading(false); // Stop loading when user check is done
    });
    return () => unsubscribe();
  }, []);

  // Implementing multi-languages
  const { t, i18n } = useTranslation();

  // set preferred language locally
  const [prefLanguage, setPrefLanguage] = useState('');

  const getPreferredLanguage = async () => {
    if (auth.currentUser) {
      const userUID = auth.currentUser.uid;
      const userDocRef = doc(firestore, 'users', userUID);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists() ? userDoc.data().preferredLanguage : null;
    }
    return null;
  };

  // fetch/set languages at all times
  useEffect(() => {
    const fetchAndSetLanguage = async () => {
      const preferredLanguage = await getPreferredLanguage();
      if (preferredLanguage) {
        setPrefLanguage(preferredLanguage)
        i18n.changeLanguage(preferredLanguage);
      }
      console.log(preferredLanguage)
    };

    fetchAndSetLanguage();
  }, []);

  // Display a loading spinner while the app is initializing
  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box 
          sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            bgcolor: 'background.default',
            color: 'text.primary'
          }}
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexDirection: 'column', 
          bgcolor: 'background.default',
          color: 'text.primary'
        }}
      >
        {isSummary ? (
          <Box>
            <Typography variant="h4" gutterBottom>{t("Summary")}</Typography>
            {Object.entries(formData).map(([key, value]) => (
              <Box key={key} sx={{ mb: 2 }}>
                <Typography variant="h6">{key}</Typography>
                <Typography variant="body1" color="textSecondary">{value || 'N/A'}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 50 }}
              animate={currentStep === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
              style={{ display: currentStep === index ? 'block' : 'none', width: '100%' }}
            >
              <Typography variant="h4" gutterBottom>{step.title}</Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>{step.content}</Typography>

              {step.options && (
                <ToggleButtonGroup
                  exclusive
                  value={formData[step.title] || ''}
                  onChange={(e, value) => handleInputChange(step.title, value)}
                  sx={{ mb: 4 }}
                >
                  {step.options.map((option) => (
                    <ToggleButton key={option} value={option}>
                      {option}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              )}

              {step.inputType && (
                <TextField
                  type={step.inputType}
                  fullWidth
                  variant="outlined"
                  onChange={(e) => handleInputChange(step.title, e.target.value)}
                  sx={{ mb: 4 }}
                />
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
                >
                  {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </motion.div>
          ))
        )}
      </Box>
    </Container>
  );
}

export default MyInfoPage;
