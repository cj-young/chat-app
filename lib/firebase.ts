import { initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import sharp from "sharp";
import { v4 } from "uuid";

import "server-only";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export async function uploadServerImage(serverFile: File) {
  const bytes = await serverFile.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const serverImage = await sharp(buffer).resize(400, 400).jpeg().toBuffer();
  const metadata = { contentType: "image/jpeg" };

  const serverImageRef = ref(storage, `server-pictures/${v4()}`);
  const snapshot = await uploadBytes(serverImageRef, serverImage, metadata);
  const downloadUrl = await getDownloadURL(serverImageRef);
  return downloadUrl;
}
