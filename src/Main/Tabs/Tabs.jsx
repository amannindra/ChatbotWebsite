import "./Tabs.css";
import Add from "./Images/plus.svg";
import User from "./Images/user.png";
import { useState, useEffect } from "react";
import { doSignInWithGoogle } from "../../firebase/auth";
import { useAuth } from "../../firebase/useAuth";

import { uploadUserId } from "../../Conversations/conversation";

function Tabs(props) {
  const { userLoginIn } = useAuth();
  const { setUserLoggedIn } = useAuth();

  const [activeTab, setactiveTab] = useState(false);

  // const [errorMessage, setErrorMessage] = useState("");
  const [userImage, setUserImage] = useState(User);

  const { currentUser } = useAuth();

  const sideBar = () => {
    setactiveTab(!activeTab);
    if (activeTab) {
      document.getElementById("assisted").style.width = "0";
    } else {
      document.getElementById("assisted").style.width = "17.5rem";
    }
  };

  const GoogleSignIn = async (e) => {
    e.preventDefault();
    if (!props.isSignedIn) {
      try {
        const googleResults = await doSignInWithGoogle();
        props.setIsSignedIn(true);
        props.setUserData(googleResults.user);
        console.log(`Data: ${googleResults.user}`);

        const id = uploadUserId(googleResults.user.uid);
      } catch (err) {
        console.error("Error signing in with Google:", err);
        props.setIsSignedIn(false);
      }
    }
  };

  useEffect(() => {
    if (props.userData) {
      console.log(`User Data:`, props.userData);
      setUserImage(props.userData.photoURL);

    }
    // console.log(`Is logged in: ${props.isSignedIn}`);
  }, [props.userData, props.isSignedIn]);

 

  return (
    <div className="tabs">
      <div className="left">
        <img src={Add} onClick={sideBar}></img>
      </div>
      <div className="right">
        <img src={userImage} onClick={GoogleSignIn}></img>
      </div>
    </div>
  );
}

export default Tabs;
