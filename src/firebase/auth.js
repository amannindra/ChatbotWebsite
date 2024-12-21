import { auth } from "./FireBase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
  return auth.createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithEmailAndPassword = (email, password) => {
  return auth.signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
  console.log("Signing in with Google...");
  const provider = new GoogleAuthProvider(auth);
  const result = await signInWithPopup(auth, provider);
  console.log("Reached");
  //Save to firestore later
  // console.log(`Results: ${result.user}`);
  return result;
};

export const doSignOut = () => {
  return auth.signOut();
};

// export const doPasswordReset = (email) => {
//   return auth.sendPasswordResetEmail(auth, email);
// };

// export const doPasswordChange = (password) => {
//   return auth.updatepasswords(auth.currentuser, password);
// };
// export const doSendEmailVerification = () => {
//   return auth.doSendEmailVerification(auth.currentuser, {
//     url: `${window.location.origin}/home`,
//   });
// };
