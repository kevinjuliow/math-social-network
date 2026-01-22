import { Response } from 'express';
import { PrismaClient } from '../../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { AuthRequest } from '../middleware/auth';

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter: pool })

export const getPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roots = await prisma.post.findMany({
      // where: { parentId: null },
      orderBy: { createdAt: 'desc' },
      include: { 
        author: { select: { username: true } },
        _count: { select: { children: true } } 
      }
    });
    res.json({
      "data" : roots 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};


export const createRoot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { value } = req.body; 
    const userId = req.user?.userId;

    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const post = await prisma.post.create({
      data: {
        value: parseFloat(value),
        result: parseFloat(value), 
        operation: null,
        authorId: userId,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create root' });
  }
};

export const reply = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { parentId, operation, value } = req.body;
    const userId = req.user?.userId;

    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const parent = await prisma.post.findUnique({
      where: { id: parseInt(parentId) }
    });

    if (!parent) {
      res.status(404).json({ error: 'Parent post not found' });
      return;
    }

    const inputVal = parseFloat(value);
    let newResult = 0;
    const prevResult = parent.result;

    switch (operation) {
      case '+': newResult = prevResult + inputVal; break;
      case '-': newResult = prevResult - inputVal; break;
      case '*': newResult = prevResult * inputVal; break;
      case '/': 
        if (inputVal === 0) { res.status(400).json({ error: 'Division by zero' }); return; }
        newResult = prevResult / inputVal; 
        break;
      default: res.status(400).json({ error: 'Invalid operation' }); return;
    }

    const child = await prisma.post.create({
      data: {
        parentId: parseInt(parentId),
        operation,
        value: inputVal,
        result: newResult,
        authorId: userId,
      },
    });

    res.status(201).json(child);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to reply' });
  }
};