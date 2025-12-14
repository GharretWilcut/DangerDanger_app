// __tests__/api.test.js
import request from 'supertest';
// import app from '../server.js';

describe('Server API Tests', () => {
  describe('Health Check', () => {
    it('should have basic test', () => {
      expect(true).toBe(true);
    });
  });

  // Uncomment when you export your app from server.js
  // describe('GET /api/incidents', () => {
  //   it('should return incidents', async () => {
  //     const response = await request(app)
  //       .get('/api/incidents')
  //       .query({ lat: 0, lng: 0 });
  //     
  //     expect(response.status).toBe(200);
  //     expect(Array.isArray(response.body)).toBe(true);
  //   });
  // });

  // describe('POST /api/incidents', () => {
  //   it('should create incident with auth', async () => {
  //     const newIncident = {
  //       type: 'crash',
  //       description: 'Test incident',
  //       lat: 37.7,
  //       lng: -122.4,
  //       severity: 3,
  //     };

  //     const response = await request(app)
  //       .post('/api/incidents')
  //       .send(newIncident)
  //       .set('Authorization', 'Bearer test-token');
  //     
  //     expect(response.status).toBe(201);
  //   });

  //   it('should fail without auth', async () => {
  //     const response = await request(app)
  //       .post('/api/incidents')
  //       .send({});
  //     
  //     expect(response.status).toBe(401);
  //   });
  // });
});