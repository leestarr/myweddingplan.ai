// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPwCftfOMRaBSiubsPeBO4QoRrQEKA5Lc",
  authDomain: "myweddingplan-ai.firebaseapp.com",
  projectId: "myweddingplan-ai",
  storageBucket: "myweddingplan-ai.appspot.com",
  messagingSenderId: "1073345326394",
  appId: "1:1073345326394:web:b8b8b0e1b8b8b0e1b8b8b0"
};

// Initialize Firebase only if it hasn't been initialized yet
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore
const db = getFirestore(app);

export { db };
