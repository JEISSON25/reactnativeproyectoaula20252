import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBp6z1ioxfVxoHuWBjOSLPxQTsyo5tdZx4",
  authDomain: "traininfo-9141d.firebaseapp.com",
  projectId: "traininfo-9141d",
  storageBucket: "traininfo-9141d.firebasestorage.app",
  messagingSenderId: "939950371526",
  appId: "1:939950371526:web:92d108949dae20d2ae9dc7",
  measurementId: "G-HLPT695NGW"
};

// Inicializar app solo una vez
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializar Auth con persistencia (una sola vez)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e) {
  auth = getAuth(app); // ya inicializado
}

// Inicializar Firestore de forma segura
let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch (e) {
  db = getFirestore(app); // si ya existe, se reutiliza
}

export { app, auth, db };
