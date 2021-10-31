import express from "express";
import cors from "cors";
import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());

console.log(process.env.JAWSDB_URL);
var connection = mysql.createConnection(process.env.JAWSDB_URL);
connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

app.get("/", (req, res) => {
  res.send("Hello");
});

app.delete("/allocation/:id", (req, res) => {
  res.send(
    `Server: Got a DELETE request to delete lecture hall with id: ${req.params.id}`
  );
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Running on PORT ${PORT}`);
});
