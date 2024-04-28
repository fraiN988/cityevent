import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./SimpleUser.css";

function SimpleUser() {
  const [user, setUser] = useState(null);
  const [eventName, setEventName] = useState("");
  const [eventPlace, setEventPlace] = useState("");
  const [eventTime, setEventTime] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [eventPhoto, setEventPhoto] = useState(null);
  const [events, setEvents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [editEventData, setEditEventData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const categories = [
    "Sports",
    "Party",
    "Music",
    "Food & Drink",
    "Arts & Culture",
    "Fitness",
    "Tech",
    "Education",
    "Networking",
    "Other",
  ];

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
    });

    fetchData();
  }, []);

  const fetchData = async () => {
    const db = firebase.firestore();
    const data = await db
      .collection("events")
      .where("approved", "==", true)
      .get();
    const eventsData = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    console.log("Fetched Events:", eventsData);
    setEvents(eventsData);
  };

  const handleEventTimeChange = (date) => {
    setEventTime(date);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setEventPhoto(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.blocked) {
      setNotifications(["Blocked users cannot post events."]);
      return;
    }

    const storageRef = firebase.storage().ref();

    if (eventPhoto) {
      const fileRef = storageRef.child(eventPhoto.name);
      await fileRef.put(eventPhoto);
      const fileUrl = await fileRef.getDownloadURL();
      await firebase
        .firestore()
        .collection("events")
        .add({
          name: eventName,
          place: eventPlace,
          time: new Date(eventTime),
          category: selectedCategory,
          photoUrl: fileUrl,
          createdBy: user.uid,
          approved: false,
          upvotes: 0,
        });
    } else {
      await firebase
        .firestore()
        .collection("events")
        .add({
          name: eventName,
          place: eventPlace,
          time: new Date(eventTime),
          category: selectedCategory,
          createdBy: user.uid,
          approved: false,
          upvotes: 0,
        });
    }

    setEventName("");
    setEventPlace("");
    setEventTime(new Date());
    setSelectedCategory("");
    setEventPhoto(null);

    fetchData();
    setNotifications([
      "Event created successfully. Waiting for admins approval!",
    ]);
  };

  const handleDelete = async (id) => {
    const db = firebase.firestore();
    const eventRef = db.collection("events").doc(id);
    const event = await eventRef.get();
    if (event.exists) {
      const eventData = event.data();
      if (user && eventData.createdBy === user.uid) {
        await eventRef.delete();
        setEvents(events.filter((event) => event.id !== id));
        setNotifications(["Event deleted successfully."]);
      } else {
        setNotifications(["You can only delete your own events."]);
      }
    }
  };

  const handleEdit = (eventId) => {
    const eventToEdit = events.find((event) => event.id === eventId);
    // Check if the current user is the creator of the event
    if (user && eventToEdit && eventToEdit.createdBy === user.uid) {
      setEditEventData(eventToEdit);
      setEditEventId(eventId);
      setIsEditing(true);
    } else {
      setNotifications(["You can only edit your own events."]);
    }
  };

  const handleSaveEdit = async () => {
    const db = firebase.firestore();
    await db.collection("events").doc(editEventId).update({
      name: eventName,
      place: eventPlace,
      time: eventTime,
      category: selectedCategory,
    });
    setIsEditing(false);
    setEditEventId(null);
    setEditEventData(null);

    fetchData();
    setNotifications(["Event edited successfully."]);
  };

  const handleLike = async (eventId) => {
    if (!user) {
      setNotifications(["Please sign in to like events."]);
      return;
    }

    const db = firebase.firestore();
    const eventRef = db.collection("events").doc(eventId);

    const eventSnapshot = await eventRef.get();
    const eventData = eventSnapshot.data();

    if (eventData.likes && eventData.likes[user.uid]) {
      await eventRef.update({
        upvotes: firebase.firestore.FieldValue.increment(-1),
        [`likes.${user.uid}`]: firebase.firestore.FieldValue.delete(),
      });
    } else {
      await eventRef.update({
        upvotes: firebase.firestore.FieldValue.increment(1),
        [`likes.${user.uid}`]: true,
      });
    }

    fetchData();
    setNotifications(["Liked event successfully."]);
  };

  return (
    <div className="container">
      {notifications.map((notification, index) => (
        <div key={index} className="notification">
          {notification}
        </div>
      ))}
      {user && !user.blocked && (
        <div>
          <h2>Create Event</h2>
          <form className="form" onSubmit={handleSubmit}>
            <div>
              <label>Event Name:</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>
            <div>
              <label>Event Place:</label>
              <input
                type="text"
                value={eventPlace}
                onChange={(e) => setEventPlace(e.target.value)}
              />
            </div>
            <div>
              <label>Select Event Time:</label>
              <DatePicker
                selected={eventTime}
                onChange={handleEventTimeChange}
                showTimeSelect
                timeFormat="HH:mm"
                dateFormat="MMMM d, yyyy h:mm aa"
              />
            </div>
            <div>
              <label>Select Category:</label>
              <select value={selectedCategory} onChange={handleCategoryChange}>
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Event Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>
            <button type="submit">Create Event</button>
          </form>
        </div>
      )}

      <h2>Events</h2>
      <ul className="events">
        {events.map((event) => (
          <li key={event.id}>
            <div className="event-card">
              <div>
                <span className="event-details">
                  {event.name} - {event.place} -{" "}
                  {event.time ? event.time.toDate().toLocaleString() : ""} -{" "}
                  {event.category}
                </span>
                {event.photoUrl && (
                  <img
                    src={event.photoUrl}
                    alt="Event"
                    className="event-photo"
                  />
                )}
              </div>
              {user && (
                <div className="button-container">
                  <button onClick={() => handleEdit(event.id)}>Edit</button>
                  <button onClick={() => handleDelete(event.id)}>Delete</button>
                  <button
                    onClick={() => handleLike(event.id)}
                    className={
                      event.likes && event.likes[user.uid] ? "liked" : ""
                    }
                  >
                    <span role="img" aria-label="Upvote">
                      ❤️
                    </span>
                  </button>
                  <span className="upvote-count">{event.upvotes}</span>
                </div>
              )}
            </div>
            {isEditing && editEventId === event.id && (
              <div className="edit-form">
                <h3>Edit Event</h3>
                <form onSubmit={handleSaveEdit}>
                  <div>
                    <label>Event Name:</label>
                    <input
                      type="text"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Event Place:</label>
                    <input
                      type="text"
                      value={eventPlace}
                      onChange={(e) => setEventPlace(e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Event Time:</label>
                    <DatePicker
                      selected={eventTime}
                      onChange={handleEventTimeChange}
                      showTimeSelect
                      timeFormat="HH:mm"
                      dateFormat="MMMM d, yyyy h:mm aa"
                    />
                  </div>
                  <div>
                    <label>Category:</label>
                    <select
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit">Save</button>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SimpleUser;
