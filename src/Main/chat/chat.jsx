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
  updateChatbot,
  // checkIfUserIsPresent,
  getUserId,
  getUserPhoto,
  getDisplayName,
  getEmail,
} from "../../Conversations/conversation.js";
import { useAuthState } from "react-firebase-hooks/auth";

function Chat(props) {
  const [userText, setuserText] = useState("");
  const [chatHistory, setChatHistory] = useState([]); 
  const textareaRef = useRef(null);
  const messagesEndRef  = useRef(null);

  var user = "./Images/user.png";

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


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async () => {
    if (!props.isSignedIn) {
      user = getUserPhoto();
      alert("Please sign in Chat.jsx");
      setuserText("");
      return;
    }
    
    if (userText.trim() === "") {
      return;
    }

    if (!props.currentConversation) {
      console.log("There isn't a current conversation");
      let newConvervation = await addChatbot();
      props.setCurrentConversation(newConvervation);
      console.log(`updated props.currentConversation: ${props.currentConversation}`);
      await handleAI(newConvervation);
      
    } else {
      console.log("CURRENT conversation");
      await handleAI(props.currentConversation);

    }
    setuserText("");
    // await summarize();

  };

  const summarize = async ()=>{
    console.log("getChatBot to Summarize: " + JSON.stringify(await getChatbot(props.currentConversation)));
  }

  const handleAI = async (conversationTitle) => {
    const ai = await getResponce(conversationTitle, userText);
    const userInput = {
      role: "user",
      parts: [{ text: userText }],
    };

    const modelInput = {
      role: "model",
      parts: [{ text: ai }],
    };
    setChatHistory((prev) => [...prev, userInput, modelInput]);
  };

  useEffect(() => {
    if(props.currentConversation){
      (async () => {
      var conv = await getChatbot(props.currentConversation);
      // console.log("getChatbot to useEffect: " + JSON.stringify(conv));
      setChatHistory(conv);
    
    })()}
    else{
      console.log("Not updating the currentConversation");
    }
  }, [props.currentConversation]);

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
                  <img src={user} />
                  <Markdown className="fixrow">
                    {message.parts[0].text}
                  </Markdown>
                </div>
              )}
            </div>
          ))}
          <div ref = {messagesEndRef}/>
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
