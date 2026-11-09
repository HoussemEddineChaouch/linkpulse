# LinkPulse 🔗

URL shortener with click analytics.

> 🚧 Work in progress. This README grows with the project.

## Planned features

- [x] User authentication (JWT)
- [ ] Short links with custom alias and expiry
- [ ] Click tracking and analytics
- [ ] React dashboard
- [ ] Dockerized setup
- [ ] CI/CD with GitHub Actions
- [ ] Deployed demo

## Tech stack

Node.js · Express · PostgreSQL · React · Docker · Jest · GitHub Actions

## Running the backend

### 1. Start PostgreSQL (Docker)

```bash
docker run --name linkpulse-db -e POSTGRES_USER=linkpulse -e POSTGRES_PASSWORD=linkpulse_dev -e POSTGRES_DB=linkpulse -p 5433:5432 -v linkpulse_pgdata:/var/lib/postgresql/data -d postgres:16-alpine
docker exec -it linkpulse-db psql -U linkpulse -d linkpulse -c "CREATE DATABASE linkpulse_test;"
```

> Docker Compose will replace these commands in a later step.

### 2. Configure and run the API

```bash
cd backend
cp .env.example .env
# Set a real JWT_SECRET in .env. Generate one with:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm install
npm run migrate up     # create the database tables
npm run dev            # start with auto-reload
```

The API listens on `http://localhost:3000`. Check it with `GET /health`.

### 3. Run the tests

```bash
npm test               # migrates the test database, then runs Jest
npm run test:coverage
```

### Database schema

Three tables: `users` → `links` → `clicks` (one user has many links, one link
has many clicks). Migrations live in `backend/migrations/`.

## API documentation

See [docs/api.md](docs/api.md) for all endpoints, request and response examples, and status codes.

## License

MIT
