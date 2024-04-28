import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "./AdminPage.css";

function AdminPage() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const db = firebase.firestore();
      const eventsData = await db.collection("events").get();
      setEvents(eventsData.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

      const usersData = await db.collection("users").get();
      setUsers(usersData.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    fetchData();
  }, []);

  const approveEvent = async (eventId) => {
    const db = firebase.firestore();
    await db.collection("events").doc(eventId).update({ approved: true });
    setMessage("Event approved successfully.");
  };

  const deleteEvent = async (eventId) => {
    const db = firebase.firestore();
    await db.collection("events").doc(eventId).delete();
    setEvents(events.filter((event) => event.id !== eventId));
    setMessage("Event deleted successfully.");
  };

  const blockUser = async (userId) => {
    const db = firebase.firestore();
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      await userRef.update({ blocked: true });
      setMessage(`User ${userData.email} has been blocked.`);
    } else {
      setMessage("User not found.");
    }
  };

  const unblockUser = async (userId) => {
    const db = firebase.firestore();
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({ blocked: false });
      setMessage(`User ${userDoc.data().email} has been unblocked.`);
    } else {
      setMessage("User not found.");
    }
  };

  const enterCategory = async (categoryName) => {
    const db = firebase.firestore();
    await db.collection("categories").add({ name: categoryName });
    setMessage(`Category "${categoryName}" has been added.`);
  };

  return (
    <div className="admin-container">
      {message && <div className="message">{message}</div>}
      <h2>Events</h2>
      <ul className="admin-list">
        {events.map((event) => (
          <li key={event.id} className="admin-item">
            {event.name} - {event.place} -{" "}
            {event.time instanceof Date
              ? event.time.toLocaleString()
              : "Unknown time"}{" "}
            - {event.category}
            {!event.approved && (
              <button
                className="approve-button"
                onClick={() => approveEvent(event.id)}
              >
                Approve
              </button>
            )}
            <button
              className="delete-button"
              onClick={() => deleteEvent(event.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <h2>Users</h2>
      <ul className="admin-list">
        {users.map((user) => (
          <li key={user.id} className="admin-item">
            {user.email} - {user.blocked ? "Blocked" : "Active"}
            {!user.blocked && (
              <button
                className="block-button"
                onClick={() => blockUser(user.id)}
              >
                Block
              </button>
            )}
            {user.blocked && (
              <button
                className="unblock-button"
                onClick={() => unblockUser(user.id)}
              >
                Unblock
              </button>
            )}
          </li>
        ))}
      </ul>
      <h2>Enter Category</h2>
      <button
        className="enter-category-button"
        onClick={() => enterCategory("New Category")}
      >
        Enter New Category
      </button>
    </div>
  );
}

export default AdminPage;
