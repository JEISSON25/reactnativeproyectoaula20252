import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBp6z1ioxfVxoHuWBjOSLPxQTsyo5tdZx4",
  authDomain: "traininfo-9141d.firebaseapp.com",
  projectId: "traininfo-9141d",
  storageBucket: "traininfo-9141d.firebasestorage.app",
  messagingSenderId: "939950371526",
  appId: "1:939950371526:web:92d108949dae20d2ae9dc7",
  measurementId: "G-HLPT695NGW"
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);


const db = initializeFirestore(app, {

});

export { app, auth, db };

