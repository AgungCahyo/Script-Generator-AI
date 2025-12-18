// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0Tan3YDPpWdMmJUNgGyhvN_UOkElzIJw",
  authDomain: "script-generator-a7cc0.firebaseapp.com",
  projectId: "script-generator-a7cc0",
  storageBucket: "script-generator-a7cc0.firebasestorage.app",
  messagingSenderId: "325022533676",
  appId: "1:325022533676:web:e87166e03ae32c4e0da989",
  measurementId: "G-C75EH7DG76"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);