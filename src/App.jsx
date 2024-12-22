import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import Main from "./Main/Mains";
import Assist from "./assist/assist";

// Import the functions you need from the SDKs you need

function App() {
  const [currentConversation, setCurrentConversation] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);

  return (
    <>
      <div className="window">
        <Assist
          currentConversation={currentConversation}
          setCurrentConversation={setCurrentConversation}
        />
        <Main
          currentConversation={currentConversation}
          setCurrentConversation={setCurrentConversation}
          isSignedIn={isSignedIn}
          setIsSignedIn={setIsSignedIn}
        />
      </div>
    </>
  );
}

export default App;
