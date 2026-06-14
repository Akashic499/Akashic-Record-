import express from 'express';
import { db, records } from '../db';
import { eq } from 'drizzle-orm';

export const recordsRouter = express.Router();

// Get all records
recordsRouter.get('/', async (req, res, next) => {
  try {
    const allRecords = await db.query.records.findMany();
    res.json(allRecords);
  } catch (error) {
    next(error);
  }
});

// Get record by ID
recordsRouter.get('/:id', async (req, res, next) => {
  try {
    const recordId = parseInt(req.params.id);
    const record = await db.query.records.findFirst({
      where: eq(records.id, recordId),
    });
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(record);
  } catch (error) {
    next(error);
  }
});

// Create record
recordsRouter.post('/', async (req, res, next) => {
  try {
    const { userId, title, content, metadata, isPublic } = req.body;
    
    if (!userId || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newRecord = await db.insert(records).values({
      userId,
      title,
      content,
      metadata,
      isPublic,
    }).returning();
    
    res.status(201).json(newRecord[0]);
  } catch (error) {
    next(error);
  }
});

// Update record
recordsRouter.put('/:id', async (req, res, next) => {
  try {
    const recordId = parseInt(req.params.id);
    const { title, content, metadata, isPublic } = req.body;
    
    const updatedRecord = await db
      .update(records)
      .set({
        title,
        content,
        metadata,
        isPublic,
        updatedAt: new Date(),
      })
      .where(eq(records.id, recordId))
      .returning();
    
    if (updatedRecord.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(updatedRecord[0]);
  } catch (error) {
    next(error);
  }
});

// Delete record
recordsRouter.delete('/:id', async (req, res, next) => {
  try {
    const recordId = parseInt(req.params.id);
    
    const deletedRecord = await db
      .delete(records)
      .where(eq(records.id, recordId))
      .returning();
    
    if (deletedRecord.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    next(error);
  }
});
