# SOEN 341 Group Project - Team CookWise

## Team Members
| ID | Name | Github Username |
|------|------|-------------|
| 40182146 | Ammar Abdul Sathar | @AmmarSathar |
| 40268729 | Navnit Chittoo | @navnit7 |
| 40314694 | Charrat Mohamed Taha  | @Nickeldon |
| 40299470 | Paulina Aguayo Dupin | @paulinadupin |
| 40248501 | Nicolas Lopez Callupe | @nlopezcallupe|
| 40029237 | Joey Chan | @bitofsomething |

## Objective
The objective of this project is to develop a web app that allows students to plan meals, track groceries, and propose recipes.

## Project
The web app includes 5 key features:
- **Feature 1:** User account management
- **Feature 2:** Recipe management
- **Feature 3:** Weekly meal planner
- **Feature 4:** Calendar and dashboard enhancements
- **Feature 5:** Recipe import from URL (with AI-assisted parsing fallback)
  - AI Attribution: Feature 5 uses OpenAI-based extraction as an optional fallback when structured parsing is incomplete.

The web app was completed across 4 sprints:
- **Sprint 1:** Setup GitHub; prepare sprint plan and user stories; implement **Feature 1**
- **Sprint 2:** Setup continuous integration pipeline; create acceptance tests for Sprint 1 stories; implement **Feature 2**
- **Sprint 3:** Create unit tests for **Feature 1** and **Feature 2**; implement **Feature 3** and **Feature 4**
- **Sprint 4:** Expand unit/integration testing, static-analysis maintenance, final report/documentation, and project stabilization

### Project Management

- GitHub Projects board used for backlog/task management: [GitHub Project #3](https://github.com/users/AmmarSathar/projects/3/views/1)
- Complete sprint plan: [Sprint Planning Spreadsheet](https://docs.google.com/spreadsheets/d/14NMCWJL9Pd5k0DKngz1vqVlO7IIteuMAlG1OaItr-Qc/edit?usp=sharing)

---

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest + React Testing Library + Playwright
- **Routing**: React Router DOM 7

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

From the project root:

```bash
npm install
```

This installs dependencies for all workspaces (`frontend`, `backend`, `shared`).

### Development

Start both frontend and backend:

```bash
npm run dev
```

Or run individually:

```bash
npm run dev:frontend   # Frontend only (port 3000)
npm run dev:backend    # Backend only (port 4000)
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:4000](http://localhost:4000)

### Testing

```bash
npm test                # Run frontend + backend unit/integration tests
npm run test:frontend   # Frontend tests only
npm run test:backend    # Backend tests only
npm run e2e             # Playwright end-to-end tests
```

Coverage (workspace-level):

```bash
npm run test:coverage -w frontend
npm run test:coverage -w backend
```

### Production Build

```bash
npm run build         # Build all workspaces
npm run build:frontend
npm run build:backend
```

### Linting

```bash
npm run lint          # Lint frontend and backend
```

### Continuous Integration

GitHub Actions workflow: `.github/workflows/ci.yml`

- Triggered on every push and pull request
- Uses `ubuntu-latest` with Node.js 20
- Pipeline steps:
  - `npm ci`
  - `npm test`
  - `npx playwright install --with-deps`
  - `npm run e2e`

## Project Structure

### Frontend

```text
frontend/
- src/
- tests/                    # Frontend test suite (Vitest + RTL)
- index.html
- vite.config.ts
- vitest.config.ts
- package.json
```

### Backend

```text
backend/
- src/                      # App, routes, controllers, services, models, utils
- tests/                    # Backend unit/integration tests
- vitest.config.ts
- package.json
```

## Scripts

Run all commands from the project root:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend and backend together |
| `npm run dev:frontend` | Start frontend only (port 3000) |
| `npm run dev:backend` | Start backend only (port 4000) |
| `npm run build` | Build all workspaces |
| `npm run build:frontend` | Build frontend only |
| `npm run build:backend` | Build backend only |
| `npm test` | Run frontend + backend tests |
| `npm run test:frontend` | Run frontend tests only |
| `npm run test:backend` | Run backend tests only |
| `npm run e2e` | Run Playwright end-to-end tests |
| `npm run lint` | Lint frontend and backend |
