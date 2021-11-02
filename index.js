import express from "express";
import cors from "cors";
import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors({ credentials: true, origin: true }));

console.log(process.env.JAWSDB_URL);
var con = mysql.createConnection(process.env.JAWSDB_URL);

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/lecturehall/all", async function (req, res, next) {
  con.connect(function (err) {
    if (err) throw err;
    con.query("SELECT * FROM lecture_hall", function (err, result, fields) {
      if (err) throw err;
      res.send(result);
    });
  });
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
