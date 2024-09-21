import { Box, Typography, Button, Grid, Card, CardContent, Avatar, CircularProgress, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUser } from "@clerk/nextjs";
import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { firestore, doc, setDoc, collection } from '../firebase';
import { GuestContext } from '../page'; // Adjust based on structure
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import getStripe from "@/utils/get-stripe"; // Ensure you use this if necessary, or remove the import

const PaywallPage = () => {
    const { t } = useTranslation();
    const { user, isLoaded, isSignedIn } = useUser(); // Clerk hook
    const { guestData, guestEquipment, guestMessages } = useContext(GuestContext);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const isMobile = useMediaQuery('(max-width:600px)'); // Adjust the max-width as necessary

    // Handle the Stripe payment flow
    const handlePurchase = async () => {
        if (!isSignedIn) {
            // Save guest data and redirect to sign-in page
            await saveGuestDataToFirebase();
            router.push('/sign-in');
            return;
        }

        try {
            setLoading(true);
            const checkoutSession = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const checkoutSessionJson = await checkoutSession.json();
            if (checkoutSessionJson.statusCode === 500) {
                console.error(checkoutSessionJson.message);
                setLoading(false);
                return;
            }

            const stripe = await getStripe();
            const { error } = await stripe.redirectToCheckout({ sessionId: checkoutSessionJson.id });

            if (error) {
                console.warn(error.message);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.error('Error during payment process:', error);
            setLoading(false);
        }
    };

    const saveGuestDataToFirebase = async () => {
        try {
            const guestDocRef = doc(firestore, 'users', 'guest');
            await setDoc(guestDocRef, { userData: guestData }, { merge: true });

            // Save guest equipment and chat data
            const equipmentCollectionRef = collection(guestDocRef, 'equipment');
            for (const item of guestEquipment) {
                const equipmentDocRef = doc(equipmentCollectionRef, item.name);
                await setDoc(equipmentDocRef, { count: item.count || 0 });
            }

            const chatCollectionRef = collection(guestDocRef, 'chat');
            const chatDocRef = doc(chatCollectionRef, 'en');
            await setDoc(chatDocRef, { messages: guestMessages || [], timestamp: new Date().toISOString() });

            console.log('Guest data saved to Firebase.');
        } catch (error) {
            console.error('Error saving guest data:', error);
        }
    };

    return (
        <Box display="flex" flexDirection="column" height="100%" p={3} overflow= {"auto"} marginBottom = {"60px"}>
            <Typography variant="h4" fontWeight="bold" textAlign="center" mb={2} mt={10}>
                {t("Unlock the Power of Nutrition")}
            </Typography>
            <Typography variant="body1" color="textSecondary" textAlign="center" mb={4}>
                {t("Access personalized recipes, manage your pantry, and receive tailored meal plans with our premium Nutrition features.")}
            </Typography>

            {/* Video Demo */}
            <Box mb={4} width="100%" display="flex" justifyContent="center" alignItems="center">
                <video width={isMobile ? "320" : "640"} height={isMobile ? "200" : "400"} controls>
                    <source src="/videos/demo.mp4" type="video/mp4" />
                    {t("Your browser does not support the video tag.")}
                </video>
            </Box>

            {/* Feature Highlights */}
            <Grid container spacing={4} justifyContent="center" mb={4}>
                <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Avatar sx={{ bgcolor: 'primary.main', mb: 2 }}>
                                <FastfoodIcon />
                            </Avatar>
                            <Typography variant="h6" textAlign="center">{t("Personalized Recipes")}</Typography>
                            <Typography variant="body2" textAlign="center" color="textSecondary">
                                {t("Get AI-generated recipes tailored to your available ingredients and dietary preferences.")}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Avatar sx={{ bgcolor: 'secondary.main', mb: 2 }}>
                                <FitnessCenterIcon />
                            </Avatar>
                            <Typography variant="h6" textAlign="center">{t("Manage Your Pantry")}</Typography>
                            <Typography variant="body2" textAlign="center" color="textSecondary">
                                {t("Easily keep track of your ingredients and their quantities, and never miss out on what you need.")}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Avatar sx={{ bgcolor: 'error.main', mb: 2 }}>
                                <AccessTimeIcon />
                            </Avatar>
                            <Typography variant="h6" textAlign="center">{t("Save Time")}</Typography>
                            <Typography variant="body2" textAlign="center" color="textSecondary">
                                {t("Generate meal plans and grocery lists quickly based on what's available in your pantry.")}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Testimonials (Optional Section) */}
            {/* <Box mb={4}>
                <Typography variant="body2" color="textSecondary" textAlign="center">
                    {t('"This app helped me eat healthier and save money by using ingredients I already had!" - Sarah L.')}
                </Typography>
            </Box> */}

            {/* Upgrade Button */}
            <Box textAlign="center">
                {loading ? (
                    <CircularProgress />
                ) : (
                    <Button 
                        variant="contained" 
                        color="primary" 
                        size="large" 
                        onClick={handlePurchase}
                    >
                        {t("Upgrade Now")}
                    </Button>
                )}
            </Box>

            {/* Comparison: Free vs Premium */}
            <Box mt={4} p={2} textAlign="center">
                <Typography variant="h6" color="primary">{t("Free vs Premium")}</Typography>
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={6}>
                        <Typography variant="body1" fontWeight="bold">{t("Free Users")}</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {t("AI-generated custom workout plans")}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {t("Personalized workout schedule")}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {t("Identify gym equipment using your camera and AI")}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body1" fontWeight="bold">{t("Premium Users - $5/month")}</Typography> {/* Pricing in the header */}
                        <Typography variant="body2" color="textSecondary">
                            {t("All free features")}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {t("Access to personalized recipes and meal plans")}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {t("Manage your pantry with AI-generated suggestions")}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {t("Tailored grocery lists based on pantry items")}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

        </Box>
    );
};

export default PaywallPage;
