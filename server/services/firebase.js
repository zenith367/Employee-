const path = require("path");
const admin = require("firebase-admin");
require("dotenv").config();

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // Use the JSON string from environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  console.log("Using Firebase service account from environment variable");
} else {
  // Fallback to file path
  const serviceAccountPath = path.resolve(
    __dirname,  // services folder
    "../",      // go up to server root
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "serviceAccountKey.json"
  );
  console.log("Using Firebase service account at:", serviceAccountPath);
  serviceAccount = require(serviceAccountPath);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin initialized successfully");
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
