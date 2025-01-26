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
//   return false;
// }

export async function uploadSignInData(data) {

  const db = getDatabase();

  set(ref(db, "users/" + data.uid), {
    displayName: data.displayName,
    email: data.email,
    photoURL: data.photoURL,
  })
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



export async function addChatbot2() {

  if(UID){
    var currentTitles = await retrieveTitles();

    const timestamp = new Date().toISOString();

    // displayName = generateUUID();

    const path = `collections/${UID}/${timestamp}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, new Blob([JSON.stringify([])], { type: "application/json" }))
      .then(() => {
        console.log("Uploaded a new conversation: " + path);
      })
      .catch((error) => {
        console.error("Error uploading conversation: ", error);
      });

    return timestamp;
  }
  console.log("User is not signed in");
}

export async function addChatbot3() {
  // if(UID){
  //   const timestamps = new Date().toISOString();
  //   const db = getDatabase();
  //   const path = `collections/${UID}/`;

  //   const postEntry = {
  //     author : "Aman",
  //     uid: UID,
  //     body: "Body",
  //     title: "title",
  //     starCount: 0,
  //     authorPic: "picture"
  //   }

  //   const newPostKey = push(child(ref(db), 'posts')).key;
    
  //   const updates = {};
  //   updates['/chats/' + newPostKey] = postEntry;
  //   updates['/user-posts/' + UID + '/' + newPostKey] = postEntry;
  //   return timestamps
  // }
  // else{
  //   console.log("User is not signed in: " + UID);
  // }
    const timestamps = new Date().toISOString();
    const db = getDatabase();
   
    set(ref(db, '/chats'), { 

      


      title: "New Chat Title",
      message: "This is the latest message!",
      timestamp: timestamps
    })
    .then(() => {
      console.log("Chat message appended successfully!");
    })
    .catch((error) => {
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

export async function retrieveTitles() {
  let getAllTitles = [];
  // const userFolder = ref(storage, "collections/" + UID);
  // await listAll(userFolder).then((res)=>{
  //   res.items.forEach((itemRef) => {
  //     getAllTitles.push(itemRef.name);
  //   });
  // }
  // );
  const dbRef = ref(getDatabase());
  get(child(dbRef, `chats`)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });


  getAllTitles.sort((a, b) => b.localeCompare(a));
  return getAllTitles;
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
