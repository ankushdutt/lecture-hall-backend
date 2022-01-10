const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const dotenv = require("dotenv");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

dotenv.config();
const app = express();

// Database Connection
var db = mysql.createConnection(process.env.JAWSDB_URL);
db.connect();

// Middlewares
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(passport.initialize());

passport.use(
  new LocalStrategy(function verify(username, password, cb) {
    console.log("LocalStrategy ", username, password);
    db.query(
      "SELECT * FROM user WHERE email = '" +
        username +
        "' AND password = '" +
        password +
        "';",
      function (err, user, fields) {
        if (err) {
          return cb(err);
        }
        if (user.length === 0) {
          return cb(null, false, { message: "Incorrect email or password." });
        }
        return cb(null, user);
      }
    );
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

// Routes
app.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    console.log("req: ", req.body);
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(202).send("Incorrect email or password");
    }
    req.login(user, (err) => {
      if (err) throw err;
      if (user[0].designation === "admin") res.status(201).send(user);
      else res.status(200).send(user);
    });
  })(req, res, next);
});

app.post("/lecturehall/available", async (req, res) => {
  if (!req.body.capacity || !req.body.start || !req.body.end)
    return res.status(400).send({ msg: "Invalid Input" });

  const sql =
    "select * from lecture_hall " +
    "where max_capacity >= " +
    req.body.capacity +
    " " +
    "and lh_id not in(" +
    "select l.lh_id from lecture_hall l, booking b " +
    "where l.lh_id = b.lh_id and " +
    "b.alloc_start = '" +
    req.body.start +
    "' and " +
    "b.alloc_end = '" +
    req.body.end +
    "')";

  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/lecturehall/booked", async (req, res) => {
  if (!req.body.capacity || !req.body.start || !req.body.end)
    return res.status(400).send({ msg: "Invalid Input" });

  const sql =
    "select * from lecture_hall l, booking b " +
    "where l.lh_id = b.lh_id and " +
    "b.alloc_start = '" +
    req.body.start +
    "' and " +
    "b.alloc_end = '" +
    req.body.end +
    "' " +
    "and max_capacity >= " +
    req.body.capacity;

  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/lecturehall/available/:lh_id", (req, res) => {
  const sql =
    "insert into booking " +
    "(user_id,lh_id,alloc_start,alloc_end,purpose,booking_status) " +
    "values(" +
    req.body.user_id +
    "," +
    req.params.lh_id +
    ",'" +
    req.body.start +
    "','" +
    req.body.end +
    "','" +
    req.body.purpose +
    "'," +
    req.body.status +
    ")";
  console.log(sql);
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

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

// Inserts into Time Table database
app.post("/admin/timetable", (req, res) => {
  let t_id = [],
    lt_no = [],
    day = [],
    batch = [],
    subject = [],
    lecturer = [],
    time_start = [],
    time_end = [],
    enrolled_student_count = [];
  for (let i = 1; i < req.body.length; i++) {
    t_id.push(req.body[i].data[0]);
    lt_no.push(req.body[i].data[1]);
    day.push(req.body[i].data[2]);
    batch.push(req.body[i].data[3]);
    subject.push(req.body[i].data[4]);
    lecturer.push(req.body[i].data[5]);
    time_start.push(req.body[i].data[6]);
    time_end.push(req.body[i].data[7]);
    enrolled_student_count.push(req.body[i].data[8]);
  }
  let d = [];
  d.push(t_id);
  d.push(lt_no);
  d.push(day);
  d.push(batch);
  d.push(subject);
  d.push(lecturer);
  d.push(time_start);
  d.push(time_end);
  d.push(enrolled_student_count);
  console.log(d);
  let sql =
    "INSERT INTO time_table (t_id, lt_no, day, batch, subject, lecturer, time_start, time_end, enrolled_student_count) VALUES (";
  let k = 0;
  for (let i = 0; i < d[0].length; i++) {
    for (let j = 0; j < d.length; j++) {
      if (j == d.length - 1) {
        sql += "'" + d[j][k] + "'";
      } else {
        sql += "'" + d[j][k] + "',";
      }
    }
    if (i == d[0].length - 1) {
      sql += ");";
    } else {
      sql += "), (";
    }
    k = k + 1;
  }

  console.log(sql);
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// Empty Time Table Database
app.delete("/admin/timetable", (req, res) => {
  db.query("truncate time_table", (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});

// DELETE user from database
app.delete("/users/:id", (req, res) => {
  db.query(
    `DELETE FROM user WHERE user_id = '$(req.params.id)'`,
    (err, result, fields) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

// GET Users from database
app.get("/users", (req, res) => {
  db.query("SELECT * FROM user", (err, result, fields) => {
    if (err) throw err;
    res.send(result);
  });
});

// GET Pending Bookings
app.get("/admin/pending", (req, res) => {
  db.query(
    "SELECT * FROM booking WHERE booking_status = 2",
    (err, result, fields) => {
      if (err) throw err;
      res.send(result);
    }
  );
});

// Allocate from parsed CSV
app.post("/allocate", (req, res) => {
  console.log("req: ", req.body);
  res.send("Successfully allocated");
});
app.post("/lecturehall/profile/searchemail", function (req, res) {
  if (!req.body.email) {
    res.status(400).send({ msg: "Invalid Input" });
  } else {
    var email = req.body.email;
    console.log(email);
    const sql = "SELECT * FROM user WHERE email ='" + email + "'";
    db.query(sql, (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  }
});

app.get("/lecturehall/allocated/:user_id", (req, res) => {
  const sql = `SELECT * FROM booking WHERE user_id = ${req.params.user_id}`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.put("/lecturehall/profile/updateemail", function (req, res) {
  var newemail = req.body.newemail;
  var oldemail = req.body.oldemail;
  const sql =
    "update user " +
    "set email = '" +
    newemail +
    "' where email = '" +
    oldemail +
    "'";

  db.query(sql, (err, result) => {
    console.log(result.message);
    if (err) throw err;
    if (result.affectedRows != 0) res.status(200).send("ok");
    else {
      res.status(404).send("Not found");
    }
  });
});

app.put("/lecturehall/profile", function (req, res) {
  if (!req.body.password) return res.status(400).send({ msg: "Invalid Input" });
  var password = req.body.password;
  const sql =
    "update user " +
    "set password = " +
    password +
    "where user_id = " +
    user_id;

  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send({ msg: "Incorrect password", result });
  });
});

app.get("/", (req, res) => {
  res.send("Hello!!!");
});

// Listen
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Running on PORT ${PORT}`);
});
