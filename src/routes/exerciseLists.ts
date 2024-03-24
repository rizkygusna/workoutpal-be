import express from "express";
import { client } from "../db/db";
import { verifyToken } from "./auth";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const { userId } = req.query;
  console.log("Received id: ", userId);
  try {
    if (!userId) return res.status(401).json("userId is required.");
    const result = await client.execute(
      `SELECT * FROM exercise_list WHERE user_id = '${userId}'`
    );
    res.json(result.rows);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error fetching exercise list.");
  }
});

router.post("/", verifyToken, async (req, res) => {
  const { listName, description, userId } = req.body;
  try {
    const result = await client.execute(
      `INSERT INTO exercise_list (user_id, list_name, description) VALUES ('${userId}', '${listName}', '${
        description ?? ""
      }')`
    );
    if (result.rowsAffected <= 0)
      return res.status(404).json("Exercise list not found");
    res.json({ name: listName, description: description });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error adding exercise list.");
  }
});

export { router as exerciseListsRouter };
