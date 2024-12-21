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

function assist(props) {
  const [assistanimation, setAssistanimation] = useState(false);
  const [titles, setTitles] = useState([]);
  const userID = getUserId();

  const animation = () => {
    setAssistanimation(!assistanimation);
    console.log(assistanimation);
    const sidebar = document.getElementById("assisted");
    sidebar.style.width = activeTab ? "0" : "15rem";
  };

  useEffect(() => {
    // const userID = getUserId();
    // if (userID) {
    //   var tit = retrieveTitles();
    //   console.log(tit);
    //   setTitles(tit);
    // }
    // alert("assist.jsx");
    // console.log("titles are received");
    var tit = retrieveTitles();
    tit.then(function(result){
      setTitles((prev) => [...result]);
    })
  }, []);

  useEffect(() => {
    // const userID = getUserId();

    // if (userID) {
    //   var tit = retrieveTitles();
    //   console.log(tit);
    //   setTitles(tit);
    // }
    // alert("assist.jsx 2nd");
    var tit = retrieveTitles();
    tit.then(function(result){
      setTitles(result);
    })

  }, [props.currentConversation]);

  const updateCurrentConv = (miniTitle) => {
    // console.log(`putConversation: ${miniTitle}`);
    console.log(`current Conversatio is updated to ${miniTitle}`);
    props.setCurrentConversation(miniTitle);
  };

  // const updateTitles = (titles) => {
  //   setTitles((prev) => [...titles]);
  // };

  const newConvervation = async () => {
    var tit  = await addChatbot();
    setTitles([...titles, tit]);
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
{
  /* <div className="section">
            <p>React menu animation</p>
          </div>
          <div className="section">
            <p>React menu animation </p>
          </div>
          <div className="section">
            <p>React menu animation</p>
          </div> */
}
