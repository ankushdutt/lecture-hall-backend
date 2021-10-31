import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

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
