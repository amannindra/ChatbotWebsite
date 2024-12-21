// useAuth.js
import { useContext } from "react";
import { auth } from "./FireBase";
import { AuthContext } from "./index";
// Import the AuthContext from your provider file

export function useAuth() {
    // console.log("useAuth is connected");
  return useContext(AuthContext);
}
