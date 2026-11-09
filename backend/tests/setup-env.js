require("dotenv").config({ quiet: true });

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.BCRYPT_ROUNDS = "4";
