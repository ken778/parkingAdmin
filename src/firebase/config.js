// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration (same as mobile app)
const firebaseConfig = {
  apiKey: "AIzaSyAvrssPPAaNfFFzxWLRKC5yrQ2ZO6fk-ps",
  authDomain: "fndparking.firebaseapp.com",
  projectId: "fndparking",
  storageBucket: "fndparking.firebasestorage.app",
  messagingSenderId: "899526952543",
  appId: "1:899526952543:web:b2559c547e120e6c03fdea",
  measurementId: "G-BVZ93XWR9M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };