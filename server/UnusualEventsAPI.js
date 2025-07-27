const express = require("express");

const { databaseConnection } = require("./connectionDB.js"); // Import your database connection object

const unusualEventsRouter = express.Router();

//////GET//////

unusualEventsRouter.get("/api/unusualevents", async (req, res) => {
  

    const getUEventsQuery = "SELECT * FROM unusualevents ";
    let result;
  
    try {
      result = await databaseConnection.query(getUEventsQuery);
      console.log(result);
      if (!result.length) {
        
        res.status(404).json({ error: "Unusual events not found" });
      } else {
        
        res.json(result);
      }
    } catch (e) {
      res.status(500).json({ error: "Error executing the query" });
      return;
    }
  
  });


  unusualEventsRouter.get("/api/unusualevents/:eventName", async (req, res) => {
    let eventName = req.params.eventName;
    console.log(eventName);
  
    const getUEventsQuery = "SELECT * FROM unusualevents WHERE eventName = ?";
    let result;
  
    try {
      result = await databaseConnection.query(getUEventsQuery, [eventName]);
      console.log(result);
      console.log("result");
      console.log(result[0].length);
  
      if ( !result[0].length ) {
        res.status(404).json({ error: "unusual events not found" });
        
      } else {
        
        
        res.json(result[0]);
      }
    } catch (e) {
      
      res.status(500).json({ error: "Error executing the query" });
    }
  });

  //////DELETE////

  unusualEventsRouter.delete("/api/unusualevents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
  
    
    const getUEventQuery = "SELECT * FROM unusualevents WHERE eventID = ? ";
    let deleteEvent;
    let selectResults;
  
    try {
      selectResults = await databaseConnection.query(getUEventQuery, [id]);
      console.log(selectResults);
    } catch (e) {
      res.status(400).send(JSON.stringify("error "));
      return;
    }
    deleteEvent= selectResults[0];
    console.log(deleteEvent);
  
    const deletEventQuery = "DELETE FROM unusualevents WHERE eventID = ? ";
    let deleteEventResult;
    try {
      deleteEventResult = await databaseConnection.query(deletEventQuery, [id]);
      
    } catch (e) {
      res.status(400).send(JSON.stringify("error "));
      return;
    }
    
    res.json(deleteEvent);
  
  
  });


  ///PUT///
unusualEventsRouter.put("/api/unusualevents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    console.log("Received PUT request for event ID:", id);
  
    const { eventName, eventType, eventDate, eventVideo } = req.body;
    
    // Fetch the current username from the database
    const getCurrentEventVideoQuery = "SELECT eventVideo FROM unusualevents WHERE eventID = ?";
    let currentEventVideo;
    try {
      currentEventVideo = await databaseConnection.query(getCurrentEventVideoQuery, [id]);
    } catch (e) {
      console.error("Error fetching current event video:", e);
      res.status(500).send(JSON.stringify("Server error"));
      return;
    }
    console.log("Current event video:", currentEventVideo[0][0].eventVideo);
    console.log("New event video:", eventVideo);
  
    if (currentEventVideo[0][0].eventVideo !== eventVideo) {
      const checkEventVideoQuery = "SELECT eventID FROM unusualevents WHERE eventVideo = ?";
      let eventVideoExists;
      try {
        eventVideoExists = await databaseConnection.query(checkEventVideoQuery, [eventVideo]);
        console.log("Existing event videos with the same name:", eventVideoExists[0].length);
        if (eventVideoExists[0].length) {
          console.error("Event video already exists in the system, please choose another event video");
          res.status(400).send(JSON.stringify("Event video already exists in the system, please choose another event video"));
          return;
        }
      } catch (e) {
        console.error("Error checking existing event videos:", e);
        res.status(500).send(JSON.stringify("Server error"));
        return;
      }
    }
  
    let sql = `UPDATE unusualevents SET`;
    const values = [];
  
    if (eventName !== undefined) {
      sql += ` eventName = ?,`;
      values.push(eventName);
    }
  
    if (eventType !== undefined) {
      sql += ` eventType = ?,`;
      values.push(eventType);
    }
  
    if (eventDate !== undefined) {
        const formattedEventDate = new Date(eventDate).toISOString().slice(0, 19).replace('T', ' ');
        sql += ` eventDate = ?,`;
        values.push(formattedEventDate);
    }
    
  
    if (eventVideo !== undefined) {
      sql += ` eventVideo = ?,`;
      values.push(eventVideo);
    }
    // Remove the trailing comma from the SQL statement
    sql = sql.slice(0, -1);
  
    sql += ` WHERE eventID = ?`;
    values.push(id);
  
    console.log("Executing SQL query:", sql, "with values:", values);
  
    // Execute the SQL update query
    try {
      await databaseConnection.query(sql, values);
      console.log("Event updated successfully");
    } catch (e) {
      console.error("Error updating event:", e);
      res.status(400).send(JSON.stringify("Error updating event"));
      return;
    }
  
    // Fetch the updated user data after the update
    const getEventQuery = "SELECT * FROM unusualevents WHERE eventID = ?";
    let result;
  
    try {
      result = await databaseConnection.query(getEventQuery, [id]);
      console.log("Updated event details:", result);
    } catch (e) {
      console.error("Error fetching updated event details:", e);
      res.status(400).send(JSON.stringify("Error fetching updated event details"));
      return;
    }
  
    res.json(result[0]);
  });
  



  /////POST/////

  unusualEventsRouter.post("/api/unusualevents", async (req, res) => {
    const eventName = req.body.eventName;
    const eventType = req.body.eventType;
    const eventDate = req.body.eventDate;
    const eventVideo = req.body.eventVideo;
  
    if (!eventName || !eventType || !eventDate || !eventVideo) {
      res.status(400).send(JSON.stringify("Please fill in all required fields"));
      return;
    }
  
    // בדיקה אם הוידיאו כבר קיים במערכת
    const checkEventQuery = "SELECT * FROM unusualevents WHERE eventVideo = ?";
    let EventExists;
    try {
        EventExists = await databaseConnection.query(checkEventQuery, [eventVideo]);
      if (EventExists[0].length) {
        res.status(400).send(JSON.stringify("Video already exists in the system, please choose another video"));
        return;
      }
    } catch (e) {
      res.status(500).send(JSON.stringify("Server error"));
      return;
    }
  
    const postEventQuery = "INSERT INTO unusualevents (eventName, eventType, eventDate, eventVideo) VALUES (?, ?, ?, ?)";
    let result;
    try {
      result = await databaseConnection.query(postEventQuery, [eventName, eventType, eventDate, eventVideo]);
      const newEventId = result[0].insertId;
      const newEvent = { eventID: newEventId, eventName, eventType, eventDate, eventVideo };
      res.json(newEvent);
    } catch (e) {
      res.status(500).send(JSON.stringify("Server error"));
      return;
    }
  });
  
  
  
  
  
  

























module.exports = unusualEventsRouter;