import "./chat.css";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { createRoot } from "react-dom/client";
import Markdown from "react-markdown";
import Gemini from "./Images/gemini.png";
import ArrowUp from "./Images/up-arrow-better.png";
import Photo from "./Images/photo.png";
import User from "./Images/user.png";
import {
  retrieveTitles,
  getResponce,
  getChatbot,
  addChatbot,
  updateChatbot,
  getLatestUserMessage,
  getLatestModelMessage
} from "../../Conversations/conversation.js";
import { useAuthState } from "react-firebase-hooks/auth";

function Chat(props) {
  const [conversationId, setConverationId] = useState(null);
  const [userText, setuserText] = useState("");
  const [chatHistory, setChatHistory] = useState([]); 
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    const handleInput = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    };
    textarea.addEventListener("input", handleInput);
    return () => {
      textarea.removeEventListener("input", handleInput);
    };
  }, []);

  const handleSend = async () => {
    if (!props.isSignedIn) {
      alert("Please sign in Chat.jsx");
      setuserText("");
      return;
    }

    if (userText.trim() === "") {
      return;
    }
    var conv2;
    if (!props.currentConversation) {
      console.log("There isn't a current conversation");
      let newConvervation = addChatbot();
      props.setCurrentConversation(newConvervation);
      await handleAI(newConvervation);
      conv2 = getChatbot(newConvervation);
    } else {
      console.log("There is a current conversation");
      await handleAI(props.currentConversation);
      conv2 = getChatbot(props.currentConversation);
    }
    setuserText("");
  };
  ``;

  const handleAI = async (curConveration) => {
    props.setCurrentConversation(curConveration);
    console.log(
      "This is the current Conversation title in handleAI: " + curConveration
    );

    await getResponce(curConveration, userText);
    var umesssage = getLatestUserMessage();
    var mmesssage = getLatestModelMessage();
    umesssage.then(function(result){
      setChatHistory([...result]);

    });
    mmesssage.then(function(result){
      setChatHistory([...result]);
    });

    // setChatHistory([...userInput]);
    // setChatHistory([...modelInput]);
    // console.log(chatHistory);
  };

  //Get the AI responce, and then the backend update reponse.
  useEffect(() => {
    var conv = getChatbot(props.currentConversation);
    setChatHistory(conv);
  }, [props.currentConversation]);

  // useEffect(() => {
  //   if (chatContainerRef.current) {
  //     chatContainerRef.current.scrollTop =
  //       chatContainerRef.current.scrollHeight;
  //   }
  // }, [chatHistory]);

  return (
    
    <div className="center">
      <div className="chat">
        <div className="chatText">
          {chatHistory.map((message, index) => (
            <div key={index}>
              {message.role === "model" ? (
                <div className="model">
                  <img src={Gemini} />
                  <Markdown className="fixrow">
                    {message.parts[0].text}
                  </Markdown>
                </div>
              ) : (
                <div className="user">
                  <img src={User} />
                  <Markdown className="fixrow">
                    {message.parts[0].text}
                  </Markdown>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="user_input">
        <input
          ref={textareaRef}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          onChange={(e) => setuserText(e.target.value)}
          value={userText}
        />
        <div className="sendButton" onClick={() => handleSend()}>
          <img src={ArrowUp} />
        </div>
        <div className="sendButton" onClick={() => handleSend()}>
          <img src={Photo} />
        </div>
      </div>

    </div>
  );
}

export default Chat;
