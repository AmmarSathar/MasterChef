# Contribution Log - Paulina

## Sprint 1

| Date       | Task              | Description                                                                                                                   | Time Spent |
| ---------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 2026-01-30 | Repo Organisation | Create the folder an templates for other team members to track their progress. Wrote the meeting minutes                      | 1h         |
| 2026-02-02 | Backend Auth      | Implemented POST /api/auth/register endpoint with email/password/name validation, bcrypt password hashing, and error handling | 2h         |

**Total Time:** 3h

## Sprint 2

| Date       | Task                                   | Description                                                                                                                                                                                                               | Time Spent |
| ---------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 2026-02-10 | Profile Persistence (Full-Stack)       | Extended MongoDB user model with profile fields (dietary, allergies, skill level, cuisines, pfp, age, bio, etc.). Implemented PUT /api/auth/profile endpoint. Connected frontend Customize form to backend API with field name mapping and error handling. Debugged enum validation, JSON body limit, and error handler issues | 3h         |
| 2026-02-10 | Allergy Searchable Dropdown            | Replaced free-text allergy input with a searchable dropdown (search bar + checkbox list + selected badges). Supports 200+ food items                                                                                      | 0.5h       |
| 2026-02-10 | Shared Food Constants & Centralization | Created shared/constants/ with unified food data system (foods.ts, dietary.ts, cuisines.ts, skill-levels.ts, food-helpers.ts). Replaced hardcoded arrays in frontend with shared imports. Fixed skill level case mismatch | 2.5h       |
| 2026-02-10 | Recipe Management Backend | Designed and implemented recipe Mongoose model with ingredient subdocuments, dietary tag inheritance from shared food constants, and skill level/cuisine enum validation. Created CRUD endpoints (POST, GET, PUT, DELETE /api/recipes) with ownership checks. Built recommendation engine that scores recipes by ingredient match and filters by user dietary restrictions/allergies. Added test page at /test-recipes | 3h         |

**Total Time:** 9h
