# Prowider Mini Lead Distribution System

Run locally:

1. Install dependencies: `npm install`
2. Set `MONGODB_URI` env var (mongodb://localhost:27017/provider-mini)
3. Start dev server: `npm run dev`
4. Seed data: open `http://localhost:3000/api/seed` in browser or call with curl

Pages:
- `/request-service` — customer form
- `/dashboard` — provider dashboard (auto-updates via SSE)
- `/test-tools` — webhook simulation and bulk lead generation
