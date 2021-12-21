import express from "express";
import cors from "cors";
import mysql from "mysql";
import dotenv from "dotenv";
import passport from "passport";
import LocalStrategy from "passport-local";

dotenv.config();
const app = express();
app.use(cors({ credentials: true, origin: true }));

var db = mysql.createConnection(process.env.JAWSDB_URL);
db.connect();

passport.use(
  new LocalStrategy(function verify(email, password, cb) {
    db.query(
      "SELECT * FROM user WHERE email = " +
        email +
        " AND password = " +
        password,
      function (err, result, fields) {
        if (err) {
          return cb(err);
        }
        if (!result) {
          return cb(null, false, { message: "Incorrect email or password." });
        }
        return cb(null, user);
      }
    );
  })
);

app.post(
  "/login",
  passport.authenticate("local", { failureMessage: true }),
  (req, res) => {
    res.sendStatus(200);
  }
);

app.get("/lecturehall/all", async function (req, res, next) {
  db.query("SELECT * FROM lecture_hall", function (err, result, fields) {
    if (err) throw err;
    res.send(result);
  });
});

app.delete("/allocation/:id", (req, res) => {
  res.send(
    `Server: Got a DELETE request to delete lecture hall with id: ${req.params.id}`
  );
});

app.get("/", (req, res) => {
  res.send("Hello");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Running on PORT ${PORT}`);
});
