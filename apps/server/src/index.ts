import express from "express";

const app = express();

app.get("/", (_, res) => {
  res.send("College Trading API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});