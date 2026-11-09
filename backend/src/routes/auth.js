const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const config = require("../config");
const { validateCredentials } = require("../utils/validation");
const { signToken } = require("../utils/token");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Used to  response time similar when the email doesn't exist
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", config.bcryptRounds);

router.post("/register", async (req, res, next) => {
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
      [email, passwordHash],
    );

    return res.status(201).json({ user: rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    return next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email ||
      !password
    ) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { rows } = await db.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email.trim().toLowerCase()],
    );
    const user = rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user ? user.password_hash : DUMMY_HASH,
    );

    if (!user || !passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.status(200).json({
      token: signToken(user),
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, email, created_at AS "createdAt" FROM users WHERE id = $1',
      [req.user.id],
    );

    if (!rows[0]) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    return res.status(200).json({ user: rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
