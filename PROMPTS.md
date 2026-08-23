# PROMPTS.md — AutoElite Development AI Prompt Log

This file records the AI prompts used during the development and finalization of the AutoElite Car Dealership Management System.

## Important note

The project was developed using **ChatGPT** and **Amazon Q Developer**.

The original project assignment/TDD Kata brief was the starting specification for the application. It defined the required backend API, database, authentication, frontend, TDD, Git workflow, AI co-authorship, README, screenshots, test report, and `PROMPTS.md` requirements.

The exact complete text of every early development chat is not available in the current repository/workspace. Therefore, this file does **not invent or reconstruct missing conversations**. The prompts below are the exact prompts available from the recorded development history used for this documentation.

---

# Prompt History

## Prompt 0 — Project Starting Specification

**Source:** Car Dealership Inventory System / TDD Kata assignment

The development started from the assignment requirements supplied for the project. The assignment required:

- A full-stack Car Dealership Inventory System.
- Node.js/TypeScript with Express/NestJS, Python with Django/FastAPI, or Ruby on Rails for the backend.
- A persistent database.
- User registration and login.
- JWT/token-based authentication.
- Vehicle CRUD APIs.
- Vehicle search/filtering.
- Vehicle purchase and quantity reduction.
- Admin-only delete and restock operations.
- React frontend using HTML5, CSS3, Tailwind and React.
- User dashboard, search/filter, purchase functionality and admin UI.
- TDD with a visible Red-Green-Refactor history.
- Frequent descriptive Git commits.
- AI co-authorship for commits where AI was used.
- A README with a mandatory `My AI Usage` section.
- Screenshots.
- A test report.
- A root `PROMPTS.md` containing raw AI chat logs or public chat links.
- Optional deployment.

This assignment was the project's initial functional and process specification.

---

# Amazon Q Developer — Recorded Prompts

## Prompt 1 — Purchase History and Admin Verification

```text
IMPORTANT — I have only 15 minutes left.

DO NOT add any new features.

DO NOT rename AutoElite.

DO NOT redesign anything.

DO NOT modify unrelated functionality.

DO NOT troubleshoot WSL/Node/npm.

DO NOT run lengthy searches.

DO NOT commit.

We only need to finish TWO things:

1. FIX the existing "Failed to load purchase history" issue.

2. VERIFY the existing Admin page.

The purchase-history implementation already exists:

- Purchase model + migration
- GET /api/vehicles/my-purchases
- PurchasesPage.jsx
- /purchases protected route
- vehiclesAPI.myPurchases()
- authentication interceptor
- Prisma Client regenerated
- Backend tests previously passed 70/70
- Frontend build previously passed

The browser previously showed:

"Failed to load purchase history"

The previous investigation already confirmed:

GET /api/vehicles/my-purchases exists and uses authentication.

Frontend calls /api/vehicles/my-purchases.

Frontend attaches the JWT token from localStorage.

Continue ONLY from this point.

FIRST:

Inspect the current purchase-history implementation and identify the actual reason the browser request fails.

Fix only that reason.

Do not change the UI.

Then immediately verify the fix with the shortest possible test.

SECOND:

Check the existing Admin page.

Confirm:

- Admin route is protected
- Admin user can access it
- Vehicle create/update/delete works
- Restock works
- Normal USER cannot access admin operations

If an admin account does not exist, use the existing createAdmin.js script to create one.

Do NOT spend time on exhaustive testing.

Do NOT modify anything unrelated.

At the end, report:

1. Purchase history: FIXED / NOT FIXED

2. Admin page: WORKING / NOT WORKING

3. Exact files changed, if any

4. Any remaining blocker

Then STOP.
````

---

## Prompt 2 — Admin Password Reset

```text
Reset the password for the existing admin user `admin@autoelite.com` to `Admin@12345`.

IMPORTANT:

- Do NOT modify any other users.

- Do NOT modify authentication logic.

- Do NOT modify the frontend.

- Do NOT change the user's email.

- Only update the password hash for `admin@autoelite.com`.

- Confirm when the password has been successfully updated.

- Do not run unnecessary tests or make unrelated changes.
```

**Public-repository note:** The password above was used during local development and should not be treated as a production credential. If this repository is public, the password should be changed after evaluation or kept out of any public credential store.

---

## Prompt 3 — README Generation

```text
Create a professional, GitHub-ready README.md for the existing AutoElite car dealership project.

IMPORTANT:

- Do NOT modify any application code.

- Do NOT change functionality.

- Do NOT rename AutoElite.

- Do NOT create unnecessary files.

- Only create/update README.md.

- Base the README strictly on the actual current project implementation. Do not claim features that do not exist.

The project is a full-stack car dealership management platform with:

USER FEATURES:

- User registration and login

- JWT-based authentication

- Protected dashboard

- Vehicle inventory browsing

- Vehicle search/filter

- Vehicle purchase

- Purchase history / My Purchases

- Indian Rupee (₹) pricing

- Logout

ADMIN FEATURES:

- Admin authentication/authorization

- Admin dashboard/panel

- Create vehicles

- Update vehicles

- Delete vehicles

- Restock vehicles

- Inventory management

BACKEND:

- Node.js

- Express.js

- Prisma ORM

- SQLite

- JWT authentication

- bcrypt/bcryptjs password hashing

- Jest/Supertest tests

FRONTEND:

- React

- Vite

- React Router

- Axios

- CSS

- Dark navy/black + gold AutoElite design

AI/ML:

Do NOT claim that this project uses AI/ML unless the actual current code contains it.

README STRUCTURE:

# AutoElite — Car Dealership Management System

Add a concise professional tagline.

## Overview

[...]

## Features

[...]

## How It Works

[...]

## Tech Stack

[...]

## Architecture

[...]

## Project Structure

[...]

## Authentication & Authorization

[...]

## Purchase Flow

[...]

## Admin Management

[...]

## API Overview

[...]

## Getting Started

[...]

## Environment Variables

[...]

## Testing

[...]

## Build

[...]

## Deployment

[...]

## Screenshots

[...]

## Security Notes

[...]

## Future Enhancements

[...]

## License

[...]

## Author / Team

[...]

Finally:

1. Inspect the current repository before writing the README.

2. Make sure every technical claim matches the actual implementation.

3. Create/update only README.md.

4. Show me the final README content.

5. Do not commit.

6. Then WAIT.
```

---

## Prompt 4 — Final Documentation

```text
We need to finalize the documentation required by the Car Dealership Inventory System assignment.

Do ONLY the following documentation tasks. Do not modify application functionality, UI, backend logic, database schema, authentication, or API behavior.

1. CREATE `PROMPTS.md` at the repository root.

The assignment requires:

"PROMPTS.md containing raw, unedited AI chat logs or public chat links (no AI-generated summaries)."

Use the actual AI prompts/chat logs available in this development conversation/history. Preserve them as raw/unmodified as possible. Do NOT invent conversations, summarize them, or create fake logs.

Include the actual prompts/conversations from the project development, including where applicable:

- Project planning

- Backend/API development

- TDD and testing

- Authentication

- Vehicle CRUD

- Search/filter

- Purchase functionality

- Restock functionality

- Purchase history

- Frontend development

- Admin panel

- UI improvements

- Debugging/troubleshooting

- README/documentation

- Deployment preparation

If complete raw logs are not accessible from the current environment, do NOT fabricate them. Instead, include only the actual raw prompts/logs you can access and clearly preserve their original wording.

2. UPDATE `README.md`.

Add a mandatory section titled exactly:

## My AI Usage

Document:

- AI tools used: Amazon Q and ChatGPT

- What each tool was used for

- How AI assisted with planning, implementation, testing, debugging, documentation, and deployment

- How AI was used alongside TDD

- A personal reflection explaining that AI-generated output was reviewed, understood, tested, and integrated rather than blindly accepted

Do NOT claim AI/ML features that do not exist in the application.

3. CREATE `TEST_REPORT.md`.

[...]

4. README SCREENSHOTS

[...]

5. VERIFY DOCUMENTATION

[...]

6. IMPORTANT

Only modify:

- README.md
- PROMPTS.md
- TEST_REPORT.md

Do not commit.

Do not push.

Do not deploy.

At the end, report:

- Files created/modified

- Whether each required documentation item is complete

- Any requirement that could not be completed because the necessary source information was unavailable

Then WAIT.
```

---

# Other AI Work

The project also involved AI assistance for development activities including:

* Backend/API implementation.
* Authentication and JWT handling.
* Vehicle CRUD functionality.
* Search and filtering.
* Purchase functionality.
* Purchase history.
* Restock functionality.
* Frontend implementation.
* Admin panel.
* TDD/testing.
* Debugging.
* Documentation.
* Deployment preparation.

However, the complete raw wording of those earlier prompts is not available in the current project workspace. They are therefore not reproduced here as if they were exact prompts.

No fabricated AI conversations have been added.

---

# AI Tools Used

## Amazon Q Developer

Amazon Q Developer was used during the implementation, debugging, testing, documentation and final verification stages. It was also used through the development workflow to inspect and modify project files and help diagnose implementation issues.

## ChatGPT

ChatGPT was used for project planning, development guidance, debugging support, documentation assistance, testing guidance, Git/deployment guidance, and final project preparation.

AI output was reviewed and tested during development rather than being blindly accepted.

---

# Raw Log Availability

The assignment asks for raw, unedited AI chat logs or public chat links.

The prompts included above are the raw prompts available from the recorded development history used to create this file. Complete earlier ChatGPT/Amazon Q sessions are not available in the current repository/workspace, so they have not been fabricated.

If complete original chat logs or public chat links are available later, they should be appended to this file in their original form.

```
```
