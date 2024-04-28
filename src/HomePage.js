import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage({ events }) {
  return (
    <div className="homepage-container">
      <h2 className="homepage-heading">City Events Homepage</h2>
      <div className="button-container">
        <Link to="/register" className="button">
          Register
        </Link>
        <Link to="/login" className="button">
          Login
        </Link>
      </div>

      <h2>Upcoming Events</h2>
      <ul className="events">
        {events &&
          events.map((event) => (
            <li key={event.id} className="event-item">
              <div>
                <span className="event-name">{event.name}</span>
                <span className="event-details">
                  {event.place && ` - ${event.place}`}
                  {event.time instanceof Date
                    ? ` - ${event.time.toLocaleString()}`
                    : " - Unknown time"}{" "}
                  - {event.category}
                </span>
                {event.photoUrl && (
                  <img
                    src={event.photoUrl}
                    alt="Event"
                    className="event-photo"
                  />
                )}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default HomePage;
