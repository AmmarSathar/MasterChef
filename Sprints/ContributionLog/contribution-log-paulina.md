# Contribution Log - Paulina

## Sprint 1

| Date | Task | Description | Time Spent |
|------|------|-------------|------------|
| 2026-01-30 | Repo Organisation | Create the folder an templates for other team members to track their progress. Wrote the meeting minutes | 1h |
| 2026-02-02 | Backend Auth | Implemented POST /api/auth/register endpoint with email/password/name validation, bcrypt password hashing, and error handling | 2h |


**Total Time:** 3h

## Sprint 2

| Date | Task | Description | Time Spent |
|------|------|-------------|------------|
| 2026-02-10 | Extend User Schema | Added profile fields (dietary_restric, allergies, skill_level, cuisines_pref, age, bio, pfp, weight, height, birth) to MongoDB user model — stored in the same document as email, name, and password | 1h |
| 2026-02-10 | Profile Update API | Implemented PUT /api/auth/profile endpoint with controller, service (findByIdAndUpdate), and UpdateProfileInput/UserResponse types | 1h |
| 2026-02-10 | Frontend-Backend Connection | Connected Customize form "Complete Setup" button to the profile API, mapped frontend field names to backend schema (e.g. skillLevel → skill_level), added error handling with toast notifications | 1h |
| 2026-02-10 | Bug Fixes & Error Handling | Fixed enum validation (lowercase skill_level), increased Express JSON body limit to 10mb for base64 profile pictures, improved error handler logging | 30min |
| 2026-02-10 | Sprint 2 Architecture Guide | Created profile-backend-guide.md documenting the full architecture, data flow, task breakdown, and naming conventions for the team | 30min |