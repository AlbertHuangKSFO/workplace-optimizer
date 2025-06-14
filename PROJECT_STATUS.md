---
title: Workplace Optimizer - Project Status and Todo List
date: 2025-06-15T03:00:00.000Z
---

## Workplace Optimizer - Project Status and Todo List

**Project Goal:** Complete the "In Development" features listed in the `README.md` for the "Workplace Optimizer" project, ensuring a consistent UI style across all tools.

### Completed / In-Progress Feature Modules (In Order of Implementation):

1.  **Electronic Wooden Fish (`ElectronicWoodenFish.tsx`)**

    - **Status:** ✅ Live
    - **Key Tasks Accomplished:**
      - Core functionality (click counting, sound effects).
      - UI enhancements (image integration, click animations, feedback text).
      - Data persistence (localStorage for daily/historical merit points).
      - Randomized feedback messages.
      - Navigation link correction.
      - UI style unification (Card title with Emoji).

2.  **Soup Switcher (`SoupSwitcher.tsx`)**

    - **Status:** ✅ Live
    - **Key Tasks Accomplished:**
      - Switched from local quote lists to dynamic generation via backend `/api/chat`.
      - Frontend API call implementation, including loading and error states.
      - Backend: Created corresponding `toolId` prompt (`soup-switcher.yaml`).
      - Backend: Added handler logic to `chatController.ts`.
      - Navigation and README updates.
      - UI style unification (Card title with Emoji).

3.  **Meeting Nonsense Translator (`MeetingNonsenseTranslator.tsx`)**

    - **Status:** ✅ Live
    - **Key Tasks Accomplished:**
      - Frontend component (text input, submission, results display).
      - Frontend page route.
      - Backend: Created corresponding `toolId` prompt (`meeting-nonsense-translator.yaml`).
      - Backend: Updated `loadSystemPrompt` and added handler logic in `chatController.ts`.
      - Navigation and README updates.
      - UI style unification (Card title with Emoji).

4.  **Colleague Persona Analyzer (`ColleaguePersonaAnalyzer.tsx`)**

    - **Status:** ✅ Live
    - **Key Tasks Accomplished:**
      - Initial frontend component creation.
      - Iterative UI enhancements based on user feedback (text input -> guidance buttons -> multi-dimensional card-based selection).
      - Backend: Created corresponding `toolId` prompt (`colleague-persona-analyzer.yaml`).
      - Backend: Updated `loadSystemPrompt` and added handler logic in `chatController.ts`.
      - Navigation and README updates.
      - UI style already conforms to the latest project standards.

5.  **Weather-Mood Link (`WeatherMoodLink.tsx`)**

    - **Status:** ✅ Live
    - **Key Tasks Accomplished / In Progress:**
      - **Frontend Component (`WeatherMoodLink.tsx`):**
        - UI includes city selection (Combobox, loading from `public/data/Meizu_cities.json`) and results display area.
        - Unified card UI style (🌤️ Emoji, title, description).
        - Page width adjusted for better layout.
      - **Frontend Page Route (`weather-mood-link/page.tsx`)**.
      - **Backend Prompt File (`weather-mood-link.yaml`)** (Corrected key to `default_system_prompt`).
      - **Backend `chatController.ts` Updates:**
        - Added `weather-mood-link` to `loadSystemPrompt`.
        - Added handler logic in `handleChatRequest` (now correctly expects only `cityId` from frontend).
      - **Frontend-Backend Interaction Refined:**
        - Frontend now sends only `cityId` to `/api/chat` for `weather-mood-link`.
        - Backend `chatController` handles Meizu Weather API call internally.
      - **Navigation and README Updates:** Marked as live.
    - **Resolved Issues:**
      - Initial 404 error due to missing backend dependencies (`axios`, `express`) and missing frontend proxy config.
      - Subsequent 501 error due to unhandled `toolId` in `chatController`.
      - Subsequent 400 error from Meizu API due to incorrect `cityId` format.
      - Subsequent 500 error due to incorrect system prompt YAML key.
      - Combobox search functionality fixed.

6.  **Career Path Forecaster (`CareerPathForecaster.tsx`)**

    - **Status:** ✅ Live
    - **Key Tasks Accomplished:**
      - **Frontend Component (`CareerPathForecaster.tsx`):**
        - UI created with inputs for current role, skills, experience (Select), aspirations, and preferences (Textareas).
        - Unified card UI style (🧭 Emoji, title, description) matching `DataBeautifier.tsx`, card width set to `max-w-7xl`.
        - Result display area using ReactMarkdown, with layout and scrolling behavior refined for long content.
        - Loading and error states implemented.
      - **Frontend Page Route (`career-path-forecaster/page.tsx`)** created.
      - **Backend Prompt File (`career-path-forecaster.yaml`)** created in `backend/src/data/prompts/zh/analysis/`.
      - **Backend `chatController.ts` Updates:**
        - Added `career-path-forecaster` to `loadSystemPrompt` under 'analysis' category.
        - Added handler logic for the new `toolId` in `handleChatRequest`.
      - **Navigation (`frontend/src/constants/navigation.ts`) and README Updates:** New tool added and marked as live.

7.  **Boss Radar / Risk Monitor (`BossRadar.tsx`)**

    - **Status:** ✅ Live
    - **Key Tasks Accomplished:**
      - **Frontend Component (`BossRadar.tsx`):**
        - UI created using `Card` layout (max-w-lg) with a header (📡 Emoji, Title, Description).
        - Displays different risk levels (icon, color, name, messages) randomly upon button click.
        - Includes a "Detecting..." state with loading animation.
        - Purely frontend,趣味性, based on predefined states and messages.
      - **Frontend Page Route (`boss-radar/page.tsx`)** created.
      - **Navigation (`frontend/src/constants/navigation.ts`) and README Updates:** New tool added to "Workplace Survival" and marked as live.

8.  **Side Hustle Assessor (`SideHustleAssessor.tsx`)**

    - **Status:** ✅ Live
    - **Key Tasks Accomplished:**
      - **Frontend Component (`SideHustleAssessor.tsx`):**
        - UI created with inputs for current job, skills, interests, available time (Select), and expectations (Textareas).
        - Unified card UI style (💡 Emoji, title, description) with card width set to `max-w-3xl`.
        - Result display area using ReactMarkdown, with layout and scrolling behavior for potentially long content.
        - Loading and error states implemented.
      - **Frontend Page Route (`side-hustle-assessor/page.tsx`)** created.
      - **Backend Prompt File (`side-hustle-assessor.yaml`)** created in `backend/src/data/prompts/zh/analysis/`.
      - **Backend `chatController.ts` Updates:**
        - Added `side-hustle-assessor` to `loadSystemPrompt` under 'analysis' category.
        - Added handler logic for the new `toolId` in `handleChatRequest`.
      - **Navigation (`frontend/src/constants/navigation.ts`) and README Updates:** New tool added to "Workplace Survival" and marked as live.

9.  **Career Leveling System (`CareerLevelingSystem.tsx`)**
    - **Status:** ✅ Live
    - **Key Tasks Accomplished:**
      - **Frontend Component (`CareerLevelingSystem.tsx`):**
        - Purely frontend simulation game with multiple career levels (e.g., Intern to CEO).
        - XP (Experience Points) accumulation via button click ("努力搬砖").
        - Promotion mechanism to advance to the next level upon reaching required XP.
        - UI displays current level, XP progress (with a `Progress` bar), level description, and feedback messages.
        - Uses `localStorage` to persist user progress (current level and XP).
        - Includes a "Reset" button to start over.
        - Unified card UI style (🚀 Emoji, title, description), max-width `max-w-lg`.
      - **Frontend Page Route (`career-leveling-system/page.tsx`)** created.
      - **Navigation (`frontend/src/constants/navigation.ts`) and README Updates:** New tool added to "Workplace Survival" (using `TrendingUp` icon) and marked as live.

---

### Subsequent Tasks (Based on `README.md`):

- **Content Creation:**
  1.  `起名花名` (Nickname/Codename Generator)
  2.  `打工人表情包生成器` (Worker Meme Generator)
- **Office Fun & Recreation:** 3. `平行宇宙工作模拟` (Parallel Universe Work Simulator) 4. `办公室鬼故事` (Office Ghost Stories) 5. `时光机工作体验` (Work Time Machine)
- **Time & Efficiency:** 6. `工作日倒计时` (Workday Countdown) 7. `划水指数计算器` (Slacking Index Calculator) 8. `工资倒推计算器` (Salary Ticker) 9. `财务自由倒计时` (Financial Independence Countdown) 10. `拖延症治疗器` (Procrastination Buster)
- **Well-being & Health:** 11. `办公室瑜伽指导` (Office Yoga Guide) 12. `隐形消费追踪` (Stealth Spending Tracker) 13. `咖啡因依赖指数` (Caffeine Dependence Index)

### General Requirements for New Features:

- Adherence to the unified UI style (card-based layout, Emoji in titles, etc.).
- For AI-interactive features: Creation of corresponding backend prompts and controller logic.
- Updates to navigation (`frontend/src/constants/navigation.ts`) and `README.md` upon completion.
