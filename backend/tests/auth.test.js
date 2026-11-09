const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const db = require("../src/db");
const { verifyToken } = require("../src/utils/token");

const credentials = { email: "ana@example.com", password: "password123" };

// Small helpers keep the tests short and readable
const register = (body = credentials) =>
  request(app).post("/api/auth/register").send(body);
const login = (body = credentials) =>
  request(app).post("/api/auth/login").send(body);

async function getToken() {
  await register();
  const res = await login();
  return res.body.token;
}

beforeEach(async () => {
  await db.query("TRUNCATE users, links, clicks RESTART IDENTITY CASCADE");
});

afterAll(async () => {
  await db.close();
});

describe("POST /api/auth/register", () => {
  it("creates a user and does not leak the password", async () => {
    const res = await register();

    expect(res.statusCode).toBe(201);
    expect(res.body.user).toMatchObject({ id: 1, email: "ana@example.com" });
    expect(res.body.user).not.toHaveProperty("password");
    expect(res.body.user).not.toHaveProperty("password_hash");
  });

  it("stores a bcrypt hash, not the plain password", async () => {
    await register();

    const { rows } = await db.query("SELECT password_hash FROM users");

    expect(rows[0].password_hash).not.toBe(credentials.password);
    expect(rows[0].password_hash).toMatch(/^\$2[aby]\$/);
  });

  it("normalizes the email to lowercase", async () => {
    const res = await register({
      email: "ANA@Example.com",
      password: "password123",
    });

    expect(res.body.user.email).toBe("ana@example.com");
  });

  it("returns 400 with details for invalid input", async () => {
    const res = await register({ email: "nope", password: "123" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toHaveLength(2);
  });

  it("returns 409 when the email is already registered", async () => {
    await register();
    const res = await register({
      email: "ANA@example.com",
      password: "otherpassword",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe("Email already registered");
  });

  it("returns 400 for a malformed JSON body", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Content-Type", "application/json")
      .send('{"email":');

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid JSON body");
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await register();
  });

  it("returns a valid token for correct credentials", async () => {
    const res = await login();

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toEqual({ id: 1, email: "ana@example.com" });
    expect(verifyToken(res.body.token).userId).toBe(res.body.user.id);
  });

  it("returns 401 for a wrong password", async () => {
    const res = await login({
      email: credentials.email,
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  it("returns the same 401 for an unknown email", async () => {
    const res = await login({
      email: "ghost@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  it("returns 400 when fields are missing", async () => {
    const res = await login({ email: credentials.email });

    expect(res.statusCode).toBe(400);
  });
});

describe("GET /api/auth/me (protected route)", () => {
  it("returns 401 without an Authorization header", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.statusCode).toBe(401);
  });

  it("returns 401 when the scheme is not Bearer", async () => {
    const token = await getToken();
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Token ${token}`);

    expect(res.statusCode).toBe(401);
  });

  it("returns 401 for an invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not.a.token");

    expect(res.statusCode).toBe(401);
  });

  it("returns 401 for an expired token", async () => {
    await register();
    const expired = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, {
      expiresIn: -10,
    });
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${expired}`);

    expect(res.statusCode).toBe(401);
  });

  it("returns the current user for a valid token", async () => {
    const token = await getToken();
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user).toMatchObject({ id: 1, email: "ana@example.com" });
  });

  it("returns 401 when the user was deleted after the token was issued", async () => {
    const token = await getToken();
    await db.query("DELETE FROM users");

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("User no longer exists");
  });
});
