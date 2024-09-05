# TrainerGPT

## Description
TrainerGPT is a fully functional personal training assistant. This web-based app provides an AI assistant to help users along their fitness journey, whether that is from creating personalized workout plans customized to their information and available equipment. Premium users have access to a pantry app that allows users to take photos of ingredients laying in their fridge, which will be identified by the program, and create custom recipe suggestions based on the items available, a customized google calendar aligning with their generated workout plan, as well as the ability to connect with friends to find common days to work out.

## Features
- AI powered personal training assistant that can create workout plans or give out custom video demonstrations for specific exercises.
- User chatlog storage.
- Multi-language availability
- Ability to create and edit a personal profile that will fine-tune the AI.
- Image capture for identifying gym equipment, and informing the AI of available equipment.
- Image capture for identifying pantry ingredients.
- Using pantry ingredients to create custom recipes

## Tech Stack
- **Frontend:**
  - Next.js (React framework)
  - Material-UI (MUI) for UI components and theming
- **Backend:**
  - Firebase
    - Firestore for database
    - Firebase Storage for image storage
  - Clerk
    - Clerk user authentication for better security
  - Stripe
    - For payment processing
- **APIs:**
  - OpenAI API for recipe suggestions
- **Additional Libraries:**
  - react-camera-pro for camera functionality
  - OpenAI JavaScript library for API integration
  - i18n.js for translation features
  - JoyRide for tutorial
  - 

## Deployed Application
<p>Deployed using Vercel</p> 
You can access the live application here: https://trainer-gpt.vercel.app