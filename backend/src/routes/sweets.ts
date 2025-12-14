import express, { Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { prisma } from '../database/prisma';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create a new sweet
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { name, category, price, quantity } = req.body;

      // Check if sweet with same name exists
      const existing = await prisma.sweet.findUnique({
        where: { name }
      });

      if (existing) {
        return res.status(400).json({ error: 'Sweet with this name already exists' });
      }

      const newSweet = await prisma.sweet.create({
        data: {
          name,
          category,
          price,
          quantity
        }
      });

      res.status(201).json(newSweet);
    } catch (error) {
      console.error('Create sweet error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all sweets
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const sweets = await prisma.sweet.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(sweets);
  } catch (error) {
    console.error('Get sweets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search sweets
router.get(
  '/search',
  [
    query('name').optional().trim(),
    query('category').optional().trim(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 })
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { name, category, minPrice, maxPrice } = req.query;

      const where: any = {};

      if (name) {
        where.name = {
          contains: name as string,
          mode: 'insensitive'
        };
      }

      if (category) {
        where.category = category as string;
      }

      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) {
          where.price.gte = parseFloat(minPrice as string);
        }
        if (maxPrice) {
          where.price.lte = parseFloat(maxPrice as string);
        }
      }

      const sweets = await prisma.sweet.findMany({
        where,
        orderBy: { name: 'asc' }
      });

      res.json(sweets);
    } catch (error) {
      console.error('Search sweets error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get single sweet by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const sweet = await prisma.sweet.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    res.json(sweet);
  } catch (error) {
    console.error('Get sweet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a sweet
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty(),
    body('category').optional().trim().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('quantity').optional().isInt({ min: 0 })
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const sweet = await prisma.sweet.findUnique({
        where: { id: parseInt(req.params.id) }
      });

      if (!sweet) {
        return res.status(404).json({ error: 'Sweet not found' });
      }

      const { name, category, price, quantity } = req.body;
      const updateData: any = {};

      if (name !== undefined) {
        // Check if name is unique (excluding current sweet)
        const existing = await prisma.sweet.findFirst({
          where: {
            name,
            NOT: { id: parseInt(req.params.id) }
          }
        });

        if (existing) {
          return res.status(400).json({ error: 'Sweet with this name already exists' });
        }

        updateData.name = name;
      }

      if (category !== undefined) {
        updateData.category = category;
      }

      if (price !== undefined) {
        updateData.price = price;
      }

      if (quantity !== undefined) {
        updateData.quantity = quantity;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const updatedSweet = await prisma.sweet.update({
        where: { id: parseInt(req.params.id) },
        data: updateData
      });

      res.json(updatedSweet);
    } catch (error) {
      console.error('Update sweet error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete a sweet (Admin only)
router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const sweet = await prisma.sweet.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    await prisma.sweet.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete sweet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Purchase a sweet (decrease quantity)
router.post('/:id/purchase', async (req: AuthRequest, res: Response) => {
  try {
    const sweet = await prisma.sweet.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!sweet) {
      return res.status(404).json({ error: 'Sweet not found' });
    }

    if (sweet.quantity <= 0) {
      return res.status(400).json({ error: 'Sweet is out of stock' });
    }

    const updatedSweet = await prisma.sweet.update({
      where: { id: parseInt(req.params.id) },
      data: {
        quantity: {
          decrement: 1
        }
      }
    });

    res.json(updatedSweet);
  } catch (error) {
    console.error('Purchase sweet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Restock a sweet (Admin only)
router.post(
  '/:id/restock',
  requireAdmin,
  [
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const sweet = await prisma.sweet.findUnique({
        where: { id: parseInt(req.params.id) }
      });

      if (!sweet) {
        return res.status(404).json({ error: 'Sweet not found' });
      }

      const { quantity } = req.body;

      const updatedSweet = await prisma.sweet.update({
        where: { id: parseInt(req.params.id) },
        data: {
          quantity: {
            increment: quantity
          }
        }
      });

      res.json(updatedSweet);
    } catch (error) {
      console.error('Restock sweet error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

