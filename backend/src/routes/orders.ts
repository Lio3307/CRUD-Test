import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../config/database.js';
import { adminMiddleware, sessionMiddleware } from '../middleware/admin.js';

const router = Router();

// Customer: Create order (COD)
router.post('/', sessionMiddleware, async (req: Request, res: Response) => {
  const { items, address, phone, notes } = req.body;
  const userId = (req as Request & { userId: string }).userId;

  if (!items?.length || !address || !phone) {
    res.status(400).json({ error: 'items, address, and phone are required' });
    return;
  }

  let totalPrice = 0;
  const orderItemsData = await Promise.all(
    items.map(async (item: { productId: string; quantity: number; variantName?: string }) => {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const unitPrice = product.price;
      totalPrice += unitPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        variantName: item.variantName ?? null,
      };
    })
  );

  const order = await prisma.order.create({
    data: {
      userId,
      totalPrice,
      address,
      phone,
      notes: notes ?? null,
      status: 'PENDING',
      items: { create: orderItemsData },
    },
    include: { items: { include: { product: true } } },
  });

  res.status(201).json(order);
});

// Customer: Get my orders
router.get('/my', sessionMiddleware, async (req: Request, res: Response) => {
  const userId = (req as Request & { userId: string }).userId;
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

// Admin: List all orders
router.get('/', adminMiddleware, async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

// Admin: Update order status
router.put('/:id', adminMiddleware, async (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: 'Invalid status' });
    return;
  }
  const order = await prisma.order.update({
    where: { id: req.params.id as string },
    data: { status },
    include: { user: true, items: { include: { product: true } } },
  });
  res.json(order);
});

export default router;