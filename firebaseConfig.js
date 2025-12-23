import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";  
import AsyncStorage from "@react-native-async-storage/async-storage";  
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBWHfZhQGVw8uzYj7jifBZ_whlPh0wyRtk",
  authDomain: "proyecto-bfbf0.firebaseapp.com",
  projectId: "proyecto-bfbf0",
  storageBucket: "proyecto-bfbf0.appspot.com",
  messagingSenderId: "408699981802",
  appId: "1:408699981802:web:7c9232959815a709a0ec93"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)  // Usar persistencia con AsyncStorage
});

const db = getFirestore(app);

const storage = getStorage(app);

export { app as firebaseApp, auth, db, storage };
export default app;
