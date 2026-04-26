import { Router } from 'express';
import type { Request, Response } from 'express';
import { adminMiddleware } from '../middleware/admin.js';
import { uploadSingle, uploadMultiple } from '../middleware/upload.js';

const router = Router();

// Single file upload → { url: string }
router.post('/single', adminMiddleware, uploadSingle.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  const baseUrl = `http://localhost:${process.env.PORT || 3001}`;
  res.json({ url: `${baseUrl}/uploads/${req.file.filename}` });
});

// Multiple file upload → { urls: string[] }
router.post('/multiple', adminMiddleware, uploadMultiple.array('files', 10), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }
  const baseUrl = `http://localhost:${process.env.PORT || 3001}`;
  const urls = files.map((f) => `${baseUrl}/uploads/${f.filename}`);
  res.json({ urls });
});

export default router;