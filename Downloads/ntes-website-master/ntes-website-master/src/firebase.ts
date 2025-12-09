// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDq9FiMQ8l_g0or-trvAFIn9hFFDqL6loY",
  authDomain: "ntes-website-eb464.firebaseapp.com",
  projectId: "ntes-website-eb464",
  storageBucket: "ntes-website-eb464.firebasestorage.app",
  messagingSenderId: "309250133366",
  appId: "1:309250133366:web:247e076f6ec60714ec3e57",
  measurementId: "G-LQJQWN9C8E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;