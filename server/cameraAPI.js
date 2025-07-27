
const express = require("express");

const { databaseConnection } = require("./connectionDB.js"); // Import your database connection object

const cameraRouter = express.Router();


///GET///
cameraRouter.get("/api/cameras", async (req, res) => {
  

  const getCameraQuery = "SELECT * FROM cameras ";
  let result;

  try {
    result = await databaseConnection.query(getCameraQuery);
    console.log(result);
    if (!result.length) {
      
      res.status(404).json({ error: "Cameras not found" });
    } else {
      
      res.json(result);
    }
  } catch (e) {
    res.status(400).send(JSON.stringify("error"));
    return;
  }

});

cameraRouter.get("/api/cameras/:video/video", async (req, res) => {
  let video = req.params.video;


  const getCameraQuery = "SELECT * FROM cameras WHERE video = ?";
  let result;

  try {
    result = await databaseConnection.query(getCameraQuery,[video]);
    console.log(result);
    console.log(result[0]);
  } catch (e) {
    res.status(400).send(JSON.stringify("error"));
    return;
  }

  res.json(result[0]);
});

cameraRouter.get("/api/cameras/:location/location", async (req, res) => {
  let location = req.params.location;


  const getCameraQuery = "SELECT * FROM cameras WHERE location = ?";
  let result;

  try {
    result = await databaseConnection.query(getCameraQuery,[location]);
    console.log(result);
    console.log(result[0]);
  } catch (e) {
    res.status(400).send(JSON.stringify("error"));
    return;
  }

  res.json(result[0]);
});


cameraRouter.get("/api/camera/:ID", async (req, res) => {
  let cameraID = parseInt(req.params.ID);

  const getCameraQuery = "SELECT * FROM cameras WHERE ID = ?";
  let result;
  
  try {
    result = await databaseConnection.query(getCameraQuery, [cameraID]);
    //console.log(result);
    console.log(result[0]);
    if (!result.length) {
      
      res.status(404).json({ error: "Cameras not found" });
    } else {
      
      res.json(result[0]);
    }
    
  } catch (error) {
    console.error("Error fetching camera access:", error);
    res.status(400).send(JSON.stringify("An error occurred while fetching camera access"));
    
  }
  
});

///DELETE/// 
cameraRouter.delete("/api/cameras/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  

  const deletCamQuery = "DELETE FROM cameraAccess WHERE cameraID = ? ";
  let deleteCamResult;

  try {
    deleteCamResult = await databaseConnection.query(deletCamQuery, [id]);
    console.log(deleteCamResult);
  } catch (e) {
    res.status(400).send(JSON.stringify("error"));
    return;
  }
  const getCamQuery = "SELECT * FROM cameras WHERE ID = ? ";
  let deleteCamera;
  let selectResults;

  try {
    selectResults = await databaseConnection.query(getCamQuery, [id]);
    console.log(selectResults);
  } catch (e) {
    res.status(400).send(JSON.stringify("error"));
    return;
  }
  deleteCamera= selectResults[0];

  const deletCameraQuery = "DELETE FROM cameras WHERE ID = ? ";
  let deleteCameraResult;
  try {
    deleteCameraResult = await databaseConnection.query(deletCameraQuery, [id]);
    console.log(deleteCameraResult);
  } catch (e) {
    res.status(400).send(JSON.stringify("error"));
    return;
  }
  
  res.json(deleteCamera);


});

///PUT///
cameraRouter.put("/api/cameras/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { location, junction, video } = req.body;

  // Fetch the current username from the database
  const getCurrentCameraQuery = "SELECT video FROM cameras WHERE ID = ?";
  let currentCamera;
  try {
    currentCamera = await databaseConnection.query(getCurrentCameraQuery, [id]);
  } catch (e) {
    res.status(500).send(JSON.stringify("Server error"));
    return;
  }

  console.log("Current camera video:", currentCamera[0][0].video);
  console.log("New camera video:", video);

  // Check if the new video already exists in the database
  if (currentCamera[0][0].video !== video) {
    const checkVideoQuery = "SELECT ID FROM cameras WHERE video = ? ";
    let videoExists;
    try {
      videoExists = await databaseConnection.query(checkVideoQuery, [video]);
      console.log("Existing videos with the same name:", videoExists[0].length);
      if (videoExists[0].length) {
        res.status(400).send(JSON.stringify("Video already exists in the system, please choose another video"));
        return;
      }
    } catch (e) {
      res.status(500).send(JSON.stringify("Server error"));
      return;
    }
  }

  let sql = `UPDATE cameras SET`;
  const values = [];

  if (location !== undefined) {
    sql += ` location = ?,`;
    values.push(location);
  }

  if (junction !== undefined) {
    sql += ` junction = ?,`;
    values.push(junction);
  }

  if (video !== undefined) {
    sql += ` video = ?,`;
    values.push(video);
  }

  // Remove the trailing comma from the SQL statement
  sql = sql.slice(0, -1);

  sql += ` WHERE ID = ?`;
  values.push(id);

  // Execute the SQL update query
  try {
    await databaseConnection.query(sql, values);
  } catch (e) {
    res.status(400).send(JSON.stringify("error"));
    return;
  }

  // Fetch the updated camera data after the update
  const getCameraQuery = "SELECT * FROM cameras WHERE ID = ?";
  let result;

  try {
    result = await databaseConnection.query(getCameraQuery, [id]);
    console.log("Updated camera details:", result);
  } catch (e) {
    res.status(400).send(JSON.stringify("error"));
    return;
  }

  res.json(result[0]);
});

////POST/////

cameraRouter.post("/api/cameras", async (req, res) => {
  const location = req.body.location;
  const junction = req.body.junction;
  const video = req.body.video;

  if (!location || !junction || !video) {
    res.status(400).send(JSON.stringify("Please fill in all required fields"));
    return;
  }

  // בדיקה אם השם המשצלמה כבר קיימת במערכת
  const checkCameraQuery = "SELECT * FROM cameras WHERE video = ?";
  let cameraExists;
  try {
    cameraExists = await databaseConnection.query(checkCameraQuery, [video]);
    if (cameraExists[0].length) {
      res.status(400).send(JSON.stringify("Video already exists in the system, please choose another video"));
      return;
    }
  } catch (e) {
    res.status(500).send(JSON.stringify("Server error"));
    return;
  }

  const postCameraQuery = "INSERT INTO cameras (location, junction, video) VALUES (?, ?, ?)";
  let result;
  try {
    result = await databaseConnection.query(postCameraQuery, [location, junction, video]);
    const newCameraId = result[0].insertId;
    const newCamera = { ID: newCameraId, location, junction, video };
    res.json(newCamera);
  } catch (e) {
    res.status(500).send(JSON.stringify("Server error"));
    return;
  }
});







module.exports = cameraRouter;



