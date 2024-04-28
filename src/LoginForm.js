import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "./LoginForm.css";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [notification, setNotification] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await firebase
        .auth()
        .signInWithEmailAndPassword(email, password);

      const userData = await firebase
        .firestore()
        .collection("users")
        .doc(userCredential.user.uid)
        .get();

      const userRole = userData.data().role;

      if (userRole === "simpleUser") {
        navigate("/simpleuser");
        setNotification("Login successful. Redirecting to Simple User page.");
      } else {
        navigate("/admin");
        setNotification("Login successful. Redirecting to Admin page.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setNotification("Invalid email or password. Please try again.");
    }
  };

  return (
    <div>
      {notification && <div className="notification">{notification}</div>}
      <form className="login-form" onSubmit={handleLogin}>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login-button" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
