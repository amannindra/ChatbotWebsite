import { app } from "../firebase/FireBase";
import { getDownloadURL, getStorage, ref, uploadBytes, listAll } from "firebase/storage";
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
import cors from "cors";
import { useId } from "react";


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

export async function checkIfUserIsPresent(){
  console.log("Checking if user is present");
  const userFolder = ref(storage, "collections");
  
  //items are individual files
  //prefixes are folders
  listAll(userFolder).then((res)=>
  {
    res.prefixes. forEach((folderRef) => {
      if(folderRef.name == UID){
        return true;
      }
    });  
  }).catch((error) => {
    console.error(error);
  });
  return false;
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
  return latestModelInput;
}

export function getChatbot(title) {
  const storageRef = ref(storage, "collections/" + UID + "/" + title);
    console.log("StorageRef: collections/" + UID + "/" + title);
    getDownloadURL(storageRef).then((url) => {
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          return data;
        });
    }).catch((error) => {
      console.error(error);
      switch (error.code) {
        case 'storage/object-not-found':
          // File doesn't exist
          break;
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          break;
        case 'storage/canceled':
          // User canceled the upload
          break;
        // ...
        case 'storage/unknown':
          // Unknown error occurred, inspect the server response
          break;
      }
    });
    return [];
   

    //  const botObj = bot.find((b) => b.title === title);
    // if (!botObj) {
      
    //   return [];
    // }
    // return botObj.conversations;

} 
export async function addChatbot() {
  var currentTitles = await retrieveTitles();
    console.log("Current Titles: " + currentTitles);
    if (currentTitles.length == 0 && UID) {
      const path = "collections/" + UID + "/" + "conversation 1";
      const storageRef = ref(storage, path);
      const result = await uploadBytes(storageRef, new Blob([JSON.stringify([])], {type: "application/json"}))
      .then((snapshot) => {
        console.log("Uploaded the first conversation: " + path);
      
      });
      console.log("No conversation found");
      bot.push({
        title: "conversation 1",
        conversations: [],
      });
      return "conversation 1";
    }
    else{
      if(!UID){
        console.log("(addchatbot) User is not signed in");
        return;
      }
      console.log("Conversation found!!");
      var newTitles = "conversation " + (currentTitles.length + 1);
      // alert("New Title and UID: " + newTitles, UID);
      const path = "collections/" + UID + "/" + newTitles;
      const storageRef = ref(storage, path);
      const result = await uploadBytes(storageRef, new Blob([JSON.stringify([])], {type: "application/json"}))
      .then((snapshot) => {
        console.log("Uploaded a new conversation: " + path);
        
      });
      bot.push({
        title: newTitles,
        conversations: [],
      });
      return newTitles;
    }
}

export async function updateChatbot(title, newMessage) {
  console.log("This is the title from updateChatbot: " + title);
  console.log();

  const botObj = bot.find((b) => b.title === title);
  console.log(botObj);
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
  let getAllTitles = [];
  console.log("UID: " + UID);
  console.log("Display Name:" + displayName);
  console.log("Email: " + email);
  const userFolder = ref(storage, "collections/" + UID);
  await listAll(userFolder).then((res)=>{
    res.items.forEach((itemRef) => {
      console.log("All Items: " + itemRef.name);
      getAllTitles.push(itemRef.name);
    });
  }
  );
  console.log("Titles: " + getAllTitles);
  return getAllTitles;
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
