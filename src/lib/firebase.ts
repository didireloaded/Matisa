// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBALoUa29O6BtWxxKHo0dTfLjiu2yeKv5w",
  authDomain: "matisa-35eaf.firebaseapp.com",
  projectId: "matisa-35eaf",
  storageBucket: "matisa-35eaf.firebasestorage.app",
  messagingSenderId: "796157643685",
  appId: "1:796157643685:web:339fee61a8b254e641b64c",
  measurementId: "G-YRL2L0TS65",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
