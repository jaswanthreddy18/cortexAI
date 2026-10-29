// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cortexai-f9d6d.firebaseapp.com",
  projectId: "cortexai-f9d6d",
  storageBucket: "cortexai-f9d6d.firebasestorage.app",
  messagingSenderId: "460057974077",
  appId: "1:460057974077:web:863b10348c9fc5a066e154"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();