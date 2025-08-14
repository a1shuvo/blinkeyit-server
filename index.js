import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/connectDB.js";
dotenv.config();

const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan());
app.use(
  helmet({
    crossOriginOpenerPolicy: false,
  })
);

const PORT = 8080 || process.env.PORT;

app.get("/", (request, response) => {
  // Server to client
  response.json({
    message: "Server is running on " + PORT,
  });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on", PORT);
  });
});
