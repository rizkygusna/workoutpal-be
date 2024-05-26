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

export { router as exerciseSetsRouter };
