import express from "express";
import dotenv from "dotenv";
dotenv.config();

import { initDB } from "./config/db.js"
import rateLimiter from "./middleware/rateLimiter.js";

import transactionsRoute from "./routes/transactionsRoute.js"

const app = express();


app.use(express.json());
// app.use(rateLimiter)

const port = process.env.PORT || 3000;


app.get("/", (req, res) => {
  res.send("Backend is running...");
});


app.use("/api/transactions", transactionsRoute)


initDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
});
