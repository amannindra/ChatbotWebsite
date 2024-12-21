import "./Mains.css";
import React from "react";
import Chat from "./chat/chat";
import Tabs from "./Tabs/Tabs";
import { useState } from "react";

function Main(props) {
  const [userData, setUserData] = useState();

  return (
    <>
      <div className="Main">
        <Tabs
          isSignedIn={props.isSignedIn}
          setIsSignedIn={props.setIsSignedIn}
          userData={userData}
          setUserData={setUserData}
        />
        <div className="chat-container">
          <Chat
            isSignedIn={props.isSignedIn}
            setIsSignedIn={props.setIsSignedIn}
            currentConversation={props.currentConversation}
            setCurrentConversation={props.setCurrentConversation}
            userData={userData}
            setUserData={setUserData}
          />
        </div>
      </div>
    </>
  );
}

export default Main;
