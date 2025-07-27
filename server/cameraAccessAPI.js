
const express = require("express");

const { databaseConnection } = require("./connectionDB.js"); // Import your database connection object

const cameraAccessRouter = express.Router();



// GET request to fetch camera access for a user
cameraAccessRouter.get("/api/cameraAccess/:cameraID", async (req, res) => {
  let cameraID = parseInt(req.params.cameraID);

  const getCameraQuery = "SELECT userID FROM cameraAccess WHERE cameraID = ?";
  let result;
  

  try {
    result = await databaseConnection.query(getCameraQuery, [cameraID]);
    console.log(result);
    console.log(result[0]);
    
    
  } catch (error) {
    console.error("Error fetching camera access:", error);
    res.status(400).send(JSON.stringify("An error occurred while fetching camera access"));
    
  }
  res.json(result[0]);
});

cameraAccessRouter.get("/api/cameraAccess/:userID/cameras", async (req, res) => {
  let userId = parseInt(req.params.userID);

  const getCameraQuery = "SELECT cameraID FROM cameraAccess WHERE userID = ?";
  let result;

  try {
    result = await databaseConnection.query(getCameraQuery, [userId]);
    console.log(result);

    if (!result[0] || result[0].length === 0) {
      res.status(403).send(JSON.stringify("You don't have access to any cameras. Please request access from an administrator."));
      return;
    }
    
  } catch (error) {
    console.error("Error fetching camera access:", error);
    res.status(400).send(JSON.stringify("An error occurred while fetching camera access"));
  }

  res.json(result[0]);
});


// cameraAccessRouter.get("/api/cameraAccess/:cameraID", async (req, res) => {
//   let cameraID = req.params.cameraID;
//   console.log(userId);

//   const getCameraQuery = "SELECT * FROM cameras WHERE ID = ?";
//   let result;
//   console.log("a");

//   try {
//     console.log("b");
//     result = await databaseConnection.query(getCameraQuery, [cameraID]);
    
       
//    } catch (e) {
//       res.status(400).send(JSON.stringify("An error occurred while fetching camera access"));
//       return;
//     }
    
//     res.json(result);
    
// });


 


// POST request to grant camera access to a user
// cameraAccessRouter.post("/cameraAccess/:userId/:cameraId", (req, res) => {
//   const userId = req.params.userId;
//   const cameraId = req.params.cameraId;
//   const query = "INSERT INTO cameraAccess (userID, cameraID) VALUES (?, ?)";

//   databaseConnection.query(query, [userId, cameraId], (error, results) => {
//     if (error) {
//       res
//         .status(500)
//         .json({ error: "An error occurred while granting camera access." });
//     } else {
//       res.json({ message: "Camera access granted successfully." });
//     }
//   });
// });

cameraAccessRouter.post("/api/cameraAccess/:userID/:cameraID", async (req, res) => {
  const cameraID = parseInt(req.params.cameraID);
  const userID = parseInt(req.params.userID);
  console.log(cameraID);
  console.log(userID);

  // Performing a SELECT query to check if a record with the same values already exists
  const checkDuplicateQuery =  "SELECT * FROM cameraAccess WHERE userID = ? AND cameraID = ?";
  
  try {
    const duplicates = await databaseConnection.query(checkDuplicateQuery, [userID, cameraID]);
    console.log(duplicates);
    console.log(duplicates[0].length);

    if (duplicates[0].length === 1 ) {
     
      res.status(400).json({ error: "Record already exists" });
    } else {
      
      const postcameraAccessQuery = "INSERT INTO cameraAccess (userID, cameraID) VALUES (?, ?)";
      const result = await databaseConnection.query(postcameraAccessQuery, [userID, cameraID]);
      res.status(200).json({ success: "Record created successfully" });
      //res.json(result);
    }
    
  } catch (e) {
    // Handle any errors that occur during query execution
    res.status(500).json({ error: "Error executing the query" });
  }
});




///DELETE/// 
cameraAccessRouter.delete("/api/cameraAccess/:userID/:cameraID", async (req, res) => {
  const userID = parseInt(req.params.userID);
  const cameraID = parseInt(req.params.cameraID);
  console.log(userID);
  console.log(cameraID);

  const deletCamQuery = "DELETE FROM cameraAccess WHERE userID = ? AND cameraID = ? ";
  let deleteCamResult;

  try {
    deleteCamResult = await databaseConnection.query(deletCamQuery, [userID, cameraID]);

  } catch (e) {
    res.status(400).send(JSON.stringify({ error: "An error occurred" }));

    return;
  }
  res.status(200).json({ success: "Delete created successfully" });
  //res.json(deleteCamResult);
  
 


});





// DELETE request to revoke camera access from a user
// cameraAccessRouter.delete("/cameraAccess/:userId/:cameraId", (req, res) => {
//   const userId = req.params.userId;
//   const cameraId = req.params.cameraId;
//   const query = "DELETE FROM cameraAccess WHERE userID = ? AND cameraID = ?";

//   databaseConnection.query(query, [userId, cameraId], (error, results) => {
//     if (error) {
//       res
//         .status(500)
//         .json({ error: "An error occurred while revoking camera access." });
//     } else {
//       res.json({ message: "Camera access revoked successfully." });
//     }
//   });
// });

module.exports = cameraAccessRouter;

