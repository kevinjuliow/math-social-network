import request from 'supertest';
import app from '../src/app';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../prisma/generated/client';

const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter: pool })

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Math Logic API', () => {
  let token: string;
  let rootId: number;

  it('should register and login a test user', async () => {
    const testUser = `testuser_${Date.now()}`;
    
    await request(app)
      .post('/api/signup')
      .send({ username: testUser, password: 'password123' });

    const res = await request(app)
      .post('/api/login')
      .send({ username: testUser, password: 'password123' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should create a root post with value 100', async () => {
    const res = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${token}`) 
      .send({ value: 100 });

    expect(res.statusCode).toEqual(201);
    expect(res.body.result).toEqual(100);
    rootId = res.body.id; 
  });

  it('should correctly divide 100 by 2', async () => {
    const res = await request(app)
      .post('/api/reply')
      .set('Authorization', `Bearer ${token}`)
      .send({
        parentId: rootId,
        operation: '/',
        value: 2
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.result).toEqual(50);
  });

  it('should prevent division by zero', async () => {
    const res = await request(app)
      .post('/api/reply')
      .set('Authorization', `Bearer ${token}`)
      .send({
        parentId: rootId,
        operation: '/',
        value: 0
      });

    expect(res.statusCode).toEqual(400); 
  });
});