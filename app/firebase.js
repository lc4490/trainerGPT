// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// google auth
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithRedirect } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgQJe_vvJQYzUY9usIciKF0-yAYiuGi-Y",
  authDomain: "trainergpt-9865f.firebaseapp.com",
  projectId: "trainergpt-9865f",
  storageBucket: "trainergpt-9865f.appspot.com",
  messagingSenderId: "349011780590",
  appId: "1:349011780590:web:94cb24d51c74f08da264ff"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
// google auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { firestore, auth, provider, signInWithPopup, signOut, signInWithRedirect };