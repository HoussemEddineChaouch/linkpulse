const db = require('../src/db');

beforeEach(async () => {
  // Start every test with empty tables (RESTART IDENTITY resets the ids)
  await db.query('TRUNCATE users, links, clicks RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await db.close();
});

describe('database connection', () => {
  it('connects and runs a query', async () => {
    const { rows } = await db.query('SELECT 1 AS ok');

    expect(rows[0].ok).toBe(1);
  });

  it('has the tables created by the migrations', async () => {
    const { rows } = await db.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public'`
    );
    const tables = rows.map((r) => r.table_name);

    expect(tables).toEqual(expect.arrayContaining(['users', 'links', 'clicks']));
  });
});

describe('schema constraints', () => {
  const insertUser = 'INSERT INTO users (email, password_hash) VALUES ($1, $2)';

  it('rejects duplicate emails', async () => {
    await db.query(insertUser, ['dup@example.com', 'hash']);

    await expect(
      db.query(insertUser, ['dup@example.com', 'hash'])
    ).rejects.toMatchObject({ code: '23505' }); // unique_violation
  });

  it('rejects a link that belongs to a user that does not exist', async () => {
    await expect(
      db.query(
        'INSERT INTO links (user_id, code, original_url) VALUES ($1, $2, $3)',
        [999, 'abc1234', 'https://example.com']
      )
    ).rejects.toMatchObject({ code: '23503' }); // foreign_key_violation
  });

  it('deletes a user\'s links and clicks when the user is deleted', async () => {
    const user = await db.query(`${insertUser} RETURNING id`, ['a@example.com', 'hash']);
    const link = await db.query(
      'INSERT INTO links (user_id, code, original_url) VALUES ($1, $2, $3) RETURNING id',
      [user.rows[0].id, 'abc1234', 'https://example.com']
    );
    await db.query('INSERT INTO clicks (link_id) VALUES ($1)', [link.rows[0].id]);

    await db.query('DELETE FROM users WHERE id = $1', [user.rows[0].id]);

    const links = await db.query('SELECT * FROM links');
    const clicks = await db.query('SELECT * FROM clicks');
    expect(links.rows).toHaveLength(0);
    expect(clicks.rows).toHaveLength(0);
  });
});