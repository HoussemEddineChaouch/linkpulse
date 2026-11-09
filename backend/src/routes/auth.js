const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const config = require('../config');
const { validateCredentials } = require('../utils/validation');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { errors, email, password } = validateCredentials(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at AS "createdAt"`,
      [email, passwordHash]
    );

    return res.status(201).json({ user: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    return next(err);
  }
});

module.exports = router;