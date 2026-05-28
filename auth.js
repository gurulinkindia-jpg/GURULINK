// auth.js (COMMON SECURITY FILE)

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import { getDatabase, ref, get } 
from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
apiKey:"AIzaSyBK0QmU6y1wDlZkna2ciE-tf-P8pZAjhBk",
authDomain:"gurulink-59cc7.firebaseapp.com",
databaseURL:"https://gurulink-59cc7-default-rtdb.asia-southeast1.firebasedatabase.app",
projectId:"gurulink-59cc7",
storageBucket:"gurulink-59cc7.appspot.com",
messagingSenderId:"112148672399",
appId:"1:112148672399:web:f5fe5cd6e5c5ef4382e5fa"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

/* 🔐 CHECK LOGIN */
export function requireLogin(allowedRoles = []){

onAuthStateChanged(auth, async (user)=>{

if(!user){
window.location.href = "login.html";
return;
}

const snap = await get(ref(db,"users/"+user.uid));

if(!snap.exists()){
window.location.href = "login.html";
return;
}

const role = snap.val().role;

/* role protection */
if(allowedRoles.length > 0 && !allowedRoles.includes(role)){
alert("Access Denied");
window.location.href = "login.html";
}

});
}

/* 🚪 LOGOUT */
export function logout(){
signOut(auth);
window.location.href = "login.html";
}