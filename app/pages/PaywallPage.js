import { Box, Typography, Button, CircularProgress, Grid, Avatar, Card, CardContent, useMediaQuery, ThemeProvider, CssBaseline } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useUser } from "@clerk/nextjs";
import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStripe, useElements, CardElement, Elements, PaymentRequestButtonElement } from '@stripe/react-stripe-js'; 
import { loadStripe } from '@stripe/stripe-js'; 
import { GuestContext } from '../page';
import { firestore } from '../firebase'
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { lightTheme, darkTheme } from '../theme';

// Load Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const PaywallPage = () => {
    const { t } = useTranslation();
    const { user, isLoaded, isSignedIn } = useUser();
    const { guestData, guestEquipment, guestMessages } = useContext(GuestContext);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Stripe hooks
    const stripe = useStripe();
    const elements = useElements();

    // Apple Pay (Payment Request Button) state
    const [paymentRequest, setPaymentRequest] = useState(null);
    const [paymentRequestAvailable, setPaymentRequestAvailable] = useState(false);

    useEffect(() => {
        if (stripe) {
            const pr = stripe.paymentRequest({
                country: 'US',  // Adjust based on your country
                currency: 'usd',
                total: {
                    label: t('Upgrade to Premium'),
                    amount: 499,  // Example: $4.99 (in cents)
                },
                requestPayerName: true,
                requestPayerEmail: true,
            });

            pr.canMakePayment().then((result) => {
                console.log(result)
                if (result) {
                    setPaymentRequest(pr);
                    setPaymentRequestAvailable(true);
                }
            });
        }
    }, [stripe]);
    {console.log(paymentRequestAvailable)}

    // Implementing theming
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [darkMode, setDarkMode] = useState(prefersDarkMode);
    useEffect(() => {
        setDarkMode(prefersDarkMode);
    }, [prefersDarkMode]);
    const theme = darkMode ? darkTheme : lightTheme;
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Handle the Stripe payment flow
    const handlePurchase = async () => {
        if (!isSignedIn) {
            await saveGuestDataToFirebase();
            router.push('/sign-in');
            return;
        }
    
        setLoading(true);
    
        if (!stripe || !elements) {
            console.error('Stripe or Elements not loaded');
            setLoading(false);
            return;
        }
    
        const cardElement = elements.getElement(CardElement);
    
        try {
            // Create the Payment Intent on the backend
            const res = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 499 })  // Example: $4.99 (amount in cents)
            });
    
            const { client_secret } = await res.json();
            console.log('Response from /api/checkout_sessions:', client_secret);  // Log full response
    
            if (!client_secret) {
                console.error('Error fetching client secret.');
                setLoading(false);
                return;
            }
    
            // Confirm the payment with Stripe using the client secret and CardElement
            const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: cardElement,
                },
            });
    
            if (error) {
                console.error('Payment failed:', error.message);
                setLoading(false);
                return;
            }
    
            if (paymentIntent.status === 'succeeded') {
                console.log('Payment successful!');
                if (user) {
                    try {
                    const userDocRef = doc(firestore, 'users', user.id);
                    await setDoc(userDocRef, { premium: true }, { merge: true });
                    } catch (error) {
                    console.error('Error setting premium mode:', error);
                    }
                } else {
                    console.warn('No user found, unable to update premium status');
                }
                window.location.reload(); // Refresh the page after payment
            }
    
            setLoading(false);
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
        <ThemeProvider theme = {theme}>
            <CssBaseline />
            <Box display="flex" flexDirection="column" height="100%" p={3} overflow={"auto"} paddingBottom={"60px"}>
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

                {/* Payment Request Button (Apple Pay / Google Pay) */}
                {paymentRequestAvailable && (
                    <>
                    {/* <Box mb={4} width="100%" height = "600px" display="flex" justifyContent="center">
                        <PaymentRequestButtonElement
                            options={{
                                paymentRequest,
                                style: {
                                    paymentRequestButton: {
                                        type: 'default',  // 'default', 'buy', or 'donate'
                                        theme: 'dark',  // 'dark', 'light', or 'light-outline'
                                        height: '64px',
                                    },
                                },
                            }}
                        />
                        
                    </Box> */}
                    <Box width = "100px" height = "100px" backgroundColor="red">hi</Box>
                    </>
                    
                )}

                {/* Stripe Elements Payment Form */}
                { user && <Box mb={4} width="100%" display="flex" justifyContent="center">
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="body1" textAlign="center" mb={2}>
                                {t("Enter your payment details below.")}
                            </Typography>
                            <CardElement 
                                options={{
                                    hidePostalCode: true,
                                    style: { 
                                        base: {
                                            fontSize: '16px',
                                            color: theme.palette.text.primary,  // Uses primary text color from custom theme
                                            '::placeholder': {
                                                color: theme.palette.text.secondary || 'gray',  // Placeholder color, fallback to gray if not defined
                                            },
                                            backgroundColor: theme.palette.background.default,  // Optional background color
                                        },
                                        invalid: {
                                            color: theme.palette.error.main || 'red',  // Error color, fallback to red if not defined
                                        },
                                    },
                                }}
                            />
                        </CardContent>
                    </Card>
                </Box>}

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
                            disabled={!stripe || !elements}
                        >
                            {user ? t("Upgrade Now"): t("Sign in to upgrade") }
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
        </ThemeProvider>
    );
};

// Wrap PaywallPage with Elements provider
const PaywallPageWithStripe = () => (
    <Elements stripe={stripePromise}>
        <PaywallPage />
    </Elements>
);

export default PaywallPageWithStripe;
