# SOEN 341 Group Project - Team CookWise

## Team Members

| ID       | Name                  | Github Username |
| -------- | --------------------- | --------------- |
| 40182146 | Ammar Abdul Sathar    | @AmmarSathar    |
| 40268729 | Navnit Chittoo        | @navnit7        |
| 40314694 | Charrat Mohamed Taha  | @Nickeldon      |
| 40299470 | Paulina Aguayo Dupin  | @paulinadupin   |
| 40248501 | Nicolas Lopez Callupe | @nlopezcallupe  |
| 40029237 | Joey Chan             | @bitofsomething |

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

| Script                   | Description                         |
| ------------------------ | ----------------------------------- |
| `npm run dev`            | Start frontend and backend together |
| `npm run dev:frontend`   | Start frontend only (port 3000)     |
| `npm run dev:backend`    | Start backend only (port 4000)      |
| `npm run build`          | Build all workspaces                |
| `npm run build:frontend` | Build frontend only                 |
| `npm run build:backend`  | Build backend only                  |
| `npm test`               | Run frontend + backend tests        |
| `npm run test:frontend`  | Run frontend tests only             |
| `npm run test:backend`   | Run backend tests only              |
| `npm run e2e`            | Run Playwright end-to-end tests     |
| `npm run lint`           | Lint frontend and backend           |

---

## Coding Standards

Coding standards are clearly defined and effectively communicated to the team through the Wiki.

---

### Infrastructure

For CookWise, we initially went with a full-stack approach using React and Next.js. After further reconsideration, we chose a more standard approach using **ReactJS + ViteJS** for the frontend and **Node.js + Express.js** for the backend, encapsulated as a monorepo. This stack was chosen to offer the best performance-to-simplicity ratio for our application.

**Frontend dependencies:**

- [lucide-react](https://lucide.dev/), icon library
- [shadcn/ui](https://www.shadcn.io/), UI component library
- [TailwindCSS](https://tailwindcss.com/), inline styling
- [Axios](https://axios-http.com), frontend-to-backend REST communication
- [Better Auth](https://better-auth.com/), client authentication

**Backend:**

- [Express.js](https://expressjs.com/), performant and scalable HTTP server with a fast learning curve
- [MongoDB](https://www.mongodb.com), document-oriented model suited for flexible data structures throughout development

**Core framework repositories:** [ReactJS](https://react.dev/) | [ViteJS](https://vite.dev/) | [Node.js](https://nodejs.org/)

---

### Naming Conventions

#### Kebab-case, Node.js / TypeScript backend files and API routes

#### camelCase, variables, functions, and MongoDB fields

#### PascalCase, React components, interfaces, and types

#### UPPER_SNAKE_CASE, constants

---

### Key Source Files

| File                                                                                                                                   | Purpose                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [`backend/src/app.ts`](https://github.com/AmmarSathar/MasterChef/blob/main/backend/src/app.ts)                                         | App setup: mounts BetterAuth handler, CORS, routes, and global error handling                            |
| [`backend/src/lib/auth.ts`](https://github.com/AmmarSathar/MasterChef/blob/main/backend/src/lib/auth.ts)                               | Better Auth configuration: email/password + OAuth (Google/GitHub) with extended user fields              |
| [`backend/src/models/recipe.model.ts`](https://github.com/AmmarSathar/MasterChef/blob/main/backend/src/models/recipe.model.ts)         | Core Mongoose Recipe schema: ingredients, dietary tags, allergen computation, and text search index      |
| [`backend/src/services/recipe.service.ts`](https://github.com/AmmarSathar/MasterChef/blob/main/backend/src/services/recipe.service.ts) | Business logic layer for recipes: CRUD, search, filtering, dietary tag helpers, and recommendation logic |
| [`frontend/src/context/UserContext.tsx`](https://github.com/AmmarSathar/MasterChef/blob/main/frontend/src/context/UserContext.tsx)     | Global auth/user state: provides session data and logout via BetterAuth's `useSession()` hook            |

---

### Testing and Continuous Integration

#### Testing Strategy

The project uses a layered automated testing strategy across the frontend and backend:

- **Frontend unit tests** use Vitest with React Testing Library in a `jsdom` environment to validate component behavior, state changes, API payload construction, and error handling.
- **Backend unit and service-level tests** use Vitest in a Node environment. Logic that depends on MongoDB models is tested against `mongodb-memory-server`, an isolated in-memory database, instead of a shared external database.
- **End-to-end tests** use Playwright to validate critical user flows such as registration, login/logout, and profile/preferences behavior in a real browser environment.

A current run of `npm test` passes with **23 frontend tests** and **63 backend tests**.

#### Missing Unit Tests and How Quality Was Still Checked

Some files do not have direct unit tests, but the gaps are in areas where isolated tests would provide limited value:

- **`backend/src/services/recipe-import.service.ts`**, depends on external websites, Playwright browser automation, HTML scraping, proxy/network behavior, and optional OpenAI extraction. Non-deterministic dependencies make brittle live-network unit tests impractical; quality was validated through broader service and UI testing instead.
- **`backend/src/index.ts`, `backend/src/config/database.ts`, route registration files**, thin bootstrap/wiring layers checked indirectly through backend integration tests and the CI pipeline, which would fail if application wiring were broken.
- **Animated background and low-level UI wrapper components**, contain minimal business logic; quality was verified through manual UI verification and higher-level screen tests.

Testing effort was prioritized on authentication, recipe management, search/filter logic, profile updates, and meal-planning rules, the highest-risk areas.

#### Unusual or Unique Testing Aspects

- Backend service tests use `mongodb-memory-server` to test validation, authorization, and persistence behavior against realistic MongoDB interactions without a permanent test database.
- Frontend tests mock child components and network requests so container components can be tested in isolation, keeping tests focused on state transitions and user-facing behavior rather than unrelated rendering details.
- Unit/service tests and Playwright browser tests run together in the same CI workflow, catching both isolated logic regressions and end-to-end failures on every pull request.

#### 5 Important Unit Tests

| Test File                                                                                                                                                      | Testing Objective                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`frontend/tests/Login.test.tsx`](https://github.com/AmmarSathar/MasterChef/blob/main/frontend/tests/Login.test.tsx)                                           | Ensure invalid passwords are rejected before submission, enforcing account-security rules and avoiding unnecessary backend requests                     |
| [`frontend/tests/RecipeCrudFlow.test.tsx`](https://github.com/AmmarSathar/MasterChef/blob/main/frontend/tests/RecipeCrudFlow.test.tsx)                         | Verify the full recipe-management workflow and confirm that create, update, and delete requests send the correct authenticated owner data               |
| [`frontend/tests/AccountPreferences.test.tsx`](https://github.com/AmmarSathar/MasterChef/blob/main/frontend/tests/AccountPreferences.test.tsx)                 | Confirm that preference changes are preserved correctly and sent to the backend in the expected payload format                                          |
| [`backend/tests/recipe-search-filter.service.test.ts`](https://github.com/AmmarSathar/MasterChef/blob/main/backend/tests/recipe-search-filter.service.test.ts) | Validate the core search feature by proving that keyword search, time filters, and difficulty filters combine correctly and return accurate result sets |
| [`backend/tests/meal-plan-entry.service.test.ts`](https://github.com/AmmarSathar/MasterChef/blob/main/backend/tests/meal-plan-entry.service.test.ts)           | Protect data ownership by ensuring a user cannot modify another user's meal plan entry, even when the referenced recipe is otherwise valid              |

#### 3 Important Acceptance Tests

| Test File                                                                                                                | User Story                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| [`e2e/registration.spec.ts`](https://github.com/AmmarSathar/MasterChef/blob/main/e2e/registration.spec.ts)               | A new user can register, complete the onboarding preferences flow, and reach the dashboard                    |
| [`e2e/login-logout.spec.ts`](https://github.com/AmmarSathar/MasterChef/blob/main/e2e/login-logout.spec.ts)               | A registered user can log in, remain authenticated across pages, and be redirected to login after logging out |
| [`e2e/profile-preferences.spec.ts`](https://github.com/AmmarSathar/MasterChef/blob/main/e2e/profile-preferences.spec.ts) | A user can update dietary preferences and allergies and see the changes persisted after a page reload         |

#### Continuous Integration Environment

The project uses GitHub Actions for continuous integration, configured in [`.github/workflows/ci.yml`](https://github.com/AmmarSathar/MasterChef/blob/main/.github/workflows/ci.yml).

- **Trigger policy:** runs on every push to any branch and on every pull request
- **Runner:** `ubuntu-latest`
- **Runtime:** Node.js 20 with npm dependency caching enabled
- **Environment:** test environment variables are injected in the workflow, including fallback values for Better Auth and OAuth credentials when GitHub secrets are not defined

**Pipeline steps:**

1. Check out the repository
2. Install dependencies with `npm ci`
3. Run the workspace test suite with `npm test`
4. Install Playwright browsers with `npx playwright install --with-deps`
5. Run browser end-to-end tests with `npm run e2e`
