import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDb_h83NVm_3t5wHLCIdQk_Z7lxjrU4Z8A",
  authDomain: "cityevents-da771.firebaseapp.com",
  projectId: "cityevents-da771",
  storageBucket: "cityevents-da771.appspot.com",
  messagingSenderId: "615435212563",
  appId: "1:615435212563:web:bf8586f0a847caa18b2ce6",
};
export default firebaseConfig;
const app = initializeApp(firebaseConfig);
