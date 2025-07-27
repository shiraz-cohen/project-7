import { Outlet, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";
import {
  faTrashCan,
  faCommentDots,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../App.css";

const UnusualEvents = () => {
  var currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const [events, setEvents] = useState([]);
  const [copyEvents, setCopyEvents] = useState([]);
  const [searchEventName, setSearchEventName] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEventTypeOpen, setIsEventTypeOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState("");
  const [updatedEvent, setUpdatedEvent] = useState(null);
  const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [inputs, setInputs] = useState({});

  const handleSearchButton = () => {
    setIsSearchOpen((prevState) => !prevState);
    setCopyEvents(events);
  };
  const handleEventTypeButton = () => {
    setIsEventTypeOpen(!isEventTypeOpen);
  };
  const toggleAddEvent = () => {
    setIsAdding((prevState) => !prevState);
  };
  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(
          `http://localhost:3000/UnusualEventsAPI/api/unusualevents`
        );
        const data = await response.json();
        setEvents(data[0]);
        setCopyEvents(data[0]);
      } catch (error) {
        console.error("Error fetching unusual events", error);
      }
    }
    fetchEvents();
  }, []);

  const handleSearch = () => {
    setCopyEvents(events);
    // בדיקה אם שם האירוע ריק
    if (searchEventName.trim() === "") {
      alert("Please enter an event name for search");
      return;
    }

    const foundEvent = events.find(
      (event) => event.eventName === searchEventName
    );

    if (foundEvent) {
      setCopyEvents([foundEvent]);
    } else {
      alert(`Event "${searchEventName}" does not exist`);
    }
  };

  const handleSearchByEventType = async () => {
    setCopyEvents(events);
    setIsEventTypeOpen(false);

    if (selectedEventType === "All") {
      setCopyEvents(events);
    } else {
      // אם נבחר סוג אירוע, הצג רק את האירועים מאותו הסוג
      const filteredEvents = events.filter(
        (event) => event.eventType === selectedEventType
      );

      if (filteredEvents.length > 0) {
        setCopyEvents(filteredEvents);
      } else {
        alert(`No events found for type "${selectedEventType}"`);
      }
    }
  };

  const handleDeleteEnevt = async (id) => {
    try {
      await fetch(
        `http://localhost:3000/UnusualEventsAPI/api/unusualevents/${id}`,
        {
          method: "DELETE",
        }
      );

      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.eventID !== id)
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateEvent = (event) => {
    if (
      isUpdatingEvent &&
      updatedEvent &&
      updatedEvent.eventID === Event.eventID
    ) {
      setUpdatedEvent(null);
      setIsUpdatingEvent(false);
    } else {
      setUpdatedEvent({
        eventID: event.eventID,
        eventName: event.eventName,
        eventType: event.eventType,
        eventDate: event.eventDate,
        eventVideo: event.eventVideo,
      });
      setIsUpdatingEvent(true);
    }
  };

  const handleUpdateEventSubmit = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/UnusualEventsAPI/api/unusualevents/${updatedEvent.eventID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedEvent),
        }
      );
      if (response.status === 400) {
        const errorMessage = await response.json();
        alert(errorMessage);
        return;
      }
      const updatedData = await response.json();
      console.log("Event updated:", updatedData);

      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.eventID === updatedEvent.eventID ? updatedEvent : event
        )
      );

      setUpdatedEvent(null);
      setIsUpdatingEvent(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAddEvent = async () => {
    try {
      const newEvent = {
        eventName: inputs.eventName,
        eventType: inputs.eventType,
        eventDate: inputs.eventDate,
        eventVideo: inputs.eventVideo,
      };

      const response = await fetch(
        "http://localhost:3000/UnusualEventsAPI/api/unusualevents",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEvent),
        }
      );
      if (response.status === 400) {
        const errorMessage = await response.json();
        alert(errorMessage);
        return;
      }

      if (response.ok) {
        const addedEvent = await response.json();
        console.log(addedEvent);

        setEvents((prevEvents) => [...prevEvents, addedEvent]);
        setIsAdding(false);
      } else {
        console.error("Failed to add a new Event");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="users-container">
      <Link to="/Admin">
        <button className="logout-button">Back</button>
      </Link>
      <div>
        <h1>Unusual Events</h1>
        <div>
          <button className="search-btn" onClick={handleSearchButton}>
            {isSearchOpen ? "Back to All Events" : "Search Event"}
          </button>
          {isSearchOpen && (
            <div>
              <label htmlFor="searchEvent">Search Event Name: </label>
              <input
                type="text"
                id="searchEvent"
                value={searchEventName}
                onChange={(e) => setSearchEventName(e.target.value)}
              />
              <button className="search-btn" onClick={handleSearch}>
                Search
              </button>
            </div>
          )}
        </div>
        <div>
          <button className="search-btn" onClick={handleEventTypeButton}>
            Search Event Type
          </button>
          {isEventTypeOpen && (
            <div>
              <label htmlFor="eventType">Select Event Type: </label>
              <select
                id="eventType"
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Attack">Attack</option>
                <option value="Fire">Fire</option>
                <option value="Accident">Accident</option>
              </select>
              <button className="search-btn" onClick={handleSearchByEventType}>
                Search
              </button>
            </div>
          )}
        </div>
        <button onClick={toggleAddEvent}>
          {isAdding ? "Cancel" : "Add New Event"}
        </button>

        {isAdding && (
          <div>
            <h2>Add Event</h2>
            <input
              type="text"
              name="eventName"
              placeholder="eventName"
              value={inputs.eventName || ""}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="eventType"
              placeholder="eventType"
              value={inputs.eventType || ""}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="eventDate"
              placeholder="eventDate"
              value={inputs.eventDate || ""}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="eventVideo"
              placeholder="eventVideo"
              value={inputs.eventVideo || ""}
              onChange={handleChange}
              required
            />
            <button onClick={handleAddEvent}>Add Event</button>
          </div>
        )}
        <ul className="UnusualEvents">
          {copyEvents.map((event) => (
            <li key={event.eventID}>
              <button className="delete-btn">
                <FontAwesomeIcon
                  icon={faTrashCan}
                  onClick={() => handleDeleteEnevt(event.eventID)}
                />
                {/* Delete event */}
              </button>
              <button
                className="edit-btn"
                onClick={() => handleUpdateEvent(event)}
              >
                {isUpdatingEvent &&
                updatedEvent &&
                updatedEvent.eventID === event.eventID
                  ? "Close Update"
                  : ""}
                <FontAwesomeIcon icon={faPenToSquare} />
              </button>
              <h4 className="EventDetails"> Event: </h4>
              {event.eventName}
              {/* <h4 className="EventDetails">eventType: </h4> {event.eventType} 
              <h4 className="EventDetails">eventDate: </h4> {event.eventDate} */}
              <br />
              {event.eventVideo && (
                <div>
                  {/* <h4 className="EventDetails">Video: </h4> */}

                  {isUpdatingEvent &&
                    updatedEvent &&
                    updatedEvent.eventID === event.eventID && (
                      <div>
                        {/* <h2>Update Event</h2> */}
                        <input
                          type="text"
                          placeholder="eventName"
                          value={updatedEvent.eventName}
                          onChange={(e) =>
                            setUpdatedEvent({
                              ...updatedEvent,
                              eventName: e.target.value,
                            })
                          }
                        />
                        <input
                          type="text"
                          placeholder="eventType"
                          value={updatedEvent.eventType}
                          onChange={(e) =>
                            setUpdatedEvent({
                              ...updatedEvent,
                              eventType: e.target.value,
                            })
                          }
                        />
                        <input
                          type="text"
                          placeholder="eventDate"
                          value={updatedEvent.eventDate}
                          onChange={(e) =>
                            setUpdatedEvent({
                              ...updatedEvent,
                              eventDate: e.target.value,
                            })
                          }
                        />
                        <input
                          type="text"
                          placeholder="eventVideo"
                          value={updatedEvent.eventVideo}
                          onChange={(e) =>
                            setUpdatedEvent({
                              ...updatedEvent,
                              eventVideo: e.target.value,
                            })
                          }
                        />

                        <button onClick={handleUpdateEventSubmit}>
                          Update
                        </button>
                      </div>
                    )}

                  <video controls>
                    <source src={event.eventVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UnusualEvents;
