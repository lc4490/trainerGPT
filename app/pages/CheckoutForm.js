import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Box, Typography, Button, CircularProgress, TextField, Grid, useMediaQuery, ThemeProvider, CssBaseline, useTheme } from '@mui/material';
import { lightTheme, darkTheme } from '../theme';

// Load your Stripe public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const theme = useTheme(); // Access the MUI theme
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);
  const muiTheme = darkMode ? darkTheme : lightTheme;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (!stripe || !elements) {
      setLoading(false);
      return;
    }
  
    const cardElement = elements.getElement(CardElement);
  
    // Create payment method with billing details
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: name,
        email: email,
        address: {
          line1: address,
          city: city,
          state: state,
          postal_code: postalCode,
          country: country,
        },
      },
    });
  
    if (error) {
      console.log('[error]', error);
      setLoading(false);
    } else {
      console.log('Payment method created successfully!', paymentMethod);
  
      // Send the form data to the backend to create a checkout session
      try {
        const response = await fetch('/api/create_checkout_session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            address,
            city,
            state,
            postalCode,
            country,
          }),
        });
  
        const session = await response.json();
  
        if (session.error) {
          console.error('Backend error:', session.error);
          setLoading(false);
        } else {
          // Redirect to Stripe Checkout
          const { error: stripeError } = await stripe.redirectToCheckout({
            sessionId: session.id,
          });
  
          if (stripeError) {
            console.error('Stripe checkout error:', stripeError);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error processing checkout:', error);
        setLoading(false);
      }
    }
  };
  
  

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
        <form onSubmit={handleSubmit}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2}>
            $5 / month
        </Typography>

        {/* Name Field */}
        <Box mb={2}>
            <TextField
            fullWidth
            label="Full Name"
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            />
        </Box>

        {/* Email Field */}
        <Box mb={2}>
            <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
        </Box>

        {/* Address Fields */}
        <Grid container spacing={2} mb={2}>
            <Grid item xs={12}>
            <TextField
                fullWidth
                label="Address"
                variant="outlined"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
            />
            </Grid>
            <Grid item xs={6}>
            <TextField
                fullWidth
                label="City"
                variant="outlined"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
            />
            </Grid>
            <Grid item xs={6}>
            <TextField
                fullWidth
                label="State"
                variant="outlined"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
            />
            </Grid>
            <Grid item xs={6}>
            <TextField
                fullWidth
                label="Postal Code"
                variant="outlined"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
            />
            </Grid>
            <Grid item xs={6}>
            <TextField
                fullWidth
                label="Country"
                variant="outlined"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
            />
            </Grid>
        </Grid>

        {/* Card Element */}
        <Box mb={3}>
            <CardElement
            options={{
                style: {
                base: {
                    fontSize: '16px',
                    color: theme.palette.background.link, // Using the 'link' color from the theme
                    '::placeholder': {
                    color: theme.palette.text.secondary, // Placeholder color from theme
                    },
                },
                invalid: {
                    color: theme.palette.error.main, // Error color from theme
                },
                },
            }}
            />
        </Box>

        {/* Submit Button */}
        <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!stripe || loading}
            fullWidth
        >
            {loading ? <CircularProgress size={24} /> : 'Submit Payment'}
        </Button>
        </form>
    </ThemeProvider>
  );
};

// Wrap your form with Stripe Elements provider
const StripeCheckout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default StripeCheckout;
