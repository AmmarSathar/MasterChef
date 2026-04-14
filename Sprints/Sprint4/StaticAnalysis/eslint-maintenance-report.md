# Static Analysis Maintenance Report (Sprint 4)

## Scope

- Repository: `MasterChef`
- Tool: `ESLint` (frontend + backend workspaces)
- Trigger commands:

```bash
npm run lint -w frontend
npm run lint -w backend
```

- Objective: fix at least 5 issues reported by static analysis and document each maintenance commit.

## Findings That Triggered Fixes

The following ESLint findings were selected from the lint report:

1. `frontend/src/components/ui/Navbar/Navbar.tsx`
   - `7:3  error  'Tv' is defined but never used`
   - `8:3  error  'BarChart3' is defined but never used`
   - Rule: `@typescript-eslint/no-unused-vars`

2. `frontend/src/components/ui/AllergiesSelector.tsx`
   - `3:10  error  'AlertTriangle' is defined but never used`
   - Rule: `@typescript-eslint/no-unused-vars`

3. `frontend/src/components/ui/Dashboard/dashboard.tsx`
   - `63:10  error  'lastPage' is assigned a value but never used`
   - Rule: `@typescript-eslint/no-unused-vars`

4. `frontend/src/components/ui/Login/CustomizeStep1.tsx`
   - `7:3  error  'EggFriedIcon' is defined but never used`
   - Rule: `@typescript-eslint/no-unused-vars`

5. `frontend/src/pages/Home/Home.tsx`
   - `14:10  error  'colors' is assigned a value but never used`
   - Rule: `@typescript-eslint/no-unused-vars`

## Maintenance Actions and Commits

### 1) Remove unused icons in Navbar

- Commit: `466e4a2`
- Message: `fix(lint): remove unused Navbar icon imports`
- File changed: `frontend/src/components/ui/Navbar/Navbar.tsx`
- Change summary: removed unused `Tv` and `BarChart3` imports.

### 2) Remove unused icon import in AllergiesSelector

- Commit: `3552cdb`
- Message: `fix(lint): remove unused AlertTriangle import`
- File changed: `frontend/src/components/ui/AllergiesSelector.tsx`
- Change summary: removed unused `AlertTriangle` import.

### 3) Remove unused state in Dashboard

- Commit: `5ce0e94`
- Message: `fix(lint): remove unused dashboard lastPage state`
- File changed: `frontend/src/components/ui/Dashboard/dashboard.tsx`
- Change summary: removed unused `lastPage` state and dead `localStorage` assignment path tied to it.

### 4) Remove unused icon import in Customize Step 1

- Commit: `228cdc8`
- Message: `fix(lint): drop unused EggFriedIcon import`
- File changed: `frontend/src/components/ui/Login/CustomizeStep1.tsx`
- Change summary: removed unused `EggFriedIcon` import.

### 5) Remove unused color state logic on Home page

- Commit: `7131676`
- Message: `fix(lint): remove unused color state from Home page`
- File changed: `frontend/src/pages/Home/Home.tsx`
- Change summary: removed unused `colors` state and related update logic not consumed by rendering.

## Verification

Post-fix lint run confirms those specific findings no longer appear.

- Command used:

```bash
npm run lint -w frontend
```

- Result after this maintenance batch:
  - overall frontend lint still reports additional unrelated errors/warnings in other files
  - the 5 targeted findings documented above are resolved

## Backend Static Analysis

### Backend lint setup issue

Initial backend lint run failed due missing ESLint v9 flat config:

- command: `npm run lint -w backend`
- failure: `ESLint couldn't find an eslint.config.(js|mjs|cjs) file.`

### Backend setup and fix commit

- Commit: `f9e25fe`
- Message: `chore(lint-backend): enable ESLint v9 config and fix 9 backend findings`
- Added config: `backend/eslint.config.mjs`

### Backend findings fixed in this batch

1. `backend/src/examples/using-shared-types.ts`
   - `2:16 error 'Recipe' is defined but never used`
   - `5:31 error 'id' is defined but never used`
   - `20:12 error 'error' is defined but never used`
   - fixes:
     - removed unused `Recipe` import
     - used `id` in the example user object
     - removed unused catch binding

2. `backend/src/middleware/error-handler.ts`
   - `9:3 error '_next' is defined but never used`
   - `11:48 error Unexpected any`
   - fixes:
     - explicitly consumed `_next` with `void _next`
     - replaced `any` cast with typed `{ status?: number }` cast

3. `backend/src/models/user.model.ts`
   - `65:13 error 'passwordHash' is assigned a value but never used`
   - `65:27 error '__v' is assigned a value but never used`
   - fix:
     - replaced unused destructuring with explicit `delete ret.passwordHash` and `delete ret.__v`

4. `backend/src/utils/profile.ts`
   - `65:27 error Unexpected control character(s) in regular expression`
   - `89:47 error '_userId' is assigned a value but never used`
   - fixes:
     - replaced control-character regex with a `charCodeAt`-based filter
     - removed unused `_userId` binding and deleted `userId` from `rest`

### Backend verification

- command: `npm run lint -w backend`
- before fixes: `19 errors`
- after setup + fix batch: `10 errors` remaining
- remaining issues are concentrated in `backend/src/services/recipe-import.service.ts`

## Notes

- This report intentionally uses repository-relative paths only.
- No personal absolute filesystem paths are referenced.
