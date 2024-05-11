// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtK3_QekMJ8cVKxbvOQ-au75R7C_IHHNE",
  authDomain: "estateexplorer-react.firebaseapp.com",
  projectId: "estateexplorer-react",
  storageBucket: "estateexplorer-react.appspot.com",
  messagingSenderId: "610101209599",
  appId: "1:610101209599:web:19951bb092bfa8be0d9fca"
};

// Initialize Firebase
const app=initializeApp(firebaseConfig);
export const db=getFirestore(app)