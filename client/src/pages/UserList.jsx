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

const UserList = () => {
  var currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [users, setUsers] = useState([]);
  const [updatedUser, setUpdatedUser] = useState(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch(`http://localhost:3000/userAPI/api/users`);
        const data = await response.json();
        setUsers(data[0]);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    }
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    if (currentUser && currentUser.id === id) {
      alert("The current user cannot be deleted");
      return;
    }
    try {
      await fetch(`http://localhost:3000/userAPI/api/users/${id}`, {
        method: "DELETE",
      });

      setUsers((prevUsers) => prevUsers.filter((user) => user.ID !== id));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateUser = (user) => {
    if (isUpdatingUser && updatedUser && updatedUser.ID === user.ID) {
      setUpdatedUser(null);
      setIsUpdatingUser(false);
    } else {
      setUpdatedUser({
        ID: user.ID,
        name: user.name,
        username: user.username,
        userRank: user.userRank,
      });
      setIsUpdatingUser(true);
    }
  };

  const handleUpdateUserSubmit = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/userAPI/api/users/${updatedUser.ID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        }
      );
      if (response.status === 400) {
        const errorMessage = await response.json();
        alert(errorMessage);
        return;
      }
      const updatedData = await response.json();
      console.log("User updated:", updatedData);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.ID === updatedUser.ID ? updatedUser : user
        )
      );

      setUpdatedUser(null);
      setIsUpdatingUser(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="users-container">
      <Link to="/Admin">
        <button className="logout-button">Back</button>
      </Link>
      <button>
        <Link to={`/Admin/{user.ID}/Register`}>Add user</Link>
      </button>
      <div>
        {/* <h1>Users List</h1> */}
        <ul className="usersList">
          {users.map((user) => (
            <li key={user.ID}>
              <button className="delete-btn">
                <FontAwesomeIcon
                  icon={faTrashCan}
                  onClick={() => handleDeleteUser(user.ID)}
                />
                {/* Delete User */}
              </button>
              <button
                className="edit-btn"
                onClick={() => handleUpdateUser(user)}
              >
                {isUpdatingUser && updatedUser && updatedUser.ID === user.ID
                  ? "Close Update"
                  : ""}
                <FontAwesomeIcon icon={faPenToSquare} />
              </button>
              <h4 className="UserDetails"> name: </h4>
              {user.name} <h4 className="UserDetails"> username: </h4>
              {user.username} <h4 className="UserDetails"> rank: </h4>
              {user.userRank}
              {isUpdatingUser && updatedUser && updatedUser.ID === user.ID && (
                <div>
                  {/* <h2>Update User</h2> */}
                  <input
                    type="text"
                    placeholder="Name"
                    value={updatedUser.name}
                    onChange={(e) =>
                      setUpdatedUser({ ...updatedUser, name: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Username"
                    value={updatedUser.username}
                    onChange={(e) =>
                      setUpdatedUser({
                        ...updatedUser,
                        username: e.target.value,
                      })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Rank"
                    value={updatedUser.userRank}
                    onChange={(e) =>
                      setUpdatedUser({
                        ...updatedUser,
                        userRank: e.target.value,
                      })
                    }
                  />
                  <button onClick={handleUpdateUserSubmit}>Update</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserList;
