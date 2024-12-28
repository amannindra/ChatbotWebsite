import { app } from "../firebase/FireBase";
import { getDownloadURL, getStorage, ref, uploadBytes, listAll } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import {
  getFirestore,
} from "firebase/firestore";

var SignedInData;
var displayName;
var email;
var UID;
var userPhoto;

const storage = getStorage(app);

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


export async function deleteConveration(title){
  const storageRef = ref(storage, "collections/" + UID + "/" + title);
  deleteObject(storageRef).then(() => {
    console.log("Deleted the conversation: " + title);
  }).catch((error) => {
    console.error(error);
  });
}

export async function checkIfUserIsPresent(){
  console.log("Checking if user is present");
  const userFolder = ref(storage, "collections");

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
export async function addChatbot() {
  var currentTitles = await retrieveTitles();
    console.log("Current Titles: " + currentTitles);
    if (currentTitles.length == 0 && UID) {
      const path = "collections/" + UID + "/" + "conversation 1";
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, new Blob([JSON.stringify([])], {type: "application/json"}))
      .then((snapshot) => {
        console.log("Uploaded the first conversation: " + path);
      
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
      await uploadBytes(storageRef, new Blob([JSON.stringify([])], {type: "application/json"}))
      .then((snapshot) => {
        console.log("Uploaded a new conversation: " + path);
        
      });
      return newTitles;
    }
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
  const userFolder = ref(storage, "collections/" + UID);
  await listAll(userFolder).then((res)=>{
    res.items.forEach((itemRef) => {
      getAllTitles.push(itemRef.name);
    });
  }
  );
  return getAllTitles;
}
