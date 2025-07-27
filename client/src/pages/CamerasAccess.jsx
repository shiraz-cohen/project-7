import React, { useState, useEffect } from "react";
import {
  faTrashCan,
  faPlus,
  faCommentDots,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../App.css";

const CamerasAccess = () => {
  const user1 = JSON.parse(localStorage.getItem("currentUser"));

  const [cameras, setCameras] = useState([]);
  const [inputs, setInputs] = useState({});
  const [activeCamera, setActiveCamera] = useState(null);
  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const [isDeletingPermission, setIsDeletingPermission] = useState(false);
  const [relatedUsers, setRelatedUsers] = useState([]);
  const [userList, setUserList] = useState([]);
  const [userListVisible, setUserListVisible] = useState(false);

  // Function to handle input field changes
  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  useEffect(() => {
    // Fetch the list of cameras when the component mounts
    async function fetchCameras() {
      try {
        const response = await fetch(
          `http://localhost:3000/cameraAPI/api/cameras`
        );
        const data = await response.json();
        setCameras(data[0]);
      } catch (error) {
        console.error("Error fetching cameras", error);
      }
    }
    fetchCameras();
  }, []);

  // Function to handle adding permission
  const handleAddPermission = (camera) => {
    if (activeCamera && activeCamera.ID === camera.ID) {
      setActiveCamera(null);
      setIsAddingPermission(false);
    } else {
      setActiveCamera(camera);
      setIsAddingPermission(true);
    }

    setInputs((values) => ({ ...values, username: "" }));
  };

  // Function to send permission
  const handleSendPermission = async () => {
    setInputs({});
    const username = inputs.username;
    if (activeCamera) {
      try {
        const userResponse = await fetch(
          `http://localhost:3000/userAPI/api/users/${username}`
        );
        if (userResponse.status === 404) {
          alert("Username does not exist in the system, please try again");

          return;
        }
        const userData = await userResponse.json();
        const userID = userData[0].ID;
        console.log(userID);

        const response = await fetch(
          `http://localhost:3000/cameraAccessAPI/api/cameraAccess/${userID}/${activeCamera.ID}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userID: userID }),
          }
        );
        if (response.status === 400) {
          alert(
            "This user already has access to the camera, please choose another user"
          );

          return;
        }

        if (response.ok) {
          const addCameraAccess = await response.json();
          console.log(addCameraAccess);
          setActiveCamera(null);
          setIsAddingPermission(false);
          alert("The permission has been successfully added");
        } else {
          console.error("Failed to add a new CameraAccess");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  // Function to handle deleting permission
  const handleDeletePermission = async (camera) => {
    if (activeCamera && activeCamera.ID === camera.ID) {
      setActiveCamera(null);
      setIsAddingPermission(false);
      setIsDeletingPermission(false);
      setUserListVisible(false);
    } else {
      setActiveCamera(camera);
      setIsAddingPermission(false);
      setIsDeletingPermission(true);
      setUserListVisible(true);
      try {
        const response = await fetch(
          `http://localhost:3000/cameraAccessAPI/api/cameraAccess/${camera.ID}`
        );
        const data = await response.json();
        setRelatedUsers(data);

        // Create a copy of the existing user list
        let updatedUserList = [];

        // Fetch user details for each userID and update the user list
        for (const userObj of data) {
          const userID = userObj.userID;
          const userResponse = await fetch(
            `http://localhost:3000/userAPI/api/users/${userID}/user`
          );
          const user = await userResponse.json();

          userObj.username = { id: user[0].ID, username: user[0].username };

          // Add the user to the updated user list
          updatedUserList.push(userObj.username);
        }

        // Update the user list in the state
        setUserList(updatedUserList);
      } catch (error) {
        console.error("Error fetching related users", error);
      }
    }
  };

  // Function to send permission deletion
  const handleSendPermissionDelete = (user) => {
    if (activeCamera) {
      const shouldDelete = window.confirm(
        `Are you sure you want to remove access for ${user.username}?`
      );

      if (shouldDelete) {
        fetch(
          `http://localhost:3000/cameraAccessAPI/api/cameraAccess/${user.id}/${activeCamera.ID}`,
          {
            method: "DELETE",
          }
        )
          .then((response) => {
            if (response.ok) {
              console.log("Access has been successfully removed");
            } else {
              console.error("Failed to remove CameraAccess");
            }
          })
          .catch((error) => {
            console.error("Error deleting CameraAccess", error);
          })
          .finally(() => {
            // Close the user list after the operation is complete
            setIsDeletingPermission(false);
          });
      }
    }
  };

  return (
    <div className="users-container">
      <div>
        <h2>Access Permissions</h2>
        <ul className="camerasAccessList">
          {cameras.map((camera) => (
            <li key={camera.ID}>
              <button
                className="delete-btn"
                onClick={() => handleAddPermission(camera)}
              >
                {activeCamera &&
                activeCamera.ID === camera.ID &&
                isAddingPermission ? (
                  <span>
                    <FontAwesomeIcon icon={faPlus} />
                    Close Permission
                  </span>
                ) : (
                  <FontAwesomeIcon icon={faPlus} />
                )}
              </button>
              {activeCamera &&
                activeCamera.ID === camera.ID &&
                isAddingPermission && (
                  <div>
                    <div>Enter the username for access:</div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={inputs.username || ""}
                      onChange={handleChange}
                      required
                    />
                    <button onClick={handleSendPermission}>Send</button>
                  </div>
                )}
              <button
                className="delete-btn"
                onClick={() => handleDeletePermission(camera)}
              >
                {activeCamera &&
                activeCamera.ID === camera.ID &&
                isDeletingPermission ? (
                  <span>
                    <FontAwesomeIcon icon={faTrashCan} />
                    Close Permission
                  </span>
                ) : (
                  <FontAwesomeIcon icon={faTrashCan} />
                )}
              </button>
              <h4 className="cameraAccessDetails"> Location: </h4>
              {camera.location}
              {activeCamera &&
                activeCamera.ID === camera.ID &&
                isDeletingPermission && (
                  <div>
                    <ul>
                      {userList.map((user) => (
                        <li key={user.id}>
                          <button
                            onClick={() => handleSendPermissionDelete(user)}
                          >
                            {user.username}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CamerasAccess;
