const mysql = require("mysql2");
const secret = require("./password.json");

const databaseConnection = mysql.createPool({
    connectionLimit: 100,
    host: "localhost",
    user: "root",
    password: secret.password,
    port: 3306,
    database: "project7",
    debug: false
  }).promise();
  
  module.exports = {databaseConnection};