
// Need to include .env file for credintials
require('dotenv').config();

const http = require("http");

const PORT = process.env.PORT || 3000;

// Start code for initial database connection.
let mysql = require('mysql');

let con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected to DB!");
});

const server = http.createServer((req, res) => {
  if (req.url == "/about") {
    con.query("SELECT * FROM Version ORDER BY VersionCreated LIMIT 1;", function (err, result) {  // Query the database for version information (always pulls latest record).
      if (err) throw err;
      console.log("Version Number: " + JSON.stringify(result));
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("About Page!\n\nVersion: " + result[0].VersionNum + "\nVersion created on: " + result[0].VersionCreated + "\n");
  });
  }

  else {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello from the AWS Node.js server!\n\n");
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
