import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", routes);

app.use(errorHandler);

export default app;
