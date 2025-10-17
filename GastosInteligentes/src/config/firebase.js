import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFirestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCabvj-NH8m7PejkgEvsVgIabgBW0qOcZM",
  authDomain: "gastos-personales-app.firebaseapp.com",
  projectId: "gastos-personales-app",
  storageBucket: "gastos-personales-app.firebasestorage.app",
  messagingSenderId:"407875236224",
  appId:"1:407875236224:web:ff35e7cf85f32e2ae91165",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { auth, db };
