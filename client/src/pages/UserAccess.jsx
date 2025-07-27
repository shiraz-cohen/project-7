import React, { useState, useEffect } from "react";
import {
  faTrashCan,
  faPlus,
  faCommentDots,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../App.css";

const UserAccess = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const [users, setUsers] = useState([]);
  const [inputs, setInputs] = useState({});
  const [activeUser, setActiveUser] = useState(null);
  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const [isDeletingPermission, setIsDeletingPermission] = useState(false);
  const [relatedCameras, setRelatedCameras] = useState([]);
  const [cameraList, setCameraList] = useState([]);
  const [cameraListVisible, setCameraListVisible] = useState(false);

  // Function to handle input field changes
  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  useEffect(() => {
    // Fetch the list of cameras when the component mounts
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

  // Function to handle adding permission
  const handleAddPermission = (user) => {
    if (activeUser && activeUser.ID === user.ID) {
      setActiveUser(null);
      setIsAddingPermission(false);
    } else {
      setActiveUser(user);
      setIsAddingPermission(true);
    }

    setInputs((values) => ({ ...values, location: "" }));
  };

  // Function to send permission
  const handleSendPermission = async () => {
    setInputs({});
    const camera = inputs.location;
    if (activeUser) {
      try {
        const CameraResponse = await fetch(
          `http://localhost:3000/cameraAPI/api/cameras/${camera}/location`
        );
        if (CameraResponse.status === 404) {
          alert("Camera does not exist in the system, please try again");

          return;
        }
        const cameraData = await CameraResponse.json();
        const cameraID = cameraData[0].ID;
        console.log(cameraID);

        const response = await fetch(
          `http://localhost:3000/cameraAccessAPI/api/cameraAccess/${activeUser.ID}/${cameraID}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userID: activeUser.ID }),
          }
        );
        if (response.status === 400) {
          alert(
            "This user already has access to the camera, please choose another camera"
          );

          return;
        }

        if (response.ok) {
          const addCameraAccess = await response.json();
          console.log(addCameraAccess);
          setActiveUser(null);
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
  const handleDeletePermission = async (user) => {
    if (activeUser && activeUser.ID === user.ID) {
      setActiveUser(null);
      setIsAddingPermission(false);
      setIsDeletingPermission(false);
      setCameraListVisible(false);
    } else {
      setActiveUser(user);
      setIsAddingPermission(false);
      setIsDeletingPermission(true);
      setCameraListVisible(true);
      try {
        const response = await fetch(
          `http://localhost:3000/cameraAccessAPI/api/cameraAccess/${user.ID}/cameras`
        );
        const data = await response.json();
        setRelatedCameras(data);

        // Create a copy of the existing camera list
        let updatedCameraList = [];

        // Fetch camera details for each cameraID and update the camera list
        for (const cameraObj of data) {
          const cameraID = cameraObj.cameraID;
          const cameraResponse = await fetch(
            `http://localhost:3000/cameraAPI/api/camera/${cameraID}`
          );
          const camera = await cameraResponse.json();

          cameraObj.location = {
            id: camera[0].ID,
            location: camera[0].location,
          };

          // Add the camera to the updated camera list
          updatedCameraList.push(cameraObj.location);
        }

        // Update the camera list in the state
        setCameraList(updatedCameraList);
      } catch (error) {
        console.error("Error fetching related cameras", error);
      }
    }
  };

  // Function to send permission deletion
  const handleSendPermissionDelete = (camera) => {
    if (activeUser) {
      const shouldDelete = window.confirm(
        `Are you sure you want to remove access for ${camera.location}?`
      );

      if (shouldDelete) {
        fetch(
          `http://localhost:3000/cameraAccessAPI/api/cameraAccess/${activeUser.ID}/${camera.id}`,
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
          {users.map((user) => (
            <li key={user.ID}>
              <button
                className="delete-btn"
                onClick={() => handleAddPermission(user)}
              >
                {activeUser &&
                activeUser.ID === user.ID &&
                isAddingPermission ? (
                  <span>
                    <FontAwesomeIcon icon={faPlus} />
                    Close Permission
                  </span>
                ) : (
                  <FontAwesomeIcon icon={faPlus} />
                )}
              </button>
              {activeUser &&
                activeUser.ID === user.ID &&
                isAddingPermission && (
                  <div>
                    <div>Enter the camera location for access:</div>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={inputs.location || ""}
                      onChange={handleChange}
                      required
                    />
                    <button onClick={handleSendPermission}>Send</button>
                  </div>
                )}
              <button
                className="delete-btn"
                onClick={() => handleDeletePermission(user)}
              >
                {activeUser &&
                activeUser.ID === user.ID &&
                isDeletingPermission ? (
                  <span>
                    <FontAwesomeIcon icon={faTrashCan} />
                    Close Permission
                  </span>
                ) : (
                  <FontAwesomeIcon icon={faTrashCan} />
                )}
              </button>
              <h4 className="cameraAccessDetails"> Username: </h4>
              {user.username}
              {activeUser &&
                activeUser.ID === user.ID &&
                isDeletingPermission && (
                  <div>
                    <ul>
                      {cameraList.map((camera) => (
                        <li key={camera.id}>
                          <button
                            onClick={() => handleSendPermissionDelete(camera)}
                          >
                            {camera.location}
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

export default UserAccess;
