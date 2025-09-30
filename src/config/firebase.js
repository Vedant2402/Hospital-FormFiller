import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA0JMZJkHENyVSpo6FAmEcSa6d92rF4zt4",
  authDomain: "assisgnment-8972a.firebaseapp.com",
  projectId: "assisgnment-8972a",
  storageBucket: "assisgnment-8972a.firebasestorage.app",
  messagingSenderId: "532681567171",
  appId: "1:532681567171:web:02396fca5c045c7cbeab76",
  measurementId: "G-WD0HCHESX2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;