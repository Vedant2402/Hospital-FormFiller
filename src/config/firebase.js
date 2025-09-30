import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyCbXk2j5OPGg6P08_5fdrm6t89wOfBpnwA",
  authDomain: "assisgnment-8972a.firebaseapp.com",
  projectId: "assisgnment-8972a",
  storageBucket: "assisgnment-8972a.firebasestorage.app",
  messagingSenderId: "532681567171",
  appId: "1:532681567171:web:02396fca5c045c7cbeab76"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;