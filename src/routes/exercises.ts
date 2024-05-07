import express from "express";
import { client } from "../db/db";
import { verifyToken } from "./auth";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  const { userId } = req.query;
  try {
    if (!userId) return res.status(401).json("userId is required.");
    const result = await client.execute(
      `SELECT * FROM exercise WHERE user_id IS NULL OR user_id = '${userId}'`
    );
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

router.put("/:exerciseId", verifyToken, async (req, res) => {
  const exerciseId = req.params.exerciseId;
  const { name, description } = req.body;
  try {
    const result = await client.execute({
      sql: "UPDATE exercise SET exercise_name = ?, exercise_description = ? WHERE exercise_id = ?",
      args: [name, description, exerciseId],
    });
    if (result.rowsAffected <= 0)
      return res.status(404).json("Exercise not found");
    res.status(200).json({
      id: exerciseId,
      name: name,
      description: description,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error edit exercise.");
  }
});

router.get("/:exerciseId", verifyToken, async (req, res) => {
  const exerciseId = req.params.exerciseId;
  try {
    const result = await client.execute(
      `SELECT * FROM exercise WHERE exercise_id = '${exerciseId}'`
    );
    if (result.rows.length <= 0) res.status(404).json("Exercise not found");
    const rowsWithoutUserIdColumn = result.rows.map((row) => {
      return {
        id: row["exercise_id"],
        name: row["exercise_name"],
        description: row["exercise_description"],
      };
    });
    res.status(200).json(rowsWithoutUserIdColumn[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error fetching exercise.");
  }
});

router.delete("/:exerciseId", verifyToken, async (req, res) => {
  const exerciseId = req.params.exerciseId;
  try {
    const result = await client.execute(
      `DELETE FROM exercise WHERE exercise_id = ${exerciseId}`
    );
    if (result.rowsAffected <= 0)
      return res.status(404).json("Exercise not found.");
    res.status(204).end();
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error delete exercise list");
  }
});

router.post("/", verifyToken, async (req, res) => {
  const { name, description, userId } = req.body;
  try {
    const result = await client.execute({
      sql: "INSERT INTO exercise (user_id, exercise_name, exercise_description) VALUES (?, ?, ?)",
      args: [userId, name, description ?? ""],
    });
    if (result.rowsAffected <= 0)
      res.status(500).json("Error adding exercise list.");
    res.status(201).json({
      id: Number(result.lastInsertRowid),
      name: name,
      description: description,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Error adding exercise list.");
  }
});

export { router as exercisesRouter };
