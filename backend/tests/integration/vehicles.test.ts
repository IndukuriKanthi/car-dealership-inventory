import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';
import { signToken } from '../../src/utils/jwtUtils';

const userToken = signToken({ userId: 'user-1', role: 'USER' });

const validVehicle = {
  make: 'Toyota',
  model: 'Camry',
  category: 'Sedan',
  price: 25000,
  quantity: 5,
};

beforeEach(async () => {
  await prisma.vehicle.deleteMany();
});

afterAll(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.$disconnect();
});

describe('POST /api/vehicles', () => {
  it('creates a vehicle and returns 201', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validVehicle);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.make).toBe('Toyota');
    expect(res.body.data.vehicle.model).toBe('Camry');
    expect(res.body.data.vehicle.quantity).toBe(5);
    expect(Number(res.body.data.vehicle.price)).toBe(25000);
  });

  it('rejects missing make with 400', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ model: 'Camry', category: 'Sedan', price: 25000 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects negative price with 400', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ ...validVehicle, price: -100 });

    expect(res.status).toBe(400);
  });

  it('rejects negative quantity with 400', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ ...validVehicle, quantity: -1 });

    expect(res.status).toBe(400);
  });

  it('rejects unauthenticated request with 401', async () => {
    const res = await request(app).post('/api/vehicles').send(validVehicle);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/vehicles', () => {
  it('returns all vehicles including zero-stock ones', async () => {
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validVehicle);
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ ...validVehicle, model: 'Corolla', quantity: 0 });

    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicles).toHaveLength(2);
    const zeroStock = res.body.data.vehicles.find((v: { quantity: number }) => v.quantity === 0);
    expect(zeroStock).toBeDefined();
  });

  it('returns empty array when no vehicles exist', async () => {
    const res = await request(app).get('/api/vehicles').set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(0);
  });

  it('rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/vehicles/:id', () => {
  it('updates a vehicle and returns updated data', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validVehicle);
    const id = created.body.data.vehicle.id;

    const res = await request(app)
      .put(`/api/vehicles/${id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 27000, quantity: 10 });

    expect(res.status).toBe(200);
    expect(Number(res.body.data.vehicle.price)).toBe(27000);
    expect(res.body.data.vehicle.quantity).toBe(10);
  });

  it('returns 404 for nonexistent vehicle', async () => {
    const res = await request(app)
      .put('/api/vehicles/nonexistent-id')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 27000 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('rejects negative quantity with 400', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validVehicle);
    const id = created.body.data.vehicle.id;

    const res = await request(app)
      .put(`/api/vehicles/${id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: -5 });

    expect(res.status).toBe(400);
  });

  it('rejects unauthenticated request with 401', async () => {
    const res = await request(app).put('/api/vehicles/some-id').send({ price: 27000 });
    expect(res.status).toBe(401);
  });
});
