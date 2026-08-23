import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';
import { signToken } from '../../src/utils/jwtUtils';

const userToken = signToken({ userId: 'user-1', role: 'USER' });

const seed = async () => {
  await prisma.vehicle.createMany({
    data: [
      { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 5 },
      { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 35000, quantity: 3 },
      { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 8 },
      { make: 'Ford', model: 'Explorer', category: 'SUV', price: 45000, quantity: 2 },
      { make: 'BMW', model: 'X5', category: 'SUV', price: 65000, quantity: 0 },
    ],
  });
};

beforeEach(async () => {
  await prisma.vehicle.deleteMany();
  await seed();
});

afterAll(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.$disconnect();
});

const search = (query: string) =>
  request(app).get(`/api/vehicles/search?${query}`).set('Authorization', `Bearer ${userToken}`);

describe('GET /api/vehicles/search', () => {
  it('filters by make (case-insensitive)', async () => {
    const res = await search('make=toyota');
    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(2);
    res.body.data.vehicles.forEach((v: { make: string }) =>
      expect(v.make.toLowerCase()).toBe('toyota'),
    );
  });

  it('filters by model (case-insensitive)', async () => {
    const res = await search('model=civic');
    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(1);
    expect(res.body.data.vehicles[0].model).toBe('Civic');
  });

  it('filters by category', async () => {
    const res = await search('category=SUV');
    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(3);
  });

  it('filters by minPrice', async () => {
    const res = await search('minPrice=40000');
    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(2);
    res.body.data.vehicles.forEach((v: { price: string }) =>
      expect(Number(v.price)).toBeGreaterThanOrEqual(40000),
    );
  });

  it('filters by maxPrice', async () => {
    const res = await search('maxPrice=25000');
    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(2);
  });

  it('filters by price range', async () => {
    const res = await search('minPrice=22000&maxPrice=35000');
    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(3);
  });

  it('combines make and category filters', async () => {
    const res = await search('make=Toyota&category=SUV');
    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(1);
    expect(res.body.data.vehicles[0].model).toBe('RAV4');
  });

  it('returns empty array when no vehicles match', async () => {
    const res = await search('make=Ferrari');
    expect(res.status).toBe(200);
    expect(res.body.data.vehicles).toHaveLength(0);
  });

  it('rejects unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/vehicles/search?make=Toyota');
    expect(res.status).toBe(401);
  });
});
