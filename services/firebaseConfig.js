
// services/firebaseConfig.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// importa initializeAuth y getReactNativePersistence desde el adaptador react-native
import { initializeAuth, getReactNativePersistence } from "firebase/auth/react-native";

const firebaseConfig = {
    apiKey: "AIzaSyCZkCYaQ1HSWvSLd-exKariOdWGQDu5QSw",
    authDomain: "pablo-inventario-rn.firebaseapp.com",
    projectId: "pablo-inventario-rn",
    storageBucket: "pablo-inventario-rn.appspot.com",
    messagingSenderId: "906384487888",
    appId: "1:906384487888:web:0cb5d3c9fddde43c1435d5",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
export const storage = getStorage(app);
