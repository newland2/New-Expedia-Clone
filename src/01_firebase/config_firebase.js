// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZnqsHRxg8r_qhYJPyBiW6biJHksDGoKQ",
  authDomain: "new-expedia-clone.firebaseapp.com",
  projectId: "new-expedia-clone",
  storageBucket: "new-expedia-clone.firebasestorage.app",
  messagingSenderId: "35502656689",
  appId: "1:35502656689:web:e125b6383d5a75975aa690",
  measurementId: "G-KT53T0LGV1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app;
export { analytics };