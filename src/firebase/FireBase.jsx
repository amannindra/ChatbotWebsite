import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage, ref } from "firebase/storage";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlIO5Q5GVtQru0G0KCIFIEY9bX78ghLGA",
  authDomain: "failed-abortions-project.firebaseapp.com",
  projectId: "failed-abortions-project",
  storageBucket: "failed-abortions-project.appspot.com",
  messagingSenderId: "877985529493",
  appId: "1:877985529493:web:6e01d7913b37f000ae659c",
  measurementId: "G-LNC4033L8T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);



// userDataRef.fullname gives the path 
// Example: "user/aman";

// Points to "userX~"
//Example: userDataRef.parent = 
export { app, auth, database };
