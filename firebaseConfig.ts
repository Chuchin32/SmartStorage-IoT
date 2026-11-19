import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "smartstorage-iot-default-rtdb.firebaseapp.com",
  databaseURL: "https://smartstorage-iot-default-rtdb.firebaseio.com",
  projectId: "smartstorage-iot",
  storageBucket: "smartstorage-iot.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);