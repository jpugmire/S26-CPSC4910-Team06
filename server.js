const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from the AWS Node.js server!\n");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Start code for initial database connection.

let mysql = require('mysql');

let con = mysql.createConnection({
  
});