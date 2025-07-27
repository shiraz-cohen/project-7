const express = require("express");

const { databaseConnection } = require("./connectionDB.js"); // Import your database connection object

const usersRouter = express.Router();



///POST///


usersRouter.post("/api/users", async (req, res) => {
  const name = req.body.name;
  const username = req.body.username;
  const userRank = req.body.userRank;

  if (!name || !username || !userRank) {
    res.status(400).send(JSON.stringify("Please fill in all required fields"));
    return;
  }

  // בדיקה אם השם המשתמש כבר קיים במערכת
  const checkUsernameQuery = "SELECT * FROM users WHERE username = ?";
  let usernameExists;
  try {
    usernameExists = await databaseConnection.query(checkUsernameQuery, [username]);
    if (usernameExists[0].length) {
      res.status(400).send(JSON.stringify("Username already exists in the system, please choose another username"));
      return;
    }
  } catch (e) {
    res.status(500).send(JSON.stringify("Server error"));
    return;
  }

  if (userRank !== "user" && userRank !== "admin") {
    res.status(400).send(JSON.stringify("Please choose an appropriate role, user or admin"));
    return;
  }

  const user = {
    name: name,
    username: username,
    userRank: userRank,
  };
  const postUserQuery = "INSERT INTO users (name, username, userRank) VALUES (?, ?, ?)";
  let result;
  try {
    result = await databaseConnection.query(postUserQuery, [
      user.name,
      user.username,
      user.userRank,
    ]);
    console.log(result);
  } catch (e) {
    res.status(500).send(JSON.stringify("Server error"));
    return;
  }
  res.json(user);
});



usersRouter.post("/api/users/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(username);
  console.log(password);

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });

  }

  // Query to get the user's ID based on the username
  const getIdQuery = `SELECT id FROM users WHERE username = ?`;

  let results1;

  try {
    results1 = await databaseConnection.query(getIdQuery, [username]);

    console.log(results1[0].length);

    if (!results1[0].length) {
      return res.status(401).json({ message: "Username not found" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }

  

  const userId = results1[0][0].id;

  // Query to get the user's password based on the ID
  const getPasswordQuery = `SELECT password FROM passwords WHERE userID = ?`;

  let results2;

  try {
    results2 = await databaseConnection.query(getPasswordQuery, [userId]);
    if (!results2[0].length) {
      return res.status(401).json({ message: "User password not found" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }

  

  const userPassword = results2[0][0].password;

  const getNameQuery = `SELECT name FROM users WHERE id = ?`;

  let nameResults;

  try {
    nameResults = await databaseConnection.query(getNameQuery, [userId]);
    if (!nameResults[0].length) {
      return res.status(401).json({ message: "User name not found" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }

 

   const userName = nameResults[0][0].name;

  if (userPassword === password) {
    // Password is correct
    res.json(username);
  } else {
    if (userName !== username) {
      // Both username and password are incorrect
      return res.status(401).json({ message: "Incorrect username and password" });
    } else {
      // Password is incorrect
      return res.status(401).json({ message: "Incorrect password" });
    }
  }
});



///GET///
usersRouter.get("/api/users/:username", async (req, res) => {
  let username = req.params.username;
  console.log(username);

  const getUserQuery = "SELECT * FROM users WHERE username = ?";
  let result;

  try {
    result = await databaseConnection.query(getUserQuery, [username]);
    console.log(result);
    console.log("result");
    console.log(result[0].length);

    if ( !result[0].length ) {
      res.status(404).json({ error: "User not found" });
      
    } else {
      
      
      res.json(result[0]);
    }
  } catch (e) {
    
    res.status(500).json({ error: "Error executing the query" });
  }
});


usersRouter.get("/api/users/:ID/user", async (req, res) => {
  const userID = parseInt(req.params.ID);
  

  const getUserQuery = "SELECT * FROM users WHERE ID = ?";
  let result;

  try {
    result = await databaseConnection.query(getUserQuery, [userID]);
    console.log(result);

    if (!result[0].length) {
      
      res.status(404).json({ error: "User not found" });
    } else {
      
      res.json(result[0]);
    }
  } catch (e) {
    
    res.status(500).json({ error: "Error executing the query" });
  }
});



usersRouter.get("/api/users", async (req, res) => {
  

  const getUserQuery = "SELECT * FROM users ";
  let result;

  try {
    result = await databaseConnection.query(getUserQuery);
    console.log(result);
    if (!result.length) {
      
      res.status(404).json({ error: "Users not found" });
    } else {
      
      res.json(result);
    }
  } catch (e) {
    res.status(500).json({ error: "Error executing the query" });
    return;
  }

});

usersRouter.get("/api/users/:userRank/rank", async (req, res) => {
  let userRank = req.params.userRank;
  

  const getUserQuery = "SELECT * FROM users WHERE userRank = ? ";
  let result;

  try {
    result = await databaseConnection.query(getUserQuery, [userRank]);
    console.log(result);
  } catch (e) {
    res.status(400).send(JSON.stringify("error"));
    return;
  }

  res.json(result);
});





///PUT///
usersRouter.put("/api/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, username, userRank } = req.body;

  if (userRank !== "user" && userRank !== "admin") {
    res.status(400).send(JSON.stringify("Please choose an appropriate role, user or admin"));
    return;
  }

  // Fetch the current username from the database
  const getCurrentUsernameQuery = "SELECT username FROM users WHERE ID = ?";
  let currentUsername;
  try {
    currentUsername = await databaseConnection.query(getCurrentUsernameQuery, [id]);
  } catch (e) {
    res.status(500).send(JSON.stringify("Server error"));
    return;
  }

  // Check if the new username is different from the current one
  if (currentUsername[0][0].username !== username) {
    // Check if the new username already exists in the database
    const checkUsernameQuery = "SELECT ID FROM users WHERE username = ?";
    let usernameExists;
    try {
      usernameExists = await databaseConnection.query(checkUsernameQuery, [username]);
      if (usernameExists[0].length) {
        res.status(400).send(JSON.stringify("Username already exists in the system, please choose another username"));
        return;
      }
    } catch (e) {
      res.status(500).send(JSON.stringify("Server error"));
      return;
    }
  }

  let sql = `UPDATE users SET`;
  const values = [];

  if (name !== undefined) {
    sql += ` name = ?,`;
    values.push(name);
  }

  if (username !== undefined) {
    sql += ` username = ?,`;
    values.push(username);
  }
  
  if (userRank !== undefined) {
    sql += ` userRank = ?,`;
    values.push(userRank);
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

  // Fetch the updated user data after the update
  const getUserQuery = "SELECT * FROM users WHERE ID = ?";
  let result;

  try {
    result = await databaseConnection.query(getUserQuery, [id]);
    console.log(result);
  } catch (e) {
    res.status(400).send(JSON.stringify("error"));
    return;
  }

  res.json(result[0]);
});


///DELETE/// 
usersRouter.delete("/api/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  

  const deletPassQuery = "DELETE FROM passwords WHERE userID = ? ";
  let deletePassResult;

  try {
    deletePassResult = await databaseConnection.query(deletPassQuery, [id]);
    console.log(deletePassResult);
  } catch (e) {
    res.status(400).send(JSON.stringify("error 1"));
    return;
  }
  const deletCamAccQuery = "DELETE FROM cameraAccess WHERE userID  = ? ";
  let deleteCamAccResult;

  try {
    deleteCamAccResult = await databaseConnection.query(deletCamAccQuery, [id]);
    console.log(deleteCamAccResult);
  } catch (e) {
    res.status(400).send(JSON.stringify("error 2"));
    return;
  }
  const getUserQuery = "SELECT * FROM users WHERE ID = ? ";
  let deleteUser;
  let selectResults;

  try {
    selectResults = await databaseConnection.query(getUserQuery, [id]);
    console.log(selectResults);
  } catch (e) {
    res.status(400).send(JSON.stringify("error 3"));
    return;
  }
  deleteUser= selectResults[0];
  console.log(deleteUser);

  const deletUserQuery = "DELETE FROM users WHERE ID = ? ";
  let deleteUserResult;
  try {
    deleteUserResult = await databaseConnection.query(deletUserQuery, [id]);
    
  } catch (e) {
    res.status(400).send(JSON.stringify("error 4"));
    return;
  }
  
  res.json(deleteUser);


});



module.exports = usersRouter;
