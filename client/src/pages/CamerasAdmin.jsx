import "../App.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import React from "react";

const CamerasAdmin = () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  //const [user, setUser] = useState(null);

  const [cameras, setCameras] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!loaded) {
        try {
          const response = await fetch(
            `http://localhost:3000/cameraAccessAPI/api/cameraAccess/${user.id}/cameras`
          );
          if (response.status === 403) {
            const errorMessage = await response.json();
            alert(errorMessage);
            return;
          }
          //Camera ID
          const data = await response.json();
          setCameras(data);
          setLoaded(true);
          console.log("data");
          console.log(data);
        } catch (error) {
          console.error(error);
        }
      }
    }
    fetchData();
  }, [loaded]);

  return (
    <div className="info-container">
      {/* <h1 className="cam-header">Cameras</h1> */}
      {user && (
        <div className="background">
          <div className="cam-details">
            <ul>
              {cameras.map((camera) => (
                <li key={camera.cameraID}>
                  <Link
                    to={`/Admin/${user.id}/CamerasAdmin/${camera.cameraID}/VideoAnalysis`}
                  >
                    <button>camera: {camera.cameraID}</button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CamerasAdmin;
