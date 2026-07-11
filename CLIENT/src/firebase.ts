// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA8Ug4IkQeVVpea-PSpUesFoQ_IBOXMZiI",
  authDomain: "social-media-automation-c1df4.firebaseapp.com",
  projectId: "social-media-automation-c1df4",
  storageBucket: "social-media-automation-c1df4.firebasestorage.app",
  messagingSenderId: "142884423932",
  appId: "1:142884423932:web:0c307ce1744ad458d86f79",
  measurementId: "G-PYHTF26CLB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
