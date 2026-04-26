import type { Request, Response, NextFunction } from 'express';
import { createClerkClient, verifyToken } from '@clerk/backend';
import prisma from '../config/database.js';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    const userId = claims.sub;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden: Admin only' });
      return;
    }

    (req as Request & { userId: string }).userId = userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
}

export async function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    const userId = claims.sub;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    (req as Request & { userId: string }).userId = userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
}