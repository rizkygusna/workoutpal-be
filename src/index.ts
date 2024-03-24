import express, { Express } from "express";
import cors from "cors";
import "dotenv/config";
import { authRouter } from "./routes/auth";
import { exerciseListsRouter } from "./routes/exerciseLists";

const app: Express = express();
const port = process.env.PORT || 4000;

// Built-in middleware for parsing JSON bodies
app.use(express.json());
app.use(cors());

// Built-in middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/exerciseLists", exerciseListsRouter);

app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});
