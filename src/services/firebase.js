// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // <-- add this

const firebaseConfig = {
    apiKey: "AIzaSyD-xKC33ML6MGYg79bU7fzMfi-0vmtlcXs",
    authDomain: "career-b680d.firebaseapp.com",
    projectId: "career-b680d",
    storageBucket: "career-b680d.appspot.com", // <-- correct format
    messagingSenderId: "757815360373",
    appId: "1:757815360373:web:d2fe4c8d649ea0337c713c"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // <-- initialize storage

export { auth, db, storage }; // <-- export storage
