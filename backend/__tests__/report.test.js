const request = require('supertest');
const app = require('../server');

// Mock Firebase dependency to prevent actual DB writes during tests
jest.mock('../firebase', () => {
  return {
    collection: jest.fn().mockReturnThis(),
    add: jest.fn().mockResolvedValue({ id: 'mock_doc_id_999' }),
    get: jest.fn().mockResolvedValue([
      { id: '1', data: () => ({ location_name: 'Cyber City', danger_type: 'Harassment' }) }
    ])
  };
});

describe('RakshakPath Backend APIs', () => {
  
  describe('POST /api/report', () => {
    it('should securely accept Web3 danger reports and return 201', async () => {
      const mockPayload = {
        location_name: 'Connaught Place',
        danger_type: 'Suspicious Activity',
        description: 'Testing the endpoint',
        user_name: 'Anonymous',
        signature: '0xabc123mocksignature',
        wallet_address: '0xMockWallet'
      };

      const response = await request(app)
        .post('/api/report')
        .send(mockPayload)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 'mock_doc_id_999');
      expect(response.body).toHaveProperty('message', 'Danger zone reported successfully');
    });
  });

  describe('POST /api/sos', () => {
    it('should process SOS triggers accurately', async () => {
      const response = await request(app)
        .post('/api/sos')
        .send({
          latitude: 28.6139,
          longitude: 77.2090,
          location: 'Delhi',
          user_name: 'Emergency Test User'
        });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/dangers', () => {
    it('should retrieve list of verified zones', async () => {
      const response = await request(app).get('/api/dangers');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body[0].location_name).toBe('Cyber City');
    });
  });

});
