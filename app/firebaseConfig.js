
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDaYHcDajcW4AQV6myBT1ewHQgkd7t4-AA",
  authDomain: "recipecompiler-b4777.firebaseapp.com",
  projectId: "recipecompiler-b4777",
  storageBucket: "recipecompiler-b4777.firebasestorage.app",
  messagingSenderId: "844964250213",
  appId: "1:844964250213:web:99e0e0aaf78818c32f3c8c",
  measurementId: "G-V9K0M2Z3MP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export {db}