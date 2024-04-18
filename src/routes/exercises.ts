import express from "express";
import { client } from "../db/db";
import { verifyToken } from "./auth";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await client.execute(`SELECT * FROM exercise`);
    const rowsWithoutUserIdColumn = result.rows.map((row) => {
      return {
        id: row["exercise_id"],
        name: row["exercise_name"],
        description: row["exercise_description"],
      };
    });
    res.status(200).json(rowsWithoutUserIdColumn);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error fetching exercise list.");
  }
});

export { router as exercisesRouter };
