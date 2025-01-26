import { app } from "../firebase/FireBase";
// import { getDownloadURL, getStorage, ref, uploadBytes, listAll, deleteObject } from "firebase/storage";

import { getDatabase, ref, set, onValue, get, child, push, update } from "firebase/database";

import { v4 as uuidv4 } from "uuid";
import {
  getFirestore,
} from "firebase/firestore";

var SignedInData;
var displayName;
var email;
var UID;
var userPhoto;

// const storage = getStorage(app);

const database = getDatabase(app);

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

async function getUserExists(uid){
  const db = getDatabase();
  get(child(ref(db), `/users/`)).then((snapshot) => {
    if (snapshot.exists()) {
      return Object.keys(snapshot.val()).includes(uid);
    }
  }).catch((error) => {
    console.error(error);
    return false;
  });

  return false;

}


export async function uploadSignInData(data) {

  const db = getDatabase();

  const userDataBase = {};

  if(!getUserExists(data.uid)){
    console.log("User doesn't exists");
    userDataBase[`/users/${data.uid}`] = {
      displayName: data.displayName,
      email: data.email,
      photoURL: data.photoURL,
    };

    update(ref(db), userDataBase)
    .then(() => {
      console.log("User data uploaded successfully!");
    }).catch((error) => {
      console.error("Error uploading user data from userSignIn: ", error);
    });
  }


 SignedInData = data;
 displayName = data.displayName;
 email = data.email;
 UID = data.uid;
 console.log("Signed in as: " + UID);
 userPhoto = data.photoURL;

}

export async function getResponce(title, userText) {
  if (!title || !userText) {
    return "Please provide a chatbot title";
  }
  const conv = await getChatbot(title);
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
    console.log("options: " + JSON.stringify(options));
    console.log("type options: " + typeof options);
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

    updateChatbot(title, userInput, modelInput);
    return data;
  } catch (error) {
    console.error(error);
    alert("Gemini Error");
  }
}

export async function getChatbot(title) {
  try{
    const storageRef = ref(storage, "collections/" + UID + "/" + title);
    const url = await getDownloadURL(storageRef); 
    const response = await fetch(url); 
    const result = await response.json();
    console.log("getChatbot return: " + JSON.stringify(result));  
    return result;
  } catch(error){
    console.log(error);
    return [];
  }
 
} 

export async function getChatBot2(title) {
  const dbRef = ref(getDatabase());
  get(child(dbRef, `users/${UID}`)).then((snapshot) => {
  if (snapshot.exists()) {
    console.log(snapshot.val());
  } else {
    console.log("No data available om getchatbot2");
  }
  }).catch((error) => {
    console.error(error);
  });
}


export async function addChatbot3() {
    const timestamps = Date.now();
    const db = getDatabase();

    const serialNumber = uuidv4(); 
    const messageSerialNumber = uuidv4();

    console.log("Serial Number: " + serialNumber);

    const updateConversationInUser = {};
    updateConversationInUser[`/users/${UID}/conversations/${serialNumber}`] = true;

    update(ref(db), updateConversationInUser)
    .then(() => {
      console.log("User conversation appended successfully!");
    })
    .catch((error) => {
      console.error("Error appending conversation:", error);
    });


    const updateConversation = {};

    updateConversation[`/conversations/${serialNumber}`] = {title: "New Chat Title",
      timestamp: timestamps,
      userId: UID,
      lastMessage: "This is the latest message!"
    };

    update(ref(db), updateConversation)
    .then(() => {
      console.log("Conversation title  appended successfully!");
    })
    .catch((error) => {
      console.error("Error appending chat message: ", error);
    });

    const updateMessageInConversation = {};

    updateMessageInConversation[`/messages/${serialNumber}/${messageSerialNumber}`] = {  
      role: "user",
      text: "Hello, I am a user!",
      timestamp: timestamps
    };

    update(ref(db), updateMessageInConversation)
    .then(() => {
      console.log("Chat message appended successfully!");
    }).catch((error) => {
      console.error("Error appending chat message: ", error);
    });
    return timestamps
}

export async function updateChatbot(title, userMessage, modelMessage) {
  var converation = await getChatbot(title);
  console.log("(getChatbot to updateChatbot): " + converation);
  const storageRef = ref(storage, "collections/" + UID + "/" + title);
  var blob = new Blob([JSON.stringify([...converation, userMessage, modelMessage])], {type: "application/json"});
  await uploadBytes(storageRef, blob);
  console.log("Uploaded the new conversation: " + title);
}

export async function updateChatbot2(title, userMessage, modelMessage) {

}

export async function retrieveTitles() {
  var getTitles = [];
  const db = getDatabase();

  await get(child(ref(db), `users/${UID}/conversations`)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log("Titles: " + Object.keys(snapshot.val()));
      getTitles = (Object.keys(snapshot.val()));
    }
    else {
      console.log("No data available");
  
    }
  }).catch((error) => {
    console.error(error);

  });

  if(Array.isArray(getTitles)){
    console.log("It is an array");
  }

  return getTitles;
}








// export async function addChatbot() {
//   var currentTitles = await retrieveTitles();
//     console.log("Current Titles: " + currentTitles);
//     if (currentTitles.length == 0 && UID) {
//       const path = "collections/" + UID + "/" + "conversation 1";
//       const storageRef = ref(storage, path);
//       await uploadBytes(storageRef, new Blob([JSON.stringify([])], {type: "application/json"}))
//       .then((snapshot) => { 
//         console.log("Uploaded the first conversation: " + path);
      
//       });
//       return "conversation 1";
//     }
//     else{ 
//       if(!UID){
//         console.log("(addchatbot) User is not signed in");
//         return;
//       }
//       console.log("Conversation found!!");
//       var newTitles = "conversation " + (currentTitles.length + 1);
//       // alert("New Title and UID: " + newTitles, UID);
//       const path = "collections/" + UID + "/" + newTitles;
//       const storageRef = ref(storage, path);
//       await uploadBytes(storageRef, new Blob([JSON.stringify([])], {type: "application/json"}))
//       .then((snapshot) => {
//         console.log("Uploaded a new conversation: " + path);
        
//       });
//       return newTitles;
//     }
// }



// export async function deleteConveration(title){
//   const storageRef = ref(storage, "collections/" + UID + "/" + title);
//   console.log("Deleting the conversation: " + title);
//   deleteObject(storageRef).then(() => {
//     console.log("Deleted the conversation: " + title);
    
//   }).catch((error) => {
//     console.error(error);
//     // alert("Error deleting the conversation: " + title);
//   });
// }

// export async function checkIfUserIsPresent(){
//   console.log("Checking if user is present");
//   const userFolder = ref(storage, "collections");

//   listAll(userFolder).then((res)=>
//   {
//     res.prefixes. forEach((folderRef) => {
//       if(folderRef.name == UID){
//         return true;
//       }
//     });  
//   }).catch((error) => {
//     console.error(error);
//   });