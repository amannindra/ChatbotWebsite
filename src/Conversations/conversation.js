import { app } from "../firebase/FireBase";
// import { getDownloadURL, getStorage, ref, uploadBytes, listAll, deleteObject } from "firebase/storage";

import {
  getDatabase,
  ref,
  set,
  onValue,
  get,
  child,
  push,
  update,
  query,
  orderByChild,
} from "firebase/database";

import { v4 as uuidv4 } from "uuid";
import { getFirestore, snapshotEqual } from "firebase/firestore";

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
export async function getUserPhoto() {
  return userPhoto;
}
export async function getDisplayName() {
  return displayName;
}
export async function getEmail() {
  return email;
}

async function getUserExists(uid) {
  const db = getDatabase();
  get(child(ref(db), `/users/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        return Object.keys(snapshot.val()).includes(uid);
      }
    })
    .catch((error) => {
      console.error(error);
      return false;
    });

  return false;
}

export async function uploadSignInData(data) {
  const db = getDatabase();

  const userDataBase = {};

  if (!getUserExists(data.uid)) {
    console.log("User doesn't exists");
    userDataBase[`/users/${data.uid}`] = {
      displayName: data.displayName,
      email: data.email,
      photoURL: data.photoURL,
    };

    update(ref(db), userDataBase)
      .then(() => {
        console.log("User data uploaded successfully!");
      })
      .catch((error) => {
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

export async function getResponce(conversationId, userText) {
  if (!conversationId || !userText) {
    return "Please provide a chatbot title";
  }
  const conv = await getChatbot(conversationId);
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
    // console.log("options: " + JSON.stringify(options));
    // console.log("type options: " + typeof options);
    const response = await fetch("http://localhost:8080/Gemini", options);
    const data = await response.text();
    // console.log(data);

    updateChatbot(conversationId, userText, data);
    return data;
  } catch (error) {
    console.error(error);
    alert("Gemini Error");
  }
}

export async function getChatbot(conversationId) {
  const db = getDatabase();
  const conversation = [];

  try {
    const snapshot = await get(child(ref(db), `messages/${conversationId}`));

    if (snapshot.exists()) {
      const value = snapshot.val();
      const messageUUIDS = Object.keys(value);

      // console.log(`MessageUUIDS: ${JSON.stringify(messageUUIDS)}`);

      for (const eachMessage of messageUUIDS) {
        // console.log(`eachMessage: ${eachMessage}`);
        const message = value[eachMessage];

        const text = message.text;
        const role = message.role;
        const timestamp = message.timestamp;

        // console.log(`text: ${text}`);
        // console.log(`role: ${role}`);
        // console.log(`timestamp: ${timestamp}`);

        const Input = {
          role: role,
          parts: [{ text: text }],
        };
        conversation.push(Input);
      }
      // console.log(`Returning conversation: ${JSON.stringify(conversation)}`);
      return conversation;
    } else {
      console.log("Snapshot doesn't exist");
      return conversation;
    }
  } catch (error) {
    console.error("Error retrieving chatbot messages:", error);
    return conversation;
  }
}

export async function addChatbot3() {
  const timestamps = Date.now();
  const db = getDatabase();

  const serialNumber = uuidv4();
  const messageSerialNumber = uuidv4();

  console.log("Serial Number: " + serialNumber);

  const updateConversationInUser = {};
  updateConversationInUser[
    `/users/${UID}/conversations/${serialNumber}`
  ] = true;

  update(ref(db), updateConversationInUser)
    .then(() => {
      console.log("User conversation appended successfully!");
    })
    .catch((error) => {
      console.error("Error appending conversation:", error);
    });

  const updateConversation = {};

  updateConversation[`/conversations/${serialNumber}`] = {
    title: "New Chat Title",
    timestamp: timestamps,
    userId: UID,
  };

  update(ref(db), updateConversation)
    .then(() => {
      console.log("Conversation title  appended successfully!");
    })
    .catch((error) => {
      console.error("Error appending chat message: ", error);
    });

  const updateMessageInConversation = {};

  updateMessageInConversation[
    `/messages/${serialNumber}/${messageSerialNumber}`
  ] = {};

  update(ref(db), updateMessageInConversation)
    .then(() => {
      console.log("Chat message appended successfully!");
    })
    .catch((error) => {
      console.error("Error appending chat message: ", error);
    });

  return [serialNumber, "New Chat Title"];
}

export async function updateChatbot(conversationId, userMessage, modelMessage) {
  const db = getDatabase();
  const userMessageSerialNumber = uuidv4();
  const usertimestamps = Date.now();

  const updateUserMessageInConversation = {};

  updateUserMessageInConversation[
    `/messages/${conversationId}/${userMessageSerialNumber}`
  ] = {
    role: "user",
    text: userMessage,
    timestamp: usertimestamps,
  };

  const aiMessageSerialNumber = uuidv4();
  const aitimestamps = Date.now();

  const updateAiMessageInConversation = {};

  updateAiMessageInConversation[
    `/messages/${conversationId}/${aiMessageSerialNumber}`
  ] = {
    role: "model",
    text: modelMessage,
    timestamp: aitimestamps,
  };

  update(ref(db), updateUserMessageInConversation)
    .then(() => {
      console.log("User message appended successfully!");
    })
    .catch((error) => {
      console.error("Error appending chat message: ", error);
    });

  update(ref(db), updateAiMessageInConversation)
    .then(() => {
      console.log("AI message appended successfully!");
    })
    .catch((error) => {
      console.error("Error appending chat message: ", error);
    });
}

export async function deleteConveration(conversationId) {
  console.log("deleting conversation");
  const db = getDatabase();

  try {
    await set(ref(db, `/users/${UID}/conversations/${conversationId}`), false);
    console.log(`conversation ${conversationId} set to false`);
  } catch (error) {
    console.error("Error deleting Conversation: " + conversationId);
  }
}

export async function retrieveTitles() {
  const db = getDatabase();
  let conversationIds = [];
  let titles = [];
  // Step 1: Retrieve conversation IDs
  try {
    const snapshot = await get(child(ref(db), `users/${UID}/conversations`));
    if (snapshot.exists()) {
      const snap = snapshot.val();
      for (const key in snap) {
        if (snap[key]) {
          conversationIds.push(key);
        }
      }
      // console.log("Conversation IDs:", conversationIds);
    } else {
      console.log("No data available");
      return [];
    }
  } catch (error) {
    console.error("Error fetching conversation IDs:", error);
    return [];
  }

  // Step 2: Retrieve titles for each conversation ID

  let ConversationIdAndTitles = [];

  try {
    for (const conversationId of conversationIds) {
      const conversationSnapshot = await get(
        child(ref(db), `conversations/${conversationId}`)
      );
      if (conversationSnapshot.exists()) {
        const title = conversationSnapshot.val().title; // Assuming 'title' is stored in the conversation object
        titles.push(title); // Add the title to the array
        ConversationIdAndTitles.push([conversationId, title]);
      } else {
        console.log(`No data available for conversation ID: ${conversationId}`);
      }
    }
  } catch (error) {
    console.error("Error fetching conversation titles:", error);
  }

  console.log("[ConversationIds, Titles]:", ConversationIdAndTitles);
  return ConversationIdAndTitles; // Return the array of titles
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
