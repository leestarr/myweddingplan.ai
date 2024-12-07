import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPwCftfOMRaBSiubsPeBO4QoRrQEKA5Lc",
  authDomain: "myweddingplan-ai.firebaseapp.com",
  projectId: "myweddingplan-ai",
  storageBucket: "myweddingplan-ai.appspot.com",
  messagingSenderId: "736236050505",
  appId: "1:736236050505:web:9dcf0ba5313a2096990798",
  measurementId: "G-5NK6W6GGCN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only if supported
let analytics = null;
isSupported().then(yes => {
  if (yes) {
    analytics = getAnalytics(app);
  }
}).catch(err => console.error("Analytics error:", err));

export { analytics };

// Export auth methods
export const authMethods = {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
};

export default app;
