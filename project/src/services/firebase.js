import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider  } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAlhlZ6MwCp6-oVGxvJI7s3DjPvbF29-cY",
  authDomain: "smart-campus-companion-f2147.firebaseapp.com",
  projectId: "smart-campus-companion-f2147",
  storageBucket: "smart-campus-companion-f2147.firebasestorage.app",
  messagingSenderId: "119136846378",
  appId: "1:119136846378:web:e7810910e2de73a718f953"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();