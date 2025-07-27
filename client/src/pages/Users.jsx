import { Outlet, Link } from "react-router-dom";
import React from "react";
import "../App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

const Users = () => {
  var user = JSON.parse(localStorage.getItem("currentUser"));
  return (
    <div className="users-container">
      <header>
        <nav className="top-navbar">
          <ul className="nav__links">
            <li>
              <h2 className="logo">Rush hour</h2>
            </li>
            <li>
              <Link to={`/Users/${user.id}/CamerasUser`}>My Cameras</Link>
            </li>
            <li>
              <Link to={`/Users/${user.id}/UnusualEvents`}>Unusual Events</Link>
            </li>
            <li>
              <Link to={`/Users/${user.id}/Info`}>Info</Link>
            </li>
            <li>
              <Link to="/Login">
                <button
                  className="logout-button"
                  onClick={() => {
                    localStorage.removeItem("currentUser");
                  }}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </button>
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <h1 className="welcome-username">Welcome {user.name}!</h1>
      <Link to="/Login">
        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem("currentUser");
          }}
        ></button>
      </Link>
      <Outlet />
    </div>
  );
};

export default Users;
