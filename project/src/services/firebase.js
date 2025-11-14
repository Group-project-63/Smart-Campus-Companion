import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider  } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAmg2I6qOrsMvNWOUglpZcN7H5mMP7b_iM",
  authDomain: "smart-campus-companion-ccb0e.firebaseapp.com",
  projectId: "smart-campus-companion-ccb0e",
  storageBucket: "smart-campus-companion-ccb0e.appspot.com",
  messagingSenderId: "406384941875",
  appId: "1:406384941875:web:616f09105c43f98a527c46"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();