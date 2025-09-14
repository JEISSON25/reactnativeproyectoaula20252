//para firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore"; 
import { collection, addDoc } from "firebase/firestore";



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAp9N8RcRwCDrX2azkgfNCiaKs9uLqdeFw",
  authDomain: "appmonitoreoambiental-afceb.firebaseapp.com",
  projectId: "appmonitoreoambiental-afceb",
  storageBucket: "appmonitoreoambiental-afceb.appspot.com",
  messagingSenderId: "1069011463419",
  appId: "1:1069011463419:web:8b2b5da5e58cbc343e945e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); 
export { auth,db };