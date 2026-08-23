import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';
import { signToken } from '../../src/utils/jwtUtils';

const userToken = signToken({ userId: 'user-1', role: 'USER' });
const adminToken = signToken({ userId: 'admin-1', role: 'ADMIN' });

const validVehicle = {
  make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 5,
};

beforeEach(async () => { await prisma.vehicle.deleteMany(); });
afterAll(async () => { await prisma.vehicle.deleteMany(); await prisma.$disconnect(); });

describe('DELETE /api/vehicles/:id', () => {
  it('allows admin to delete a vehicle and returns 204', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validVehicle);
    const id = created.body.data.vehicle.id;

    const res = await request(app)
      .delete(`/api/vehicles/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);

    // Confirm it is gone
    const check = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);
    expect(check.body.data.vehicles).toHaveLength(0);
  });

  it('rejects a normal user with 403', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(validVehicle);
    const id = created.body.data.vehicle.id;

    const res = await request(app)
      .delete(`/api/vehicles/${id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('returns 404 when vehicle does not exist', async () => {
    const res = await request(app)
      .delete('/api/vehicles/nonexistent-id')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('rejects unauthenticated request with 401', async () => {
    const res = await request(app).delete('/api/vehicles/some-id');
    expect(res.status).toBe(401);
  });
});
