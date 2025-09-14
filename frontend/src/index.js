import React from "react";
import ReactDOM  from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyBNFo3KFNNimktIqW2vqePRcKAIp0n8HWs",
    authDomain: "the-library-9a27f.firebaseapp.com",
    projectId: "the-library-9a27f",
    storageBucket: "the-library-9a27f.appspot.com",
    messagingSenderId: "961816849035",
    appId: "1:961816849035:web:943fa4a052132b72e3428e"
  };






const divPrincipal=document.getElementById("root")

const root=ReactDOM.createRoot(divPrincipal)
initializeApp(firebaseConfig);




root.render(<App/>)