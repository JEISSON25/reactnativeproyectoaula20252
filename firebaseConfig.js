import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyB6k0KIpRo4S3fT1mLxbl6wmfbsMMG6L50",
  authDomain: "recetas-saludables-dc3af.firebaseapp.com",
  projectId: "recetas-saludables-dc3af",
  storageBucket: "recetas-saludables-dc3af.firebasestorage.app",
  messagingSenderId: "1082794697707",
  appId: "1:1082794697707:web:3aba5730c08983984aafae"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };