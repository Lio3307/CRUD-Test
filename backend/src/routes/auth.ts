import { Router } from 'express';
import type { Request, Response } from 'express';
import { Webhook } from 'svix';
import prisma from '../config/database.js';

const router = Router();

// Check if any admin exists - first user to sign up becomes admin
async function isFirstUser(): Promise<boolean> {
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
  return adminCount === 0;
}

// Get email from Clerk webhook data - handles多种 sign-up methods
function extractEmail(data: Record<string, unknown>): string {
  // Try email_addresses array first (standard email sign-up)
  const emailAddresses = data.email_addresses as Array<{ email_address: string }> | undefined;
  if (emailAddresses && emailAddresses.length > 0 && emailAddresses[0]?.email_address) {
    return emailAddresses[0].email_address;
  }

  // For username/password-only sign-ups, use username@clerk.local as placeholder
  const username = data.username as string | undefined;
  if (username) {
    return `${username}@clerk.local`;
  }

  // Fallback: use user id as identifier
  const id = data.id as string;
  return `${id}@clerk.local`;
}

// Get name from Clerk webhook data
function extractName(data: Record<string, unknown>): string | null {
  const firstName = data.first_name as string | undefined;
  const lastName = data.last_name as string | undefined;
  const username = data.username as string | undefined;

  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(' ') || null;
  }

  // For username-only sign-ups, use username as name
  if (username) {
    return username;
  }

  return null;
}

router.post('/webhook', async (req: Request, res: Response) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    res.status(500).json({ error: 'Missing CLERK_WEBHOOK_SECRET' });
    return;
  }

  const payload = JSON.stringify(req.body);
  const headers = {
    'svix-id': req.headers['svix-id'] as string,
    'svix-timestamp': req.headers['svix-timestamp'] as string,
    'svix-signature': req.headers['svix-signature'] as string,
  };

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: { type: string; data: Record<string, unknown> };

  try {
    evt = wh.verify(payload, headers) as { type: string; data: Record<string, unknown> };
  } catch {
    res.status(400).json({ error: 'Invalid webhook signature' });
    return;
  }

  if (evt.type === 'user.created' || evt.type === 'user.updated') {
    const data = evt.data;
    const id = data.id as string;
    const email = extractEmail(data);
    const name = extractName(data);

    // First user to sign up becomes ADMIN automatically
    const firstUser = await isFirstUser();

    await prisma.user.upsert({
      where: { id },
      update: {
        email,
        name,
      },
      create: {
        id,
        email,
        name,
        role: firstUser ? 'ADMIN' : 'CUSTOMER',
      },
    }).catch(console.error);
  } else if (evt.type === 'user.deleted') {
    const data = evt.data;
    const id = data.id as string;
    await prisma.user.delete({ where: { id } }).catch(console.error);
  }

  res.json({ received: true });
});

// Get all users (admin only) - to promote other users to admin
router.get('/users', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const { verifyToken } = await import('@clerk/backend');
    const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    const userId = claims.sub;

    // Check if requester is admin
    const requester = await prisma.user.findUnique({ where: { id: userId } });
    if (!requester || requester.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden: Admin only' });
      return;
    }

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
});

// Promote user to admin (admin only)
router.patch('/users/:userId/promote', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const { verifyToken } = await import('@clerk/backend');
    const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    const requesterId = claims.sub;

    // Check if requester is admin
    const requester = await prisma.user.findUnique({ where: { id: requesterId } });
    if (!requester || requester.role !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden: Admin only' });
      return;
    }

    const { userId } = req.params;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true },
    });

    res.json({ user, message: 'User promoted to admin' });
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
});

// Dev-only endpoint: Sync all users from Clerk BAPI (bypasses webhook)
// DO NOT use in production - only for local development without ngrok
if (process.env.NODE_ENV === 'development') {
  router.post('/sync-users', async (_req: Request, res: Response) => {
    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
    if (!CLERK_SECRET_KEY) {
      res.status(500).json({ error: 'Missing CLERK_SECRET_KEY' });
      return;
    }

    try {
      const { createClerkClient } = await import('@clerk/backend');
      const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

      const users = await clerk.users.getUserList({ limit: 100 });

      const results = [];
      for (const user of users.data) {
        const id = user.id;
        const email = user.emailAddresses.length > 0
          ? user.emailAddresses[0].emailAddress
          : `${user.username || user.id}@clerk.local`;
        const name = user.firstName || user.lastName || user.username || null;

        // First user becomes admin
        const firstUser = await isFirstUser();

        const dbUser = await prisma.user.upsert({
          where: { id },
          update: { email, name },
          create: { id, email, name, role: firstUser ? 'ADMIN' : 'CUSTOMER' },
        });
        results.push(dbUser);
      }

      res.json({ message: `Synced ${results.length} users`, users: results });
    } catch (err) {
      console.error('Sync error:', err);
      res.status(500).json({ error: 'Failed to sync users' });
    }
  });
}

export default router;