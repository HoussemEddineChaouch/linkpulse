const request = require('supertest');
const app = require('../src/app');

describe('GET /health', () => {
  it('returns 200 and a status of ok', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('responds with JSON', async () => {
    const res = await request(app).get('/health');

    expect(res.headers['content-type']).toMatch(/json/);
  });
});

describe('unknown routes', () => {
  it('returns 404 with an error message', async () => {
    const res = await request(app).get('/this-route-does-not-exist');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});