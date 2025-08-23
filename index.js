import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/connectDB.js";
import userRouter from "./route/user.route.js";
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
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));
app.use(
  helmet({
    crossOriginOpenerPolicy: false,
  })
);

const PORT = process.env.PORT || 8080;

app.get("/", (request, response) => {
  // Server to client
  response.json({
    message: "Server is running on " + PORT,
  });
});

app.use("/api/user", userRouter);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on", PORT);
  });
});
