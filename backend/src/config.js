const config = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
};

// Fail fast: running without a secret would be a security hole
if (!config.jwtSecret) {
  throw new Error('Missing JWT_SECRET environment variable');
}

module.exports = config;