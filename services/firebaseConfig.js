
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCZkCYaQ1HSWvSLd-exKariOdWGQDu5QSw",
    authDomain: "pablo-inventario-rn.firebaseapp.com",
    projectId: "pablo-inventario-rn",
    storageBucket: "pablo-inventario-rn.appspot.com",
    messagingSenderId: "906384487888",
    appId: "1:906384487888:web:0cb5d3c9fddde43c1435d5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);