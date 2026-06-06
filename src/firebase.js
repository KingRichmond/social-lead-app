import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAtWnuuT-b37UZqll3La4IZLn6KDfu8ekQ",
  authDomain: "socialleadapp.firebaseapp.com",
  projectId: "socialleadapp",
  storageBucket: "socialleadapp.firebasestorage.app",
  messagingSenderId: "291578291188",
  appId: "1:291578291188:web:fa4d2b3e9ed9ce98a1cfa1"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);