import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mainRoute from "./src/routes/index.route.js";

// declare application
const app = express();

// middlewares
app.use(morgan("combined")); // logs the request
app.use(express.json()); // handles incoming json data
app.use(cookieParser()); // handles cookies
app.use(cors()); // cross origin resource sharing

// main route : All routes start from here
app.use("/api", mainRoute);

export default app;
