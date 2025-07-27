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

const CamerasList = () => {
  var user1 = JSON.parse(localStorage.getItem("currentUser"));

  const [cameras, setCameras] = useState([]);
  const [updatedCamera, setUpdatedCamera] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [inputs, setInputs] = useState({});

  const toggleAddCamera = () => {
    setIsAdding((prevState) => !prevState);
  };

  const toggleUpdateCamera = (camera) => {
    if (isUpdating && updatedCamera && updatedCamera.ID === camera.ID) {
      setUpdatedCamera(null);
      setIsUpdating(false);
    } else {
      setUpdatedCamera({
        ID: camera.ID,
        location: camera.location,
        junction: camera.junction,
        video: camera.video,
      });
      setIsUpdating(true);
    }
  };

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  useEffect(() => {
    async function fetchCameras() {
      try {
        const response = await fetch(
          `http://localhost:3000/cameraAPI/api/cameras`
        );
        const data = await response.json();
        setCameras(data[0]);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    }
    fetchCameras();
  }, []);

  const handleDeleteCamera = async (id) => {
    try {
      await fetch(`http://localhost:3000/cameraAPI/api/cameras/${id}`, {
        method: "DELETE",
      });

      setCameras((prevCamera) =>
        prevCamera.filter((camera) => camera.ID !== id)
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleUpdateCameraSubmit = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/cameraAPI/api/cameras/${updatedCamera.ID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedCamera),
        }
      );
      if (response.status === 400) {
        const errorMessage = await response.json();
        alert(errorMessage);
        return;
      }
      if (response.ok) {
        const updatedData = await response.json();
        console.log("Camera updated:", updatedData);

        setCameras((prevCameras) =>
          prevCameras.map((camera) =>
            camera.ID === updatedCamera.ID ? updatedCamera : camera
          )
        );

        setUpdatedCamera(null);
        setIsUpdating(false);
      } else {
        console.error("Failed to update the camera");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleAddCamera = async () => {
    try {
      const newCamera = {
        location: inputs.location,
        junction: inputs.junction,
        video: inputs.video,
      };

      const response = await fetch(
        "http://localhost:3000/cameraAPI/api/cameras",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCamera),
        }
      );
      if (response.status === 400) {
        const errorMessage = await response.json();
        alert(errorMessage);
        return;
      }

      if (response.ok) {
        const addedCamera = await response.json();
        console.log(addedCamera);

        setCameras((prevCameras) => [...prevCameras, addedCamera]);
        setIsAdding(false);
      } else {
        console.error("Failed to add a new camera");
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
        {/* <h1>Cameras List</h1> */}
        <button onClick={toggleAddCamera}>
          {isAdding ? "Cancel" : "Add New Camera"}
        </button>

        {isAdding && (
          <div>
            {/* <h2>Add Camera</h2> */}
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={inputs.location || ""}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="junction"
              placeholder="Junction"
              value={inputs.junction || ""}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="video"
              placeholder="Video"
              value={inputs.video || ""}
              onChange={handleChange}
              required
            />
            <button onClick={handleAddCamera}>Add Camera</button>
          </div>
        )}

        <ul className="camerasList">
          {cameras.map((camera) => (
            <li key={camera.ID}>
              <button
                className="add-btn"
                onClick={() => handleDeleteCamera(camera.ID)}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
              <button
                className="edit-btn"
                onClick={() => toggleUpdateCamera(camera)}
              >
                {isUpdating && updatedCamera && updatedCamera.ID === camera.ID
                  ? "Close Update"
                  : ""}
                <FontAwesomeIcon icon={faPenToSquare} />
              </button>
              <h4 className="cameraDetails"> location: </h4>
              {camera.location}
              <br />
              {/* <h4 className="cameraDetails"> junction: </h4>
              {camera.junction}
              <h4 className="cameraDetails"> video: </h4> {camera.video} */}
              {isUpdating &&
                updatedCamera &&
                updatedCamera.ID === camera.ID && (
                  <div>
                    {/* <h2>Update Camera</h2> */}
                    <input
                      type="text"
                      placeholder="Location"
                      value={updatedCamera.location}
                      onChange={(e) =>
                        setUpdatedCamera({
                          ...updatedCamera,
                          location: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Junction"
                      value={updatedCamera.junction}
                      onChange={(e) =>
                        setUpdatedCamera({
                          ...updatedCamera,
                          junction: e.target.value,
                        })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Video"
                      value={updatedCamera.video}
                      onChange={(e) =>
                        setUpdatedCamera({
                          ...updatedCamera,
                          video: e.target.value,
                        })
                      }
                    />
                    <button onClick={handleUpdateCameraSubmit}>Update</button>
                  </div>
                )}
              <img
                className="cameraListImg"
                src={camera.video}
                // src="/images/loginBackground.png"
                alt="Camera Image"
                width="560"
                height="315"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CamerasList;
