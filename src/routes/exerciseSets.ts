import express from 'express';
import { verifyToken } from './auth';
import { client } from '../db/db';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const { listId, exerciseId } = req.query;
  if (!listId) return res.status(401).json('listId is required.');
  if (!exerciseId) return res.status(401).json('exerciseId is required.');
  try {
    const result = await client.execute(
      `SELECT * FROM exercise_set where list_id = ${listId} AND exercise_id = ${exerciseId}`
    );
    const transformedRows = result.rows.map((row) => {
      return {
        id: row['set_id'],
        weight: row['set_weight'],
        repetition: row['set_repetition'],
        dateCreated: row['set_date_created'],
      };
    });
    res.status(200).json(transformedRows);
  } catch (error) {
    console.log(error);
    return res.status(500).json('Error fetching sets');
  }
});

router.get('/:setId', verifyToken, async (req, res) => {
  const setId = req.params.setId;

  try {
    const result = await client.execute(`SELECT * FROM exercise_set WHERE set_id = ${setId}`);
    if (result.rows.length <= 0) res.status(404).json('List not found');
    const transformedRows = result.rows.map((row) => {
      return {
        id: row['set_id'],
        weight: row['set_weight'],
        repetition: row['set_repetition'],
        dateCreated: row['set_date_created'],
      };
    });
    res.status(200).json(transformedRows[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json('Error fetching set');
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { weight, repetition, listId, exerciseId } = req.body;
  const dateCreated = new Date().toISOString();

  try {
    const result = await client.execute({
      sql: 'INSERT INTO exercise_set (set_weight, set_repetition, set_date_created, list_id, exercise_id) VALUES (?, ?, ?, ?, ?)',
      args: [weight, repetition, dateCreated, listId, exerciseId],
    });
    if (result.rowsAffected <= 0) res.status(500).json('Error adding exercise list.');
    res.status(201).json({
      id: Number(result.lastInsertRowid),
      weight: weight,
      repetition: repetition,
      dateCreated: dateCreated,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

export { router as exerciseSetsRouter };
