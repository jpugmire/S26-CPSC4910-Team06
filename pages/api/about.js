// pages/api/about.js
import mysql from "mysql2/promise";

export default async function handler(req, res) {
  const con = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  const [rows] = await con.execute(
    "SELECT * FROM Version ORDER BY VersionCreated LIMIT 1;"
  );

  await con.end();

  res.status(200).json({
    message: "About Page!",
    version: rows[0].VersionNum,
    created: rows[0].VersionCreated,
  });
}

