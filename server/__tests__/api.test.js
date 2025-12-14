import request from 'supertest';
import app from '../index.js';

describe('Auth API', () => {
  describe('POST /auth/signup', () => {
    it('should create a new user', async () => {
      const newUser = {
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/auth/signup')
        .send(newUser);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should fail without email', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send({ password: 'test123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });
  });

  describe('POST /auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user first
      const email = `testlogin${Date.now()}@example.com`;
      const password = 'testpass123';
      
      const signupResponse = await request(app)
        .post('/auth/signup')
        .send({ email, password, name: 'Login Test' });
      
      testUser = { email, password, token: signupResponse.body.token };
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'somepassword',
        });

      expect(response.status).toBe(401);
    });
  });
});

describe('Incidents API', () => {
  let authToken;

  beforeEach(async () => {
    // Create and login a test user
    const email = `incident${Date.now()}@example.com`;
    const signupResponse = await request(app)
      .post('/auth/signup')
      .send({ email, password: 'test123', name: 'Incident Test' });
    
    authToken = signupResponse.body.token;
  });

  describe('POST /incidents', () => {
    it('should create an incident with auth', async () => {
      const newIncident = {
        type: 'crash',
        description: 'Test crash on Main St',
        lat: 37.7749,
        lng: -122.4194,
        severity: 3,
      };

      const response = await request(app)
        .post('/incidents')
        .send(newIncident)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('incidentId');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/incidents')
        .send({ type: 'crash', lat: 37.7, lng: -122.4 });

      expect(response.status).toBe(401);
    });

    it('should fail with missing coordinates', async () => {
      const response = await request(app)
        .post('/incidents')
        .send({ type: 'crash' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /incidents', () => {
    beforeEach(async () => {
      // Create a test incident
      await request(app)
        .post('/incidents')
        .send({
          type: 'fire',
          description: 'Test fire incident',
          lat: 37.7749,
          lng: -122.4194,
          severity: 4,
        })
        .set('Authorization', `Bearer ${authToken}`);
    });

    it('should return list of incidents', async () => {
      const response = await request(app).get('/incidents');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should include incident details', async () => {
      const response = await request(app).get('/incidents');
      const incident = response.body[0];

      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('type');
      expect(incident).toHaveProperty('latitude');
      expect(incident).toHaveProperty('longitude');
      expect(incident).toHaveProperty('severity');
    });
  });

  describe('DELETE /incidents/:id', () => {
    let incidentId;

    beforeEach(async () => {
      // Create an incident to delete
      const response = await request(app)
        .post('/incidents')
        .send({
          type: 'crime',
          description: 'Test crime',
          lat: 37.7,
          lng: -122.4,
          severity: 2,
        })
        .set('Authorization', `Bearer ${authToken}`);
      
      incidentId = response.body.incidentId;
    });

    it('should delete an incident', async () => {
      const response = await request(app)
        .delete(`/incidents/${incidentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should fail without auth', async () => {
      const response = await request(app)
        .delete(`/incidents/${incidentId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /incidents/:id/verify', () => {
    let incidentId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/incidents')
        .send({
          type: 'flood',
          description: 'Test flood',
          lat: 37.7,
          lng: -122.4,
          severity: 5,
        })
        .set('Authorization', `Bearer ${authToken}`);
      
      incidentId = response.body.incidentId;
    });

    it('should verify an incident', async () => {
      const response = await request(app)
        .patch(`/incidents/${incidentId}/verify`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.approved).toBe(true);
    });
  });

  describe('PATCH /incidents/:id/flag', () => {
    let incidentId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/incidents')
        .send({
          type: 'other',
          description: 'Test incident',
          lat: 37.7,
          lng: -122.4,
          severity: 1,
        })
        .set('Authorization', `Bearer ${authToken}`);
      
      incidentId = response.body.incidentId;
    });

    it('should flag an incident', async () => {
      const response = await request(app)
        .patch(`/incidents/${incidentId}/flag`)
        .send({ reason: 'Duplicate report' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.flagged).toBe(true);
    });
  });
});

describe('Use Case Endpoints', () => {
  it('should return danger zones', async () => {
    const response = await request(app).get('/usecase/map-danger-zones');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});