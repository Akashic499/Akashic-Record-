import express from 'express';
import { db, users } from '../db';
import { eq } from 'drizzle-orm';

export const usersRouter = express.Router();

// Get all users
usersRouter.get('/', async (req, res, next) => {
  try {
    const allUsers = await db.query.users.findMany();
    res.json(allUsers);
  } catch (error) {
    next(error);
  }
});

// Get user by ID
usersRouter.get('/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Create user
usersRouter.post('/', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newUser = await db.insert(users).values({
      email,
      password,
      name,
    }).returning();
    
    res.status(201).json(newUser[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(error);
  }
});

// Update user
usersRouter.put('/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { email, name } = req.body;
    
    const updatedUser = await db
      .update(users)
      .set({
        email,
        name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (updatedUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(updatedUser[0]);
  } catch (error) {
    next(error);
  }
});

// Delete user
usersRouter.delete('/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    
    const deletedUser = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();
    
    if (deletedUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});
