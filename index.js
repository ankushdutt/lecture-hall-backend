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
      return res.status(201).send("Incorrect email or password");
    }
    req.login(user, (err) => {
      if (err) throw err;
      res.status(200).send("Successfully Authenticated");
    });
  })(req, res, next);
});

app.post("/lecturehall/available",async (req,res) => {

  if(!req.body.capacity || !req.body.start || !req.body.end)
    return res.status(400).send({msg: 'Invalid Input'})

  const sql = "select * from lecture_hall " +
  "where max_capacity >= " + req.body.capacity + " " +
  "and lh_id not in(" +
  "select l.lh_id from lecture_hall l, booking b " +
  "where l.lh_id = b.lh_id and " +
  "b.alloc_start = '" + req.body.start + "' and " +
  "b.alloc_end = '" + req.body.end + "')";

  db.query(sql,(err,result) => {
    if(err) throw err;
    res.send(result);
  })
})

app.post("/lecturehall/booked", async (req,res) => {
  
  if(!req.body.capacity || !req.body.start || !req.body.end)
    return res.status(400).send({msg: 'Invalid Input'})

  const sql = "select * from lecture_hall l, booking b " +
  "where l.lh_id = b.lh_id and " +
  "max_capacity >= " + req.body.capacity + " and " +
  "b.alloc_start = '" + req.body.start + "' and " +
  "b.alloc_end = '" + req.body.end + "'";

  db.query(sql, (err,result) => {
    if(err) throw err;
    res.send(result);
  })
})

app.post('/lecturehall/available/:lh_id',(req,res) => {
  const sql = "insert into booking " +
  "(user_id,lh_id,alloc_start,alloc_end,purpose,booking_status) " +
  "values(" + req.body.user_id + "," +
  req.params.lh_id + ",'" + req.body.start + "','" +
  req.body.end +"','" + req.body.purpose + "'," +
  req.body.status + ")"

  db.query(sql,(err,result) => {
    if(err) throw err;
    res.send({msg:"Lecture Hall is booked",result});
  })
})

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

// Listen
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Running on PORT ${PORT}`);
});
