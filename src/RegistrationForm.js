import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "./RegistrationForm.css"; // Import CSS file

function RegistrationForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, password);

      await firebase
        .firestore()
        .collection("users")
        .doc(userCredential.user.uid)
        .set({
          email: email,
          role: role,
        });

      console.log("Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error("Error registering:", error);
      let errorMessage =
        "An error occurred during registration. Please try again later.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already in use. Please choose another one.";
      } else if (error.code === "auth/weak-password") {
        errorMessage =
          "The password is too weak. Please choose a stronger one.";
      }
      setError(errorMessage);
    }
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <form className="registration-form" onSubmit={handleRegister}>
        <input
          className="registration-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="registration-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="registration-select"
          value={role}
          onChange={handleRoleChange}
        >
          <option value="admin">Admin</option>
          <option value="simpleUser">Simple User</option>
        </select>
        <button className="registration-button" type="submit">
          Register
        </button>
      </form>
    </div>
  );
}

export default RegistrationForm;
