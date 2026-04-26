import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../config/database.js';
import { adminMiddleware } from '../middleware/admin.js';

const router = Router();

// Public: List products (paginated, filterable by category)
router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const skip = (page - 1) * limit;
  const categorySlug = req.query.category as string | undefined;
  const search = req.query.search as string | undefined;

  const where: Record<string, unknown> = {};
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) });
});

// Public: Get single product by slug
router.get('/:slug', async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug as string },
    include: { category: true, variants: true },
  });
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
});

// Admin: Create product
router.post('/', adminMiddleware, async (req: Request, res: Response) => {
  const { name, description, price, stock, images, categoryId, variants, featured } = req.body;

  if (!name || price == null) {
    res.status(400).json({ error: 'name and price are required' });
    return;
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now();

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: description ?? '',
      price: Number(price),
      stock: Number(stock) || 0,
      images: images ?? [],
      featured: featured ?? false,
      categoryId: categoryId || null,
      variants: {
        create: (variants ?? []).map((v: { name: string; value: string; priceMod?: number; stock?: number }) => ({
          name: v.name,
          value: v.value,
          priceMod: Number(v.priceMod) || 0,
          stock: Number(v.stock) || 0,
        })),
      },
    },
    include: { variants: true },
  });

  res.status(201).json(product);
});

// Admin: Update product
router.put('/:id', adminMiddleware, async (req: Request, res: Response) => {
  const { name, description, price, stock, images, categoryId, variants, featured } = req.body;

  // Delete existing variants, then re-create
  await prisma.productVariant.deleteMany({ where: { productId: req.params.id as string } });

  const product = await prisma.product.update({
    where: { id: req.params.id as string },
    data: {
      name,
      description,
      price: Number(price),
      stock: Number(stock) || 0,
      images: images ?? [],
      featured: featured ?? false,
      categoryId: categoryId || null,
      variants: {
        create: (variants ?? []).map((v: { name: string; value: string; priceMod?: number; stock?: number }) => ({
          name: v.name,
          value: v.value,
          priceMod: Number(v.priceMod) || 0,
          stock: Number(v.stock) || 0,
        })),
      },
    },
    include: { variants: true },
  });

  res.json(product);
});

// Admin: Delete product
router.delete('/:id', adminMiddleware, async (req: Request, res: Response) => {
  await prisma.product.delete({ where: { id: req.params.id as string } });
  res.json({ success: true });
});

export default router;