import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeApp, getApps } from "firebase/app";

// Forcefully adding config here to kill the 'invalid-api-key' error
const firebaseConfig = {
  apiKey: "AIzaSyCP0wFh-p011sqfU1KWy6lUchy2H-tffhg",
  authDomain: "saferoute-b5042.firebaseapp.com",
  projectId: "saferoute-b5042",
  storageBucket: "saferoute-b5042.firebasestorage.app",
  messagingSenderId: "166772342602",
  appId: "1:166772342602:web:2518965f5fc57598bc8bb3"
};

// Initialize Firebase before the App renders
try {
  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
    console.log("Firebase initialized in main.jsx");
  }
} catch (err) {
  console.error("Firebase init error:", err);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)