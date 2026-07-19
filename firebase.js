import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5sHNe2gV3vJYA1F2-JQsNbZrU5DTLcPw",
  authDomain: "ajay-premier-league-apl.firebaseapp.com",
  projectId: "ajay-premier-league-apl",
  storageBucket: "ajay-premier-league-apl.firebasestorage.app",
  messagingSenderId: "514698419085",
  appId: "1:514698419085:web: