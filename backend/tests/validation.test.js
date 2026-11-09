const { validateCredentials } = require('../src/utils/validation');

describe('validateCredentials', () => {
  it('accepts valid input and normalizes the email', () => {
    const result = validateCredentials({
      email: '  Ana@Example.COM ',
      password: 'password123',
    });

    expect(result.errors).toEqual([]);
    expect(result.email).toBe('ana@example.com');
  });

  it.each(['not-an-email', 'ana@', '@example.com', ''])(
    'rejects the invalid email "%s"',
    (email) => {
      const result = validateCredentials({ email, password: 'password123' });

      expect(result.errors).toContain('A valid email is required');
    }
  );

  it('rejects a password shorter than 8 characters', () => {
    const result = validateCredentials({ email: 'ana@example.com', password: '1234567' });

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/at least 8/);
  });

  it('rejects a password longer than 72 characters', () => {
    const result = validateCredentials({
      email: 'ana@example.com',
      password: 'a'.repeat(73),
    });

    expect(result.errors[0]).toMatch(/at most 72/);
  });

  it('rejects values that are not strings', () => {
    const result = validateCredentials({ email: 123, password: { evil: true } });

    expect(result.errors).toHaveLength(2);
  });

  it('does not crash when the body is missing', () => {
    const result = validateCredentials(undefined);

    expect(result.errors).toHaveLength(2);
  });
});