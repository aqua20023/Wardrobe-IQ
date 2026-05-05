# Wardrobe IQ

Wardrobe IQ is a Phase 1 MVP wardrobe management app built as a TypeScript monorepo.

- `mobile`: Expo React Native app
- `server`: Node.js, Express, MongoDB, Redis, Cloudinary API
- `shared`: shared domain types for future package extraction

AI/ML is intentionally not implemented in this phase. Recommendation and chat surfaces are API-ready and return deterministic placeholder responses.

## Prerequisites

- Node.js 20.19.4+
- npm 10+
- MongoDB Atlas connection string
- Cloudinary account
- Redis URL
- Expo development build, Expo Go for SDK 55, or a simulator

## Setup

```bash
npm install
cp server/.env.example server/.env
cp mobile/.env.example mobile/.env
```

Update the `.env` files with your local or hosted services.

Redis is optional for local development. If `REDIS_URL` points to a Redis instance that is not running, the API will start with cache operations disabled.

## Run

```bash
npm run dev:server
npm run dev:mobile
```

The API runs on `http://localhost:4000/api/v1` by default. The Expo app reads `EXPO_PUBLIC_API_URL`.

## Seed Data

```bash
npm run seed
```

The seed script creates a demo user, clothing items, outfits, and feedback.

Demo login:

- Email: `demo@wardrobeiq.app`
- Password: `Password123!`

## API Docs

- Swagger UI: `http://localhost:4000/api-docs`
- OpenAPI source: [docs/openapi.yaml](docs/openapi.yaml)
- Postman collection: [server/postman/Wardrobe-IQ.postman_collection.json](server/postman/Wardrobe-IQ.postman_collection.json)

## Production Notes

- Set strong JWT secrets and rotate refresh tokens.
- Use HTTPS-only cookies or platform secure storage for mobile token handling in production.
- Configure Cloudinary upload presets and folder policies.
- Use managed Redis and MongoDB Atlas indexes.
- Add CI for `npm run typecheck`, server tests, and app smoke checks before deployment.
