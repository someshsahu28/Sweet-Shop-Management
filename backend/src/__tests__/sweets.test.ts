import request from 'supertest';
import { app } from '../index';
import { dbRun, dbAll } from '../database/db';

describe('Sweets API', () => {
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Clear tables
    await dbRun('DELETE FROM sweets');
    await dbRun('DELETE FROM users');

    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'user@test.com',
        password: 'password123'
      });
    authToken = userResponse.body.token;

    // Create admin user (manually insert with admin role)
    const hashedPassword = require('bcryptjs').hashSync('password123', 10);
    await dbRun(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@test.com', hashedPassword, 'admin']
    );

    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });
    adminToken = adminResponse.body.token;
  });

  beforeEach(async () => {
    // Clear sweets before each test
    await dbRun('DELETE FROM sweets');
  });

  afterAll(async () => {
    await dbRun('DELETE FROM sweets');
    await dbRun('DELETE FROM users');
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 2.50,
          quantity: 100
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Chocolate Bar');
      expect(response.body.category).toBe('Chocolate');
      expect(response.body.price).toBe(2.50);
      expect(response.body.quantity).toBe(100);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 2.50,
          quantity: 100
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Chocolate Bar'
          // Missing other fields
        });

      expect(response.status).toBe(400);
    });

    it('should not allow duplicate sweet names', async () => {
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 2.50,
          quantity: 100
        });

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 3.00,
          quantity: 50
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/sweets', () => {
    it('should get all sweets', async () => {
      // Create some sweets
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Sweet 1',
          category: 'Candy',
          price: 1.00,
          quantity: 50
        });

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Sweet 2',
          category: 'Chocolate',
          price: 2.00,
          quantity: 30
        });

      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/sweets');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      // Create test sweets
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 2.50,
          quantity: 100
        });

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Gummy Bears',
          category: 'Candy',
          price: 1.50,
          quantity: 200
        });

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Lollipop',
          category: 'Candy',
          price: 0.75,
          quantity: 150
        });
    });

    it('should search by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=Chocolate')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Chocolate Bar');
    });

    it('should search by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=Candy')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });

    it('should search by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=1.0&maxPrice=2.0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Gummy Bears');
    });

    it('should combine multiple search criteria', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=Candy&minPrice=0.5&maxPrice=1.0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Lollipop');
    });
  });

  describe('PUT /api/sweets/:id', () => {
    let sweetId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Original Sweet',
          category: 'Candy',
          price: 1.00,
          quantity: 50
        });
      sweetId = response.body.id;
    });

    it('should update a sweet', async () => {
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Sweet',
          price: 2.00
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Sweet');
      expect(response.body.price).toBe(2.00);
      expect(response.body.category).toBe('Candy'); // Unchanged
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .put('/api/sweets/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Sweet'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweetId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Sweet to Delete',
          category: 'Candy',
          price: 1.00,
          quantity: 50
        });
      sweetId = response.body.id;
    });

    it('should delete a sweet as admin', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });

    it('should not allow non-admin to delete', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .delete('/api/sweets/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    let sweetId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Purchasable Sweet',
          category: 'Candy',
          price: 1.00,
          quantity: 10
        });
      sweetId = response.body.id;
    });

    it('should decrease quantity by 1', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(9);
    });

    it('should not allow purchase when out of stock', async () => {
      // Set quantity to 0
      await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 0 });

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('out of stock');
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .post('/api/sweets/99999/purchase')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/sweets/:id/restock', () => {
    let sweetId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Restockable Sweet',
          category: 'Candy',
          price: 1.00,
          quantity: 10
        });
      sweetId = response.body.id;
    });

    it('should increase quantity as admin', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 20 });

      expect(response.status).toBe(200);
      expect(response.body.quantity).toBe(30); // 10 + 20
    });

    it('should not allow non-admin to restock', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 20 });

      expect(response.status).toBe(403);
    });

    it('should validate quantity parameter', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: -5 });

      expect(response.status).toBe(400);
    });
  });
});

