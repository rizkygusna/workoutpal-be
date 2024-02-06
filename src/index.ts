import express, { Express } from "express";
import "dotenv/config";
import { userRouter } from "./routes/users";

const app: Express = express();
const port = process.env.PORT || 4000;

// Built-in middleware for parsing JSON bodies
app.use(express.json());

// Built-in middleware for parsing URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.use("/auth", userRouter);

app.listen(port, function () {
  console.log(`App listening on port ${port}!`);
});
