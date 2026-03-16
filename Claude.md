# Collectr+ — Pokémon TCG Collection & Chase Tracker

Web app (React + Node.js) with a companion mobile app (React Native).
Helps collectors manage what they own, what they're chasing, and the value of both.

## What This App Does
- **Got It**: Log owned cards, organize into virtual binders or storage boxes
- **Want It / Need It**: Chase list with folders and priority tiers (Grail / High / Medium / Low)
- **Values**: Pulled from multiple pricing sources (TCGPlayer, eBay sold, PriceCharting) and averaged
- Card database sourced from the PokéTCG API (https://pokemontcg.io)

## Project Structure
- `/web` — React frontend (web app)
- `/mobile` — React Native app (iOS + Android)
- `/api` — Node.js/Express backend
- `/api/routes` — API endpoints
- `/api/services/pricing` — Price aggregation logic (one file per source)
- `/api/services/cards` — PokéTCG API integration
- `/db` — Database schema and migrations (PostgreSQL)

## Key Commands
- `npm run dev` — Start web app locally
- `npm run api` — Start backend API
- `npm run mobile` — Start React Native dev server
- `npm run db:migrate` — Run database migrations
- `npm run test` — Run test suite

## Core Data Concepts
- A **card entry** belongs to either the collection (got it) or chase list (want it/need it)
- Chase list cards live in **folders** and have a **priority tier**
- **Binders** have pages with configurable pocket layouts (slots a card can be placed in)
- **Boxes** have dividers and rows
- Pricing is stored as a snapshot with a timestamp; refresh on demand

## Rules
- Never hardcode API keys — use environment variables
- Pricing calls are rate-limited; always cache results with a TTL
- PokéTCG API is the source of truth for card identity (id, name, set, image)
- Mobile app is read + scan optimized; heavy data entry happens on web
- If a pricing source is unavailable, degrade gracefully and show available sources only
- Ask before making changes that affect the database schema
