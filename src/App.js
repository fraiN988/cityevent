import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import firebaseConfig from "./firebaseConfig";
import RegistrationForm from "./RegistrationForm";
import LoginForm from "./LoginForm";
import HomePage from "./HomePage";
import SimpleUser from "./SimpleUser";
import AdminPage from "./AdminPage";

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    firebase.initializeApp(firebaseConfig);

    const fetchData = async () => {
      const db = firebase.firestore();
      const data = await db
        .collection("events")
        .where("approved", "==", true)
        .get();
      setEvents(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    fetchData();
  }, []);

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<HomePage events={events} />} />
          <Route path="/homepage" element={<HomePage events={events} />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/simpleuser" element={<SimpleUser />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
