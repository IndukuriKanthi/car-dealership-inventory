import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';
import { signToken } from '../../src/utils/jwtUtils';

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

// Use the vehicle listing endpoint as a protected route to test middleware
describe('Authentication middleware', () => {
  it('rejects requests with no Authorization header with 401', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects malformed Authorization header with 401', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', 'NotBearer token');
    expect(res.status).toBe(401);
  });

  it('rejects an invalid/tampered token with 401', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', 'Bearer this.is.not.valid');
    expect(res.status).toBe(401);
  });

  it('allows requests with a valid token', async () => {
    const token = signToken({ userId: 'test-id', role: 'USER' });
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`);
    // 200 means middleware passed — vehicles endpoint itself may return empty array
    expect(res.status).toBe(200);
  });
});

describe('requireAdmin middleware', () => {
  it('rejects a USER role from an admin-only endpoint with 403', async () => {
    const token = signToken({ userId: 'test-id', role: 'USER' });
    const res = await request(app)
      .delete('/api/vehicles/some-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('allows an ADMIN role to access an admin-only endpoint', async () => {
    const token = signToken({ userId: 'test-id', role: 'ADMIN' });
    const res = await request(app)
      .delete('/api/vehicles/nonexistent-id')
      .set('Authorization', `Bearer ${token}`);
    // 404 means admin was authorized but vehicle not found — correct behaviour
    expect(res.status).toBe(404);
  });
});
