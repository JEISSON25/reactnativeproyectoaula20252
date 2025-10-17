// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyB6k0KIpRo4S3fT1mLxbl6wmfbsMMG6L50",
  authDomain: "recetas-saludables-dc3af.firebaseapp.com",
  projectId: "recetas-saludables-dc3af",
  storageBucket: "recetas-saludables-dc3af.firebasestorage.app",
  messagingSenderId: "1082794697707",
  appId: "1:1082794697707:web:3aba5730c08983984aafae"
};

// Inicializa app
const app = initializeApp(firebaseConfig);

// Autenticación persistente
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore con cache offline persistente
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

export { app, auth, db };
