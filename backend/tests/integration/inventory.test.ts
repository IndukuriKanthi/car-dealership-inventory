import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';
import { signToken } from '../../src/utils/jwtUtils';

const userToken = signToken({ userId: 'user-1', role: 'USER' });
const adminToken = signToken({ userId: 'admin-1', role: 'ADMIN' });

const baseVehicle = {
  make: 'Honda',
  model: 'Civic',
  category: 'Sedan',
  price: 22000,
  quantity: 3,
};

async function createVehicle(overrides = {}) {
  const res = await request(app)
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${userToken}`)
    .send({ ...baseVehicle, ...overrides });
  return res.body.data.vehicle;
}

beforeEach(async () => {
  await prisma.vehicle.deleteMany();
});

afterAll(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.$disconnect();
});

// ---------------------------------------------------------------------------
// Purchase
// ---------------------------------------------------------------------------

describe('POST /api/vehicles/:id/purchase', () => {
  it('returns 200 and decrements quantity by exactly one', async () => {
    const vehicle = await createVehicle({ quantity: 3 });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.quantity).toBe(2);
  });

  it('returns 409 when vehicle is out of stock', async () => {
    const vehicle = await createVehicle({ quantity: 0 });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/out of stock/i);
  });

  it('returns 404 when vehicle does not exist', async () => {
    const res = await request(app)
      .post('/api/vehicles/nonexistent-id/purchase')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 for unauthenticated request', async () => {
    const vehicle = await createVehicle();

    const res = await request(app).post(`/api/vehicles/${vehicle.id}/purchase`);

    expect(res.status).toBe(401);
  });

  it('quantity never goes below zero under concurrent purchases', async () => {
    // Create a vehicle with quantity 1, then fire 5 simultaneous purchase requests.
    // Only 1 should succeed; the rest must get 409. Final quantity must be 0, not negative.
    const vehicle = await createVehicle({ quantity: 1 });

    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        request(app)
          .post(`/api/vehicles/${vehicle.id}/purchase`)
          .set('Authorization', `Bearer ${userToken}`),
      ),
    );

    const successes = results.filter((r) => r.status === 200);
    const outOfStock = results.filter((r) => r.status === 409);

    expect(successes).toHaveLength(1);
    expect(outOfStock).toHaveLength(4);

    // Confirm DB quantity is exactly 0
    const final = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    expect(final?.quantity).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Restock
// ---------------------------------------------------------------------------

describe('POST /api/vehicles/:id/restock', () => {
  it('allows admin to restock and returns updated vehicle', async () => {
    const vehicle = await createVehicle({ quantity: 2 });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.vehicle.quantity).toBe(12);
  });

  it('rejects a normal user with 403', async () => {
    const vehicle = await createVehicle();

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for non-positive restock quantity', async () => {
    const vehicle = await createVehicle();

    const zeroRes = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 0 });

    expect(zeroRes.status).toBe(400);

    const negativeRes = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: -5 });

    expect(negativeRes.status).toBe(400);
  });

  it('returns 404 when vehicle does not exist', async () => {
    const res = await request(app)
      .post('/api/vehicles/nonexistent-id/restock')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 for unauthenticated request', async () => {
    const vehicle = await createVehicle();

    const res = await request(app)
      .post(`/api/vehicles/${vehicle.id}/restock`)
      .send({ quantity: 5 });

    expect(res.status).toBe(401);
  });
});
