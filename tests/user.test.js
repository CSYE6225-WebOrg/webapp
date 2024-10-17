import request from 'supertest';
import app from '../app.js';
import User from '../models/user.js';
import { syncDb } from '../models/user.js';
import { sequelize, checkDbConnection } from '../services/connectionService.js';

beforeAll(async () => {
  // Sync the database before running tests
  await checkDbConnection();
  await syncDb;
});

afterAll(async () => {
  // Close database connection after tests are done
  await User.destroy({ where: {} });
});

describe('User API Endpoints and Authenticator', () => {
  let testUserCredentials = {
    email: 'testuser@example.com',
    password: 'TestPass123',
    firstName: 'Test',
    lastName: 'User'
  };

  let authCredentials = Buffer.from(`${testUserCredentials.email}:${testUserCredentials.password}`).toString('base64');

  it('should create a new user', async () => {
    const response = await request(app)
      .post('/v1/user')
      .send({
        email: 'testuser@example.com',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body.email).toBe(testUserCredentials.email);
    expect(response.body.firstName).toBe(testUserCredentials.firstName);
    expect(response.body.lastName).toBe(testUserCredentials.lastName);
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).toHaveProperty('account_created');
    expect(response.body).toHaveProperty('account_updated');
  });

  it('should not create a user with an existing email', async () => {
    const response = await request(app)
      .post('/v1/user')
      .send({
        email: 'testuser@example.com',
        password: 'TestPass123',
        firstName: 'Test',
        lastName: 'User'
      });

    expect(response.statusCode).toEqual(401);
  });

  it('should return 401 for invalid credentials (no auth headers)', async () => {
    const response = await request(app)
      .get('/v1/user');

    expect(response.statusCode).toEqual(401);
  });

  it('should return 401 for invalid credentials (wrong password)', async () => {
    const invalidAuthCredentials = Buffer.from(`${testUserCredentials.email}:WrongPass123`).toString('base64');
    const response = await request(app)
      .get('/v1/user')
      .set('Authorization', `Basic ${invalidAuthCredentials}`);

    expect(response.statusCode).toEqual(401);
   
  });

  it('should authenticate and get user info', async () => {
    const response = await request(app)
      .get('/v1/user')
      .set('Authorization', `Basic ${authCredentials}`);

    expect(response.statusCode).toEqual(200);
    expect(response.body.email).toBe(testUserCredentials.email);
    expect(response.body).toHaveProperty('firstName', testUserCredentials.firstName);
    expect(response.body).toHaveProperty('lastName', testUserCredentials.lastName);
    expect(response.body).not.toHaveProperty('password');
  });

  it('should return 400 when JSON body is sent with auth request', async () => {
    const response = await request(app)
      .get('/v1/user')
      .set('Authorization', `Basic ${authCredentials}`)
      .send({ randomData: 'This should not be here' });

    expect(response.statusCode).toEqual(400);
    
  });

  
});
