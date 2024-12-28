import "./assist.css";
import { useState, useEffect } from "react";
import Add from "./images/plus.png";
import Main from "./images/main.png";
import Setting from "./images/setting.png";
import {
  retrieveTitles,
  getChatbot,
  getUserId,
  addChatbot,
} from "../Conversations/conversation.js";
import { use } from "react";

function assist(props) {
  const [assistanimation, setAssistanimation] = useState(false);
  const [titles, setTitles] = useState([]);
  const [scrollWheel, setScrollWheel] = useState(true);

  const animation = () => {
    setAssistanimation(!assistanimation);
    console.log(assistanimation);
    const sidebar = document.getElementById("assisted");
    sidebar.style.width = activeTab ? "0" : "15rem";
  };


  useEffect(() => {
    if(props.isSignedIn){
      var tit = retrieveTitles();
      tit.then(function(result){
        if(result.length > 10){
          setScrollWheel(true);
          
        }
        else{
          setScrollWheel(false);
        }
      setTitles(result);
    })
    }else{
      console.log("User is not signedin");
    }
    

  }, [props.currentConversation, props.isSignedIn]);

  const updateCurrentConv = (miniTitle) => {
    props.setCurrentConversation(miniTitle);
  };

  const newConvervation = async () => {
    if(props.isSignedIn){
      var tit  = await addChatbot();
      setTitles([...titles, tit]);
    }
    else{
      console.log("You need to sign in!! " + JSON.stringify(props.isSignedIn))
    } 
  };

  return (
    <>
      <div className="assist" id="assisted">
        <div className="chats" id="first">
          <div
            id="center_plus"
            className="each_section"
            onClick={() => newConvervation()}
          >
            <img src={Add} alt="Add" />
            <p>Add new Chat</p>
            
          </div>

          <p id="title_text">Recent</p>
          <div className="section">
            {titles.map((message, index) => {
              return (
                <div
                  className="each_section"
                  key={index}
                  onClick={() => updateCurrentConv(message)}
                >
                  <p>{message}</p>
                  
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default assist;
