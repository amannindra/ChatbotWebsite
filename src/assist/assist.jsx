import "./assist.css";
import { useState, useEffect } from "react";
import Add from "./images/plus.png";
import Main from "./images/main.png";
import Setting from "./images/setting.png";
import {
  retrieveTitles,
  getChatbot,
  getUserId,
  addChatbot3,
  deleteConveration
  // deleteConveration
} from "../Conversations/conversation.js";
import { use } from "react";

function assist(props) {
  const [assistanimation, setAssistanimation] = useState(false);
  const [titles, setTitles] = useState([]);
  const [value, setValue] = useState();
  const [scrollWheel, setScrollWheel] = useState(true);

  const animation = () => {
    setAssistanimation(!assistanimation);
    console.log(assistanimation);
    const sidebar = document.getElementById("assisted");
    sidebar.style.width = activeTab ? "0" : "15rem";
  };
  useEffect(() => {
    if (props.isSignedIn) {
      retrieveTitles().then(function (result) {
        // [conversationId, title]
        // console.log("useEffect Titles: " + result);

        setTitles(result);
      });
    } else {
      console.log("User is not signedin");
    }
  }, [props.isSignedIn]);

  const updateCurrentConv = (conversationId) => {
    console.log("Updating Current Conversation with: " + conversationId);
    props.setCurrentConversation(conversationId);
  };

  const newConvervation = async () => {
    if (props.isSignedIn) {
      var tit = await addChatbot3();
      updateCurrentConv(tit[0]); // [ConversationId, Title]
      setTitles([tit, ...titles]);
    } else {
      console.log("You need to sign in!! " + JSON.stringify(props.isSignedIn));
    }
  };

  const deleteContent = async (conversationId) => {
    console.log("Delete Content Function not created");
    await deleteConveration(conversationId);

    // [[4234324, title], [3432, title],[4234, title]]
      
    setTitles(prevTitles => prevTitles.filter(title => title[0] !== conversationId));

    console.log(`Removing: ${conversationId} from titles`);
    console.log(`Titles: ${titles}`);



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
            {titles.map(([conversationId, title], index) => {
              return (
                <div
                  data-id={conversationId}
                  className="each_section"
                  key={conversationId}
                  onClick={() => updateCurrentConv(conversationId)}
                >
                  <p className="fade">{title}</p>
                  <a
                    className="close"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the event from propagating to the parent
                      deleteContent(conversationId);
                    }}
                  />
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
