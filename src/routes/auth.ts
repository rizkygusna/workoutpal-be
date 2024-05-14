import { Router, Response, Request, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import 'dotenv/config';
import { client } from '../db/db';

export interface IUser {
  email: string;
  password: string;
  fullName: string;
}

interface ILogin {
  email: string;
  password: string;
}

const router = Router();
const JWT_SECRET: Secret = process.env.JWT_SECRET ?? 'secret';

// verify token that sent to request header
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, JWT_SECRET, (err) => {
      if (err) return res.sendStatus(403);
      next();
    });
    return;
  }
  res.sendStatus(401);
};

async function getUserByEmail(email: string) {
  if (!email) throw 'Missing argument';
  try {
    const response = await client.execute({
      sql: 'SELECT * FROM user WHERE email = ?',
      args: [email],
    });
    if (response.rows.length <= 0) return null;
    return response.rows[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

router.post('/register', async (req, res) => {
  console.log(req.body);
  const { email, password, fullName }: IUser = req.body;

  const user = await client.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });

  if (user.rows.length > 0) return res.json({ message: 'Email already used!' });

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await client.execute({
      sql: 'INSERT INTO users(email, full_name, password) VALUES(?, ?, ?)',
      args: [email, fullName, hashedPassword],
    });
    return res.status(201).json('User added!');
  } catch (error) {
    console.log(error);
    return res.status(500).json('Error when adding user.');
  }
});

router.post('/login', async (req, res) => {
  const { email, password }: ILogin = req.body;
  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json('User not found.');
    console.log(user);

    const isPasswordValid = await bcrypt.compare(password, user.password as string);
    if (!isPasswordValid) return res.json({ message: 'Password incorrect!' });
    // create token for the user
    const token = jwt.sign({ id: user.email }, JWT_SECRET);
    const userObject = { email: user.email, fullName: user.full_name };
    res.json({ token, user: userObject });
  } catch (error) {
    console.log(error);
    return res.status(500).json('Error when logging in.');
  }
});

router.get('/user', verifyToken, async (req, res) => {
  const { email } = req.query;
  try {
    if (!email) return res.status(401).json('Email is required.');
    const user = await getUserByEmail(email as string);
    if (!user) return res.status(404).json('User not found.');
    const userObject = { email: user.email, fullName: user.full_name };
    res.json(userObject);
  } catch (error) {
    console.log(error);
    return res.status(500).json('Error when fetching user.');
  }
});

export { router as authRouter };
