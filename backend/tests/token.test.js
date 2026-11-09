const jwt = require('jsonwebtoken');
const { signToken, verifyToken } = require('../src/utils/token');

describe('token helpers', () => {
  it('signs a token that verifies back to the same user id', () => {
    const token = signToken({ id: 42 });

    expect(verifyToken(token).userId).toBe(42);
  });

  it('rejects a tampered token', () => {
    const token = signToken({ id: 42 });

    expect(() => verifyToken(`${token}x`)).toThrow();
  });

  it('rejects a token signed with a different secret', () => {
    const forged = jwt.sign({ userId: 42 }, 'some-other-secret');

    expect(() => verifyToken(forged)).toThrow();
  });

  it('rejects an expired token', () => {
    const expired = jwt.sign({ userId: 42 }, process.env.JWT_SECRET, { expiresIn: -10 });

    expect(() => verifyToken(expired)).toThrow(/expired/);
  });
});