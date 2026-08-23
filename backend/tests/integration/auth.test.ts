import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';

// Clean up users before each test so tests are fully independent
beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  const validPayload = {
    name: 'Alice Smith',
    email: 'alice@example.com',
    password: 'SecurePass123!',
  };

  it('registers a new user and returns safe user data', async () => {
    const res = await request(app).post('/api/auth/register').send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validPayload.email);
    expect(res.body.data.user.name).toBe(validPayload.name);
    expect(res.body.data.user.role).toBe('USER');
    // passwordHash must never be returned to the client
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('rejects duplicate email with 409', async () => {
    await request(app).post('/api/auth/register').send(validPayload);
    const res = await request(app).post('/api/auth/register').send(validPayload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it('rejects missing name with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bob@example.com', password: 'SecurePass123!' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid email with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'not-an-email', password: 'SecurePass123!' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects short password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('stores a hashed password, not plaintext', async () => {
    await request(app).post('/api/auth/register').send(validPayload);
    const user = await prisma.user.findUnique({ where: { email: validPayload.email } });

    expect(user).not.toBeNull();
    expect(user!.passwordHash).not.toBe(validPayload.password);
    expect(user!.passwordHash).toMatch(/^\$2b\$/); // bcrypt hash prefix
  });
});
