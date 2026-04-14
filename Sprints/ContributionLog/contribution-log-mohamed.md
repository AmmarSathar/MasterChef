# Contribution Log - Mohamed

## Sprint 1

| Date | Task | Description | Time Spent |
|------|------|-------------|------------|
| 2026-01-30 | Login UI Implementation | Implemented login page UI following UX design by @bitofsomething with theme system, password validation requirements, and mobile responsiveness | 4h |
| 2026-01-31 | Registration UI & Customization Flow | Built complete registration flow and user customization prototype with dietary restrictions, skill level, and cuisine preferences | 3.5h |
| 2026-02-02 | Frontend-Backend Integration | Integrated axios and connected registration form to backend API (following @paulina's backend implementation) with error handling and localStorage | 2.5h |
| 2026-02-03 | User Type Extensions | Extended User interface with profile fields (age, birth, weight, height, bio, dietary restrictions, allergies, skill level, cuisines) | 1.5h |
| 2026-02-04 | Multi-Step Customization Form | Refactored customization into two-step form with fade transitions, added profile picture upload, and enhanced mobile-responsive design | 4.5h |

**Total Time:** 16h

## Sprint 2

| Date | Task | Description | Time Spent |
|------|------|-------------|------------|
| 2026-02-13 | Page Transitions & Navigation Routing | Added framer-motion page transitions across Login, Customize, and Dashboard; fixed routing so Login and Navbar are proper router-aware components; added MemoryRouter in Login tests | 3h |
| 2026-02-13 | Login Flow & Customization Tracking | Added `isCustomized` flag tracking to user context and login flow; blocked dashboard access for uncustomized users; fixed window location sequencing bug in redirect logic | 2h |
| 2026-02-17 | Dashboard User Menu, Settings & Account Preferences UI (#76) | Built full Settings page with tabs; implemented AccountSettings (name, email, password change), AccountPreferences (dietary tags, allergies, skill, cuisines), and AppearanceSettings stubs; added ProfilePictureChange component; extended UserContext with user mutation helpers | 6h |

**Total Time:** 11h

## Sprint 3

| Date | Task | Description | Time Spent |
|------|------|-------------|------------|
| 2026-03-18 | Recipe Search, Save & Display UI (#132) | Built RecipeCreator modal, RecipeContainer grid, RecipeView detail page, RecipeForm (full ingredient/step editor), and SearchModal with filters; added TiltedCard animation component, AllergiesSelector, spinner, toggle-group; added shared UI string constants | 8h |
| 2026-03-27 | Calendar Feature — Initial Implementation | Built Calendar page with weekly/monthly/yearly filter tabs; implemented CalendarDayView (day detail with meal slots and slot picker); added CalendarPicker mini-calendar; wired up dashboard navigation to Calendar | 4h |

**Total Time:** 12h

## Sprint 4

| Date | Task | Description | Time Spent |
|------|------|-------------|------------|
| 2026-04-08 | Navbar Simplification & Method Renames | Reduced Navbar component from 209 to ~115 lines by consolidating state and handlers; renamed methods across Dashboard, Settings, RecipeForm, CalendarDayView, Login/Customize for consistency; cleaned up UserContext API | 1h |
| 2026-04-10 | Calendar Backend + Meal Plan API Overhaul | Created CalendarEntry model, calendar service (getCalendarWeek, upsertCalendarEntry, removeCalendarEntry), and calendar controller/routes; rewrote meal-plan service so slots return arrays of recipe options with entryId/imageUrl/description/cookingTime; added getOrCreateMealPlanByWeek endpoint; fixed Sunday/Monday week boundary bug in Calendar and Meals | 5h |
| 2026-04-10 | Calendar & Meal Plan Frontend Fixes + Skeleton Loading | Fixed Calendar weekly view to use meal-plan API; fixed CalendarDayView meal options to match plan data; fixed Meals page redirect (date/slot params now jump to correct week); added skeleton loading with fade transitions in Calendar, Day View, Meals, Recipe grid, and Meal Picker panel; added "New Recipe" button in last empty picker slot | 3h |
| 2026-04-10 | Calendar Component Restructure & Monthly Quick View | Moved CalendarWeekView, CalendarDayView, CalendarPicker, CalendarSlotPicker into a dedicated `calendar/` subfolder; added recipe quick-view on monthly grid cells; fixed RecipeCreator styling errors; added avatar component | 2h |
| 2026-04-10 | Settings Placeholder Sections | Extracted AppearanceSettings, PrivacyPolicy, and TermsOfService into separate components with AI-generated placeholder content; simplified main Settings.tsx | 1h |
| 2026-04-10 | Navbar Type Fix | Resolved TypeScript type error in Navbar component introduced by UserContext refactor | 0.5h |
| 2026-04-10 | Test Suite Fixes | Fixed Meals.test.tsx (corrected weekWithEntry helper to cover all days so tests pass regardless of activeDay); added path alias to tsconfig.json; fixed Calendar.test.tsx mock structure for CalendarDayView and CalendarSlotPicker (two passes) | 1.5h |
| 2026-04-11 | Calendar/Meals Routing Bug Fixes | Fixed edit/delete recipe on Calendar and Meals doing nothing by switching from navigate() to window.location.hash so Dashboard hash listener picks up the change; fixed clicking a meal in weekly view opening the wrong view; fixed "Add New Recipe" in Meal Picker launching recipe page instead of opening RecipeCreator | 2h |
| 2026-04-11 | RecipeCreator Ingredient Amount Fix | Fixed bug where users could not type precise decimal values for ingredient amounts — previously required pressing "+" hundreds of times; also fixed skill level defaulting to beginner so backend validation no longer throws | 0.5h |
| 2026-04-12 | Drag-to-Slot & Navbar Hash Fix + Calendar Week View | Rewrote DnD state with debounced 1.5s sync timeout; fixed drag-to-slot not updating Calendar (causing meal duplication); fixed window.location changes not updating Navbar; fixed visual issues in Calendar Week view; added sync warning toast on unsynced changes | 2h |
| 2026-04-12 | Toast Improvements & Accessibility Colors | Added better unsynced-changes toast; enhanced color palette for better accessibility contrast; leveled recipe card layout for more consistent grid | 1h |
| 2026-04-13 | ClickSpark UI Effect | Added ClickSpark component for click particle animation across the app | 1h |
| 2026-04-13 | Bug Fixes & QoL Features — EOL Update (#181) | Consolidated and shipped all above bug fixes via PR; also fixed "return" button always leading to main page (now uses window.history.back()); fixed meal updates on Calendar not persisting after reload | 1h |
| 2026-04-13 | User Deletion | Fully implemented account deletion — backend auth.ts deletion logic + confirmation flow in AccountSettings with password re-entry and Settings/Dashboard wiring | 2h |
| 2026-04-13 | "Add a Bio" from User Card | Added inline bio prompt in User card when user has no bio set; updated Dashboard and Settings components to support the flow | 1h |
| 2026-04-13 | Additional Themes | Added extra UI themes derived from shadcn's defaults to the theme selector | 0.5h |
| 2026-04-14 | Resolution Scaling & RecipeForm Overhaul (#198) | Fixed resolution scaling issues across the app; rewrote RecipeForm.tsx (447 → ~120 lines net); refined RecipeCreator and ClickSpark integration; updated vite.config and main.tsx | 3h |
| 2026-04-14 | Recipe Form Width & Outside-Click Option | Fixed recipe form width scaling on different screen sizes; added configurable prop to prevent outside-click from closing RecipeCreator (default disabled) | 1h |
| 2026-04-14 | Remove Deploy Utilities | Removed GitHub Actions deploy workflow and render.yaml as deployment via Render/CI is no longer in use | 0.5h |
| 2026-04-14 | Final Report | Wrote my sections of the final project report | 2h |
| 2026-04-14 | Presentation Slides | Created my parts of the final presentation slides | 0.5h |

**Total Time:** 33h
