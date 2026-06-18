import admin from "firebase-admin";
import 'dotenv/config';

let db = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log("✅ Firebase Admin Initialized");
  } else {
    console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT missing in .env. Firestore will be disabled.");
  }
} catch (error) {
  console.error("❌ Firebase Initialization Error:", error.message);
}

export default db;