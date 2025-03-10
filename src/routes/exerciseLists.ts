import express from 'express';
import { client } from '../db/db';
import { verifyToken } from './auth';
import { InStatement } from '@libsql/client/.';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const { userId } = req.query;
  try {
    if (!userId) return res.status(401).json('userId is required.');
    const result = await client.execute(`SELECT * FROM exercise_list WHERE user_id = '${userId}'`);
    const rowsWithoutUserIdColumn = result.rows.map((row) => {
      return {
        id: row['list_id'],
        name: row['list_name'],
        description: row['description'],
      };
    });
    return res.status(200).json(rowsWithoutUserIdColumn);
  } catch (error) {
    console.log(error);
    return res.status(500).json('Error fetching exercise list.');
  }
});

router.get('/:listId', verifyToken, async (req, res) => {
  const listId = req.params.listId;
  try {
    const result = await client.execute(`SELECT * FROM exercise_list WHERE list_id = ${listId}`);
    if (result.rows.length <= 0) res.status(404).json('List not found');
    const rowsWithoutUserIdColumn = result.rows.map((row) => {
      return {
        id: row['list_id'],
        name: row['list_name'],
        description: row['description'],
      };
    });
    res.status(200).json(rowsWithoutUserIdColumn[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json('Error fetching exercise list.');
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { listName, description, userId } = req.body;
  try {
    const result = await client.execute(
      `INSERT INTO exercise_list (user_id, list_name, description) VALUES ('${userId}', '${listName}', '${
        description ?? ''
      }')`
    );
    if (result.rowsAffected <= 0) res.status(500).json('Error adding exercise list.');
    res.status(201).json({
      id: Number(result.lastInsertRowid),
      name: listName,
      description: description,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json('Error adding exercise list.');
  }
});

router.put('/:listId', verifyToken, async (req, res) => {
  const listId = req.params.listId;
  const { listName, description } = req.body;

  try {
    const result = await client.execute({
      sql: 'UPDATE exercise_list SET list_name = ?, description = ? WHERE list_id = ?',
      args: [listName, description, listId],
    });
    if (result.rowsAffected <= 0) return res.status(404).json('Exercise list not found');
    res.status(200).json({
      id: Number(listId),
      name: listName,
      description: description,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json('Error edit exercise list.');
  }
});

router.delete('/:listId', verifyToken, async (req, res) => {
  const listId = req.params.listId;
  try {
    const result = await client.execute(`DELETE FROM exercise_list WHERE list_id = ${listId}`);
    if (result.rowsAffected <= 0) return res.status(404).json('Exercise list not found');
    res.status(204).end();
  } catch (error) {
    console.log(error);
    return res.status(500).json('Error delete exercise list');
  }
});

// MANAGE EXERCISES IN AN EXERCISE LIST

router.get('/:listId/exercises', verifyToken, async (req, res) => {
  const listId = req.params.listId;
  try {
    const result = await client.execute(
      `SELECT e.exercise_id, e.exercise_name FROM exercise_list_exercise ele JOIN exercise e ON ele.exercise_id = e.exercise_id WHERE ele.list_id = ${listId}`
    );
    if (result.rows.length <= 0) return res.status(200).json([]);
    const rowsWithoutUserIdColumn = result.rows.map((row) => {
      return {
        id: row['exercise_id'],
        name: row['exercise_name'],
      };
    });
    return res.status(200).json(rowsWithoutUserIdColumn);
  } catch (error) {
    console.log(error);
    return res.status(500).json('Error fetching exercises.');
  }
});

router.put('/:listId/exercises', verifyToken, async (req, res) => {
  const { exerciseIds } = req.body;
  const listId = parseInt(req.params.listId);

  if (!Array.isArray(exerciseIds) || exerciseIds.length <= 0) {
    return res.status(400).json({ message: 'exerciseIds should be a non-empty array.' });
  }

  try {
    // delete existing relations
    const statements: InStatement[] = [{ sql: 'DELETE FROM exercise_list_exercise WHERE list_id = ?', args: [listId] }];
    // insert new relations
    for (const exerciseId of exerciseIds) {
      statements.push({
        sql: 'INSERT INTO exercise_list_exercise(list_id, exercise_id) VALUES (?, ?)',
        args: [listId, exerciseId],
      });
    }

    await client.batch(statements, 'write');

    return res.status(200).json({ message: 'Exercises added successfully.' });
  } catch (error) {
    console.error('Error updating exercises:', error);

    let errorMessage = 'Error updating exercises.';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('FOREIGN KEY constraint failed')) {
        errorMessage = 'One or more exercise IDs do not exist.';
        statusCode = 400;
      } else if (error.message.includes('UNIQUE constraint failed')) {
        errorMessage = 'Duplicate exercise IDs were provided.';
        statusCode = 400;
      }

      return res.status(statusCode).json({
        message: errorMessage,
        error: error.message,
      });
    }
  }
});

router.delete('/:listId/exercises/:exerciseId', verifyToken, async (req, res) => {
  const listId = req.params.listId;
  const exerciseId = req.params.exerciseId;

  try {
    const result = await client.execute(
      `DELETE FROM exercise_list_exercise WHERE list_id = ${listId} AND exercise_id = ${exerciseId}`
    );
    if (result.rowsAffected <= 0) return res.status(404).json('Exercise not found');
    res.status(204).end();
  } catch (error) {
    console.log(error);
    return res.status(500).json('Error delete exercise from exercise list');
  }
});

export { router as exerciseListsRouter };
