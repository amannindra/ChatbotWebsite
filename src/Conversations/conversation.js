import { app } from "../firebase/FireBase";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  query,
  where,
  updateDoc,
  Timestamp,
  getFirestore,
} from "firebase/firestore";
var bot = [
];

var SignedInData;
var displayName;
var email;
var UID;
var userPhoto;
var latestUserInput;
var latestModelInput;

const db = getFirestore(app);
const storage = getStorage(app);
const userDataRef = ref(storage, "user");

export async function getUserId() {
  return UID;
}

export async function getUserPhoto(){
  return userPhoto;
}

export async function getDisplayName(){
  return displayName;
}
export async function getEmail(){
  return email;
}


export async function uploadSignInData(data) {
  SignedInData = data;
  UID = data.uid;
  displayName = data.displayName;
  email = data.email;
  userPhoto = data.photoURL;
}

export async function getResponce(title, userText) {
  if (!title || !userText) {
    return "Please provide a chatbot title";
  }
  const conv = getChatbot(title);
  try {
    const options = {
      method: "POST",
      body: JSON.stringify({
        history: conv,
        message: userText,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch("http://localhost:8080/Gemini", options);
    const data = await response.text();
    // console.log(data);

    const userInput = {
      role: "user",
      parts: [{ text: userText }],
    };

    const modelInput = {
      role: "model",
      parts: [{ text: data }],
    };
    latestUserInput = userInput;
    latestModelInput = modelInput;
    console.log(`latestUserInput from getResponce: ${JSON.stringify(latestUserInput)}`);
    console.log(`latestModelInput from getResponce: ${JSON.stringify(latestModelInput)}`);

    console.log(
      "This is the current converation title in getResponce function: " + JSON.stringify(title)
    );
    updateChatbot(title, userInput);
    updateChatbot(title, modelInput);
  } catch (error) {
    console.error(error);
    alert("Gemini Error");
  }
}

export async function getLatestUserMessage(){
  return latestUserInput;
}
export async function getLatestModelMessage(){
  alert(latestModelInput);
  return latestModelInput;
}

export function getChatbot(title) {
  const botObj = bot.find((b) => b.title === title);
  // currentConversations = botObj;
  if (!botObj) {
    // console.error(
    //   `Aman put this error: Conversation - No chatbot found for title: ${title}`
    // );
    return [];
  }
  // console.log(`returning to react:  + ${JSON.stringify(botObj.conversations)}`);
  return botObj.conversations;

  // return botObj.conversations;
} 
export async function addChatbot() {
  var currentTitles = await retrieveTitles();
    if (currentTitles.length == 0) {
      console.log("No conversation found");
      bot.push({
        title: "conversation 1",
        conversations: [],
      });
      return "conversation 1";
    }
    else{
      console.log("Conversation found!!");
      var newTitle = "conversation " + (currentTitles.length + 1);
      bot.push({
        title: newTitle,
        conversations: [],
      });
      return newTitle;
    }
}

export async function updateChatbot(title, newMessage) {
  console.log("This is the title from updateChatbot: " + title);
  console.log();

  const botObj = bot.find((b) => b.title === title);
  console.log(botObj);

  // previous if(botObj && UID)

  if (botObj) {
    botObj.conversations.push(newMessage);
    console.log(
      `This is the new conversation from updateChatBot: ${JSON.stringify(
        botObj.conversations
      )}`
    );

    // const jsonBob = new Blob([JSON.stringify(botObj.conversations)], {
    //   type: "application/json",
    // });

    // const storageRef = ref(storage, "collections/" + UID + ".json");

    // const result = await uploadBytes(storageRef, jsonBob);

    // console.log(
    //   `File ${result.metadata.name} uploaded to ${result.ref.fullPath}`
    // );

    return botObj.conversations;
  } else {
    // if (UID) {
    //   console.error(`No bot found with title: ${title}`);
    // } else {
    //   alert("User is not signed in" + "conversation.js(updateChatBot)");
    // }
    console.log("BotOBj is not found.");
  }
}

export async function retrieveTitles() {
  // var titles = [];
  // bot.forEach((b) => titles.push(b.title));

  // if (UID) {
  //   const fileRef = ref(storage, "collections/" + UID + ".json");

  //   try {
  //     alert("In Retrieve Titles function called");
  //     const url = await getDownloadURL(fileRef);
  //     const response = await fetch(url);
  //     const data = await response.json();
  //     console.log(data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // } else {
  // alert("NO UID in retrieve Titles");
  var titles = [];
  bot.forEach((b) => titles.push(b.title));
  return Array.isArray(titles) ? titles : [];
}

//Format of sending data
// {
//   "collections": {
//     "8URI9zt0fKUasiT1ouZSl10QHMe2": {
//       "name": "John Doe",
//       "email": "johndoe@example.com",
//       "conversations": {
//         "sessionID123": {
//           "timestamp": "2024-11-17T10:00:00Z",
//           "messages": [
//             {
//               "role": "user",
//               "parts": [
//                 { "text": "Hello!" }
//               ]
//             },
//             {
//               "role": "bot",
//               "parts": [
//                 { "text": "Hi there! How can I help you?" }
//               ]
//             }
//           ]
//         }
//       }
//     },
//     "userID456": {
//       "name": "Jane Smith",
//       "email": "janesmith@example.com",
//       "conversations": {
//         "sessionID456": {
//           "timestamp": "2024-11-17T10:10:00Z",
//           "messages": [
//             {
//               "role": "user",
//               "parts": [
//                 { "text": "What’s the weather like?" }
//               ]
//             },
//             {
//               "role": "bot",
//               "parts": [
//                 { "text": "It’s sunny today!" }
//               ]
//             }
//           ]
//         }
//       }
//     }
//   }
// }

// const converationConverted = new Uint8Array(botObj.conversations);
// uploadBytes(userDataRef, converationConverted).then((snapshot) => {
//   snapshot.forEach(function (ChildSnapshot) {
//     let userName = ChildSnapshot.val().u;
//   });
// });

/*
{
  user: {
    
  }

}



/*

[{"role":"user","parts":[{"text":"hi"}]},
{"role":"model","parts":[{"text":"Hi there! How can I help you today?\n"}]}
,{"role":"user","parts":[{"text":"hi"}]},
{"role":"model","parts":[{"text":"Hi again! What's up?\n"}]},
{"role":"user","parts":[{"text":"I don't like you"}]},
{"role":"model","parts":[{"text":"I understand.  I'm still under 
development, and I apologize if I haven't met your expectations. 
 Is there anything specific that I did or didn't do that made you
  feel that way?  Knowing that would help me improve.\n"}]}]*/

/*
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/images/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}*/
