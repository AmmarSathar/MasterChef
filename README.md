# COEN 341 Group Project - Team MasterChef

## Team Members
- Ammar Sathar
- Charrat Mohamed Taha
- Haoyang Ni
- Joey Chan
- Navnit Chittoo
- Paulina Aguayo Dupin

## Objective
The objective of this project is to develop a web app that allows students to plan meals, track groceries, and propose recipes.

## Project
The web app will have 5 key features:
- **Feature 1:** User account management
- **Feature 2:** Recipe management
- **Feature 3:** Weekly meal planner
- **Feature 4:** TBA
- **Feature 5:** TBA

The web app will be completed in 4 sprints:
- **Sprint 1:** Setup Github; prepare sprint plan, prepare user stories with task breakdown, and implement code for **Feature 1**
- **Sprint 2:** Setup continuous integration pipepline in repository; create 2 acceptance tests for user stories in **Sprint 1**; prepare user stories with task breakdown, and implement code for **Feature 2**
- **Sprint 3:** Create unit tests for **Feature 1** and **Feature 2**; prepare user stories with task breakdown, and implement code for **Feature 3**; determine **Feature 4** and prepare user stories with task breakdown and implement code
- **Sprint 4:** Create unit tests for **Feature 3**; TBA

---

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest + React Testing Library
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

This installs dependencies for all workspaces (frontend, backend, shared).

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
npm test              # Run frontend tests
npm run test:frontend # Same as above
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

## Project Structure

### Frontend

```
frontend/
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── Navbar/
│   │           ├── Navbar.tsx
│   │           ├── Navbar.test.tsx
│   │           └── styles.css
│   ├── pages/
│   │   └── Home/
│   │       ├── Home.tsx
│   │       └── Home.test.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   └── icons/
│   ├── test/
│   │   └── setup.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── vitest.config.ts
└── package.json
```

### Backend

```
backend/
├── src/
│   ├── index.ts          # Server entry point
│   ├── app.ts            # Express app configuration
│   ├── config/
│   │   └── index.ts      # Environment variables, constants
│   ├── routes/
│   │   └── index.ts      # Route aggregator
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic layer
│   ├── middleware/
│   │   └── error-handler.ts  # Global error handling
│   ├── models/           # Database models
│   ├── types/
│   │   └── index.ts      # Shared TypeScript types
│   └── utils/            # Helper functions
└── package.json
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
| `npm test` | Run frontend tests |
| `npm run lint` | Lint frontend and backend |
