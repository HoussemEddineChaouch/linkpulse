const validator = require('validator');

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 72; // bcrypt ignores everything after 72 bytes

function validateCredentials(body) {
  const { email, password } = body || {};
  const errors = [];

  if (typeof email !== 'string' || !validator.isEmail(email.trim())) {
    errors.push('A valid email is required');
  }

  if (typeof password !== 'string' || password.length < PASSWORD_MIN) {
    errors.push(`Password must be at least ${PASSWORD_MIN} characters`);
  } else if (password.length > PASSWORD_MAX) {
    errors.push(`Password must be at most ${PASSWORD_MAX} characters`);
  }

  return {
    errors,
    email: typeof email === 'string' ? email.trim().toLowerCase() : '',
    password,
  };
}

module.exports = { validateCredentials };