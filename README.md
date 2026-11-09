# LinkPulse 🔗

URL shortener with click analytics.

> 🚧 Work in progress. This README grows with the project.

## Planned features
- [ ] User authentication (JWT)
- [ ] Short links with custom alias and expiry
- [ ] Click tracking and analytics
- [ ] React dashboard
- [ ] Dockerized setup
- [ ] CI/CD with GitHub Actions
- [ ] Deployed demo

## Tech stack
Node.js · Express · PostgreSQL · React · Docker · Jest · GitHub Actions

## Running the backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev        # start with auto-reload
npm test           # run the Jest tests
npm run test:coverage
```

The API listens on `http://localhost:3000`. Check it with `GET /health`.

## License
MIT