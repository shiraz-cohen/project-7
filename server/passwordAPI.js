
const express = require("express");
const { databaseConnection } = require("./connectionDB.js"); // Import your database connection object

const passwordRouter = express.Router();

///POST///
passwordRouter.post("/api/users/:userID/password", async (req, res) => {
  const password = req.body.password;
  const userID = parseInt(req.params.userID);

  if (!password) {
    //res.status(400).send(JSON.stringify("Please fill in all required fields"));
    const deletQuery = "DELETE FROM users WHERE ID = ?  ";
    let deleteResult;
  
    try {
      deleteResult = await databaseConnection.query(deletQuery, [userID]);
      
    } catch (e) {
      res.status(400).send(JSON.stringify({ error: "An error occurred" }));
  
      return;
    }
    res.status(400).send(JSON.stringify("Please fill in all required fields"));
    return;
    
  }
  
  if (password.length < 6) {
    //res.status(400).send(JSON.stringify("Password must be at least 6 characters long"));

    const deletQuery = "DELETE FROM users WHERE ID = ?  ";
    let deleteResult;
  
    try {
      deleteResult = await databaseConnection.query(deletQuery, [userID]);
      
    } catch (e) {
      res.status(400).send(JSON.stringify({ error: "An error occurred" }));
  
      return;
    }
    res.status(400).send(JSON.stringify("Password must be at least 6 characters long"));
    return;
  }
  
  const postPasswordQuery = "INSERT INTO passwords (userID, password) VALUES (?, ?)";
  let result;

  try {
    result = await databaseConnection.query(postPasswordQuery, [userID, password]);
    console.log("result");
    console.log(result);
  } catch (e) {
    res.status(500).send(JSON.stringify("error"));
    return;
  }
  
  res.status(200).json('success');
});





// // POST request to add a password for a user
// passwordRouter.post("/api/passwords", (req, res) => {
//   const { userID, password } = req.body;
//   const query = "INSERT INTO passwords (userID, password) VALUES (?, ?)";

//   databaseConnection.query(query, [userID, password], (error, results) => {
//     if (error) {
//       res
//         .status(500)
//         .json({ error: "An error occurred while adding a password." });
//     } else {
//       res.json({
//         message: "Password added successfully.",
//         passwordId: results.insertId,
//       });
//     }
//   });
// });

// // PUT request to update a user's password
// passwordRouter.put("/api/passwords/:userId", (req, res) => {
//   const userId = req.params.userId;
//   const { password } = req.body;
//   const query = "UPDATE passwords SET password = ? WHERE userID = ?";

//   databaseConnection.query(query, [password, userId], (error, results) => {
//     if (error) {
//       res
//         .status(500)
//         .json({ error: "An error occurred while updating the password." });
//     } else {
//       res.json({ message: "Password updated successfully." });
//     }
//   });
// });

// // DELETE request to delete a user's password
// passwordRouter.delete("/api/passwords/:userId", (req, res) => {
//   const userId = req.params.userId;
//   const query = "DELETE FROM passwords WHERE userID = ?";

//   databaseConnection.query(query, [userId], (error, results) => {
//     if (error) {
//       res
//         .status(500)
//         .json({ error: "An error occurred while deleting the password." });
//     } else {
//       res.json({ message: "Password deleted successfully." });
//     }
//   });
// });

module.exports = passwordRouter;
