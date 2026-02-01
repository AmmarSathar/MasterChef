# Monorepo Setup - Shared Types

The monorepo is now configured so both backend and frontend can access shared types and constants.

## Structure

```
MasterChef/
├── shared/          # Shared types and constants
│   ├── types/
│   │   ├── user.ts
│   │   ├── recipe.ts
│   │   ├── common.ts
│   │   └── index.ts
│   └── index.ts
├── backend/         # Backend application
└── frontend/        # Frontend application
```

## Usage

### Import shared types in Backend:
```typescript
import { User, Recipe, ApiResponse } from '@masterchef/shared';
```

### Import shared types in Frontend:
```typescript
import { User, Recipe, ApiResponse, RecipeDifficulty } from '@masterchef/shared';
```

## Available Types

- **User Types**: `User`, `UserCredentials`, `UserProfile`
- **Recipe Types**: `Recipe`, `Ingredient`, `RecipeDifficulty`
- **Common Types**: `ApiResponse`, `PaginationParams`, `PaginatedResponse`

## Adding New Shared Types

1. Create a new file in `shared/types/`
2. Export from `shared/types/index.ts`
3. TypeScript will automatically pick up the changes
4. Both backend and frontend can immediately use the new types

## Build Order

The shared package is built first, then backend and frontend:
```bash
npm run build
```

This ensures type definitions are available before building dependent packages.
