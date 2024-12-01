import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDPwCftfOMRaBSiubsPeBO4QoRrQEKA5Lc",
  authDomain: "myweddingplan-ai.firebaseapp.com",
  projectId: "myweddingplan-ai",
  storageBucket: "myweddingplan-ai.firebasestorage.app",
  messagingSenderId: "736236050505",
  appId: "1:736236050505:web:9dcf0ba5313a2096990798",
  measurementId: "G-5NK6W6GGCN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// Export auth methods
export const authMethods = {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
};

export default app;
