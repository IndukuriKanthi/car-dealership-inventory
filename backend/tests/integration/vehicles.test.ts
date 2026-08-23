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
