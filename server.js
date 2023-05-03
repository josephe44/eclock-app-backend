import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();
import { errorHandler } from "./middleware/errorMiddleware.js";
import { connectDB } from "./config/db.js";
import compress from "compression";
import helmet from "helmet";
import userRouter from "./api/userAuth/userRouter.js";
import responses from "./helper/responses.js";

// assign a port
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

const app = express();

const allowCompression = (req, res) => {
  if (req.headers["x-no-compression"]) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compress.filter(req, res);
};

// request logging. dev: console | production: file
app.use(morgan("dev"));

// parse body params and attache them to req.body
app.use(express.json());

// gzip compression
app.use(compress({ filter: allowCompression }));

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// mount api v1 routes
app.use("/api/auth/", userRouter);

// Error Handler
app.use(errorHandler);

// handles all routes that does not exists in the system
app.all("*", (req, res) => {
  responses.notFound({ res, message: `Route does not exists` });
});

app.listen(PORT, () => console.log(`Server started ${PORT}`));
