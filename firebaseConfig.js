import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyB6k0KIpRo4S3fT1mLxbl6wmfbsMMG6L50",
  authDomain: "recetas-saludables-dc3af.firebaseapp.com",
  projectId: "recetas-saludables-dc3af",
  storageBucket: "recetas-saludables-dc3af.appspot.com",
  messagingSenderId: "1082794697707",
  appId: "1:1082794697707:web:3aba5730c08983984aafae"
};

// evitar iniciar varias veces firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// avitar inicializar auth varias veces
let auth;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

export { app };
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export { auth };
