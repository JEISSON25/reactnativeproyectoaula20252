import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAHd0a1mEBrpMyXylM0eLLbbiGwwuSqpEY",
  authDomain: "vetapp-3720c.firebaseapp.com",
  projectId: "vetapp-3720c",
  storageBucket: "vetapp-3720c.firebasestorage.app",
  messagingSenderId: "260297994785",
  appId: "1:260297994785:web:c8328c8f9424e7f4e02960"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { auth };

export default app;