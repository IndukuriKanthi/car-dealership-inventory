# PROMPTS.md

This file contains the raw, unedited prompts sent to Amazon Q during development of this project.
No prompt has been summarized, shortened, paraphrased, or replaced with placeholders.

---

## Prompt 1 — Master Implementation Prompt

# Car Dealership Inventory System — Master Implementation Prompt

You are my senior full-stack software engineer and pair-programming assistant.

I need to build a **production-quality Car Dealership Inventory System** for a technical evaluation. The evaluator will inspect not only whether the application works, but also:

* Code quality
* Variable and function naming
* Project structure
* Architecture
* REST API design
* Database design
* Authentication and authorization
* Validation
* Error handling
* Test quality
* Test-driven development practices
* Git commit history
* Frontend quality
* Responsiveness
* Documentation
* AI usage transparency
* Maintainability
* Security
* Ability to explain implementation decisions during an interview

Therefore, **do not optimize for the shortest implementation**. Optimize for clean, understandable, maintainable engineering.

---

# 1. TECH STACK

Use the following stack unless there is a strong technical reason not to:

## Backend

* Node.js
* TypeScript
* Express.js
* PostgreSQL
* Prisma ORM
* JWT authentication
* bcrypt for password hashing
* Zod for request validation
* Jest for unit/integration testing
* Supertest for API testing

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Fetch API for HTTP requests

## Development tools

* Git
* GitHub
* ESLint
* Prettier
* dotenv
* Docker/Docker Compose for PostgreSQL if useful

Do NOT introduce unnecessary libraries.

Prefer simple solutions that are easy for a developer to understand and explain.

---

# 2. IMPORTANT DEVELOPMENT RULE

This project MUST follow Test-Driven Development.

Use the:

RED → GREEN → REFACTOR

workflow.

Before implementing an important backend feature:

1. Write the test.
2. Run the test and demonstrate that it fails for the expected reason.
3. Implement the minimum code required to make it pass.
4. Run the tests again.
5. Refactor if necessary.
6. Run the complete test suite.
7. Commit the work with a meaningful Git commit message.

Do NOT simply write the entire application first and tests afterward.

The Git history should make the TDD process visible.

---

# 3. PROJECT ARCHITECTURE

Create a clean monorepo structure similar to:

car-dealership-inventory/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── tests/
│   │   ├── unit/
│   │   └── integration/
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
├── screenshots/
├── .gitignore
├── docker-compose.yml
├── README.md
└── PROMPTS.md

You may adjust the structure if there is a genuinely better architectural reason, but keep separation of concerns clear.

---

# 4. BACKEND REQUIREMENTS

Implement a RESTful API.

Base path:

/api

---

# 5. DATABASE DESIGN

Use PostgreSQL with Prisma.

Create at least these entities:

## User

Fields:

* id
* name
* email
* passwordHash
* role
* createdAt
* updatedAt

Roles:

* USER
* ADMIN

Email must be unique.

Passwords must NEVER be stored in plaintext.

Use bcrypt.

---

## Vehicle

Fields:

* id
* make
* model
* category
* price
* quantity
* createdAt
* updatedAt

Requirements:

* id must be unique
* make is required
* model is required
* category is required
* price must be greater than 0
* quantity must never be negative

Use appropriate PostgreSQL types.

Do not store money as floating-point values if a safer representation is available.

---

# 6. AUTHENTICATION

Implement:

POST /api/auth/register

POST /api/auth/login

Registration requirements:

* Validate name
* Validate email
* Validate password
* Prevent duplicate email addresses
* Hash password using bcrypt
* Store user
* Never return passwordHash to client

Login requirements:

* Validate credentials
* Compare password using bcrypt
* Generate JWT
* Return token and safe user information

JWT payload should contain only the necessary information, such as:

* userId
* role

Do not place sensitive information inside the JWT.

Use an environment variable for the JWT secret.

---

# 7. AUTHENTICATION MIDDLEWARE

Create reusable authentication middleware.

Example responsibility:

authenticateUser

It should:

1. Read Authorization header.
2. Expect:

Bearer <token>

3. Validate JWT.
4. Extract user information.
5. Attach authenticated user information to the request.
6. Reject missing or invalid tokens with appropriate HTTP status codes.

Create a separate authorization middleware for admin-only operations.

For example:

requireAdmin

Do NOT duplicate authorization logic inside every controller.

---

# 8. API ENDPOINTS

Implement exactly these core endpoints.

## Authentication

POST /api/auth/register

POST /api/auth/login

---

## Vehicles

POST /api/vehicles

Protected.

Authenticated users can add a vehicle.

---

GET /api/vehicles

Protected.

Return all available vehicles.

---

GET /api/vehicles/search

Protected.

Support searching/filtering by:

* make
* model
* category
* minimum price
* maximum price

These should be query parameters.

Example:

/api/vehicles/search?make=Toyota

/api/vehicles/search?category=SUV

/api/vehicles/search?minPrice=10000&maxPrice=30000

Allow combinations where appropriate.

Do not create separate endpoints for every filter.

---

PUT /api/vehicles/:id

Protected.

Update vehicle details.

Validate:

* make
* model
* category
* price
* quantity

Do not allow quantity to become negative.

---

DELETE /api/vehicles/:id

Protected.

ADMIN ONLY.

Return appropriate status codes when a normal user attempts deletion.

---

POST /api/vehicles/:id/purchase

Protected.

Purchase one unit of a vehicle.

The operation must:

* Verify vehicle exists.
* Verify quantity is greater than zero.
* Decrease quantity by exactly one.
* Return updated vehicle information.

If quantity is already zero:

Return a meaningful error.

Do not allow negative inventory.

Think about concurrency/race conditions. Use an atomic database operation or transaction where appropriate so that two simultaneous purchases cannot result in negative stock.

---

POST /api/vehicles/:id/restock

Protected.

ADMIN ONLY.

Increase inventory.

Request should contain the amount to add.

Example:

{
"quantity": 5
}

Validate that the restock quantity is a positive integer.

---

# 9. HTTP STATUS CODES

Use appropriate REST status codes.

Examples:

201 Created

200 OK

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Unprocessable Entity where appropriate

500 Internal Server Error

Do not return 200 for every situation.

Error responses should have a consistent structure.

For example:

{
"success": false,
"message": "Vehicle not found"
}

Validation errors should provide useful information without exposing internal implementation details.

---

# 10. REQUEST VALIDATION

Use Zod.

Create reusable schemas for:

* registration
* login
* create vehicle
* update vehicle
* purchase
* restock
* search query parameters

Validate input at the API boundary.

Do not rely only on frontend validation.

Backend validation is mandatory.

---

# 11. ERROR HANDLING

Create centralized Express error handling middleware.

Do not scatter large try/catch blocks throughout controllers unnecessarily.

Controllers should remain thin.

Services should contain business logic.

Repositories should handle database access where appropriate.

Use meaningful custom errors if useful.

Never expose:

* database stack traces
* passwords
* JWT secrets
* internal implementation details

to the client.

---

# 12. SOLID AND CLEAN CODE

Follow clean coding principles.

Use:

* meaningful variable names
* meaningful function names
* small functions
* single responsibility
* separation of concerns
* dependency boundaries where useful
* reusable middleware
* reusable validation schemas

Avoid:

* single-letter variables except simple loops
* giant controllers
* duplicated logic
* magic numbers
* deeply nested conditionals
* unnecessary abstractions
* unnecessary comments

Comments should explain WHY something is done, not simply repeat WHAT the code says.

Prefer:

const authenticatedUser

over:

const u

Prefer:

const requestedRestockQuantity

over:

const q

Use consistent naming:

* camelCase for variables/functions
* PascalCase for classes/types/components
* UPPER_SNAKE_CASE only for genuine constants

---

# 13. SERVICE LAYER

Business logic should live in services.

Examples:

authService

vehicleService

inventoryService

Do not put all business logic directly inside route handlers.

For example:

purchaseVehicle()

should contain the inventory rules rather than the route handler containing everything.

---

# 14. REPOSITORY / DATABASE LAYER

Keep Prisma/database operations separated from business logic where practical.

For example:

vehicleRepository.findById()

vehicleRepository.findAll()

vehicleRepository.create()

vehicleRepository.update()

vehicleRepository.delete()

vehicleRepository.decrementStock()

Do not over-engineer the repository pattern. Use it only where it improves separation and testability.

---

# 15. SECURITY

Implement basic security best practices.

At minimum:

* bcrypt password hashing
* JWT authentication
* authorization middleware
* environment variables
* input validation
* CORS configuration
* no passwordHash in responses
* no secrets committed to Git
* proper error handling

Add Helmet if appropriate.

Do not hardcode:

JWT_SECRET

DATABASE_URL

or other secrets.

Provide .env.example files.

---

# 16. BACKEND TESTING

Testing is one of the most important parts of this project.

Use Jest and Supertest.

Write meaningful tests rather than superficial tests.

Test:

## Authentication

* successful registration
* duplicate email registration
* invalid registration input
* successful login
* incorrect password
* nonexistent user
* invalid login input

## Authentication middleware

* missing token
* malformed token
* invalid token
* valid token

## Authorization

* normal user accessing admin endpoint
* admin accessing admin endpoint

## Vehicle creation

* successful creation
* missing required fields
* invalid price
* negative quantity
* unauthorized request

## Vehicle listing

* successful listing
* empty inventory

## Search

* search by make
* search by model
* search by category
* search by minimum price
* search by maximum price
* search by price range
* combinations of filters

## Vehicle update

* successful update
* vehicle not found
* invalid data
* unauthorized request

## Vehicle deletion

* successful admin deletion
* normal user rejected
* vehicle not found

## Purchase

* successful purchase
* quantity decreases correctly
* purchase when quantity is zero
* vehicle not found
* unauthorized request
* ensure quantity never becomes negative

## Restock

* successful admin restock
* normal user rejected
* invalid restock quantity
* vehicle not found

Aim for high meaningful coverage.

Do not artificially increase coverage simply to reach a percentage.

---

# 17. TDD WORKFLOW

Implement backend features incrementally.

Recommended order:

1. Project initialization
2. Database setup
3. User model
4. Registration tests
5. Registration implementation
6. Login tests
7. Login implementation
8. Authentication middleware tests
9. Authentication middleware implementation
10. Vehicle model
11. Vehicle creation tests
12. Vehicle creation implementation
13. Vehicle listing tests
14. Vehicle listing implementation
15. Search tests
16. Search implementation
17. Update tests
18. Update implementation
19. Purchase tests
20. Purchase implementation
21. Restock tests
22. Restock implementation
23. Delete tests
24. Delete implementation
25. Refactoring
26. Full test suite
27. Frontend implementation
28. Frontend testing where useful
29. Documentation

After each meaningful feature, run the relevant tests.

---

# 18. GIT HISTORY

Create meaningful commits.

Do NOT make one giant commit containing the whole application.

Example commit progression:

chore: initialize backend project

chore: configure TypeScript and ESLint

test: add registration validation tests

feat: implement user registration

test: add login authentication tests

feat: implement user login

test: add authentication middleware tests

feat: implement JWT authentication middleware

test: add vehicle creation tests

feat: implement vehicle creation

test: add vehicle search tests

feat: implement vehicle search

test: add inventory purchase tests

feat: implement vehicle purchase

test: add admin restock tests

feat: implement admin vehicle restocking

refactor: simplify vehicle service validation

test: increase inventory API coverage

feat: implement React authentication flow

feat: implement vehicle dashboard

feat: implement vehicle search filters

feat: implement admin inventory management

docs: add project setup and AI usage documentation

Do not create fake TDD history.

Only commit work that was actually completed.

---

# 19. AI CO-AUTHOR REQUIREMENT

I am required to disclose AI usage.

Whenever you help generate, modify, debug, or significantly influence code for a commit, remind me to include an AI co-author trailer.

The commit message format should be similar to:

feat: implement user registration

Used Amazon Q to assist with the initial implementation and test structure, then reviewed and modified the implementation manually.

Co-authored-by: Amazon Q [AI@users.noreply.github.com](mailto:AI@users.noreply.github.com)

Do not invent a real person's identity.

Use the exact AI attribution identity required by the evaluation instructions/platform if one is provided.

Also maintain a root-level:

PROMPTS.md

This file must contain the raw, unedited prompts/chat logs required by the assignment.

Do NOT fabricate conversations.

---

# 20. FRONTEND REQUIREMENTS

Build a modern React SPA using:

* React
* TypeScript
* Tailwind CSS
* React Router

Create a professional dashboard.

Required pages:

/login

/register

/dashboard

/admin

---

# 21. FRONTEND AUTHENTICATION

Implement:

* registration
* login
* logout
* authentication state
* protected routes
* admin-only routes

Store authentication information appropriately.

Do not expose passwords.

Handle expired/invalid tokens gracefully.

If the user is not authenticated, redirect them to login.

If a normal user tries to access an admin page, show an appropriate forbidden state or redirect.

---

# 22. DASHBOARD

Create a visually polished vehicle inventory dashboard.

Each vehicle should be displayed as a card containing:

* make
* model
* category
* price
* quantity available
* purchase button

Purchase button behavior:

* enabled when quantity > 0
* disabled when quantity === 0
* clearly display "Out of Stock" when quantity is zero

After a successful purchase:

* update the displayed inventory
* show a success notification
* do not require a full page reload

Handle API errors gracefully.

---

# 23. SEARCH AND FILTER UI

Provide:

* make search
* model search
* category filter
* minimum price
* maximum price

Provide a clear way to reset filters.

Do not make the interface unnecessarily complicated.

Search/filter state should be understandable.

Show:

* loading state
* empty state
* error state

---

# 24. ADMIN UI

Admin users should have access to:

* Add vehicle
* Edit vehicle
* Delete vehicle
* Restock vehicle

Use forms with proper validation.

Do not rely only on browser validation.

Display useful validation messages.

Delete operations should ask for confirmation before deleting.

Restock should require a positive quantity.

---

# 25. UI/UX QUALITY

The evaluator will inspect the frontend.

Make it:

* modern
* clean
* responsive
* consistent
* accessible
* visually balanced

Use Tailwind thoughtfully.

Do not create excessive gradients, animations, or visual effects.

Prioritize usability over decoration.

Include:

* responsive navigation
* clear typography
* consistent spacing
* buttons with clear states
* loading indicators
* empty states
* error states
* success feedback
* accessible form labels
* keyboard-friendly controls

The application should look like a real product rather than a basic college CRUD project.

---

# 26. FRONTEND CODE QUALITY

Avoid putting all logic into App.tsx.

Create reusable components.

Examples:

VehicleCard

VehicleGrid

SearchFilters

LoginForm

RegisterForm

VehicleForm

RestockForm

ProtectedRoute

AdminRoute

Navbar

LoadingSpinner

ErrorMessage

EmptyState

Use TypeScript interfaces/types for API data.

Do not use `any` unless there is a genuinely unavoidable reason.

Create a centralized API service layer.

For example:

authApi

vehicleApi

Do not scatter fetch calls throughout every component.

---

# 27. API CLIENT

Create a clean API service abstraction.

Handle:

* base URL
* authentication headers
* JSON parsing
* common API errors

Avoid duplicating fetch configuration.

---

# 28. DATABASE SEEDING

Create a Prisma seed script.

Include:

* at least one admin user
* at least one normal user
* several vehicles across different categories
* vehicles with different price ranges
* at least one vehicle with zero inventory

Clearly document the seed credentials in development documentation only.

Never use real passwords.

---

# 29. ENVIRONMENT CONFIGURATION

Create:

backend/.env.example

frontend/.env.example

Example backend variables:

DATABASE_URL

JWT_SECRET

PORT

FRONTEND_URL

Example frontend variable:

VITE_API_BASE_URL

Never commit actual .env files.

Update .gitignore accordingly.

---

# 30. DOCKER

If practical, create docker-compose.yml for PostgreSQL.

The application should be easy to start locally.

Document both:

Option A — Docker PostgreSQL

Option B — locally installed PostgreSQL

Do not make Docker mandatory if it creates unnecessary complexity.

---

# 31. README

Create a comprehensive root README.md.

Include:

# Car Dealership Inventory System

## Project Overview

Explain the problem and solution.

## Features

List major features.

## Tech Stack

Backend, database, frontend, testing, tooling.

## Architecture

Explain the major components.

## Database Design

Explain User and Vehicle.

## API Documentation

Document all endpoints.

For each endpoint include:

* method
* URL
* authentication requirement
* request body/query parameters
* successful response
* possible errors

## Authentication

Explain JWT authentication.

## Authorization

Explain USER vs ADMIN.

## Local Setup

Give exact commands.

## Environment Variables

Document required variables.

## Testing

Explain npm test, coverage, integration tests, unit tests.

## Screenshots

Include screenshots.

## Git Workflow

Briefly explain the TDD commit history.

## My AI Usage

This section is mandatory.

## Trade-offs and Design Decisions

## Future Improvements

---

# 32. PROMPTS.MD

Create PROMPTS.md containing the actual raw AI prompts used during development.

Do not create fake prompts.

Do not summarize the conversations.

Do not rewrite them to make them look better.

The assignment specifically requests raw, unedited AI chat logs or public chat links.

Maintain this file during development.

---

# 33. TEST REPORT

Generate a test report after implementation.

Include total tests, passed tests, failed tests, test suites, coverage percentages if available.

Do not fabricate results.

---

# 34. CODE QUALITY CHECKS

Before considering the project complete, run TypeScript compilation, ESLint, Prettier check, unit tests, integration tests, test coverage, frontend build, backend build.

Fix errors instead of ignoring them.

---

# 35. ERROR HANDLING UX

Frontend should gracefully handle backend unavailable, invalid credentials, expired JWT, unauthorized request, forbidden admin operation, vehicle not found, out-of-stock purchase, validation errors, server errors.

Do not show raw server stack traces.

---

# 36. API DESIGN QUALITY

Keep responses consistent.

Prefer structures such as:

{ "success": true, "data": ... }

and:

{ "success": false, "message": "...", "errors": [...] }

---

# 37. CONCURRENCY / INVENTORY SAFETY

The purchase operation must be safe against concurrent requests.

Prefer an atomic database update such as:

UPDATE vehicle SET quantity = quantity - 1 WHERE id = ? AND quantity > 0

Then verify that a row was actually updated.

---

# 38. TEST DATA

Tests should create their required test data and clean up after themselves.

Tests should be deterministic.

---

# 39. FRONTEND TESTING

Backend testing is the priority, but add reasonable frontend tests if practical.

---

# 40. DEVELOPMENT PROCESS

PHASE 1: Analyze requirements and propose architecture.
PHASE 2: Initialize project structure.
PHASE 3: Configure backend.
PHASE 4: Configure database.
PHASE 5: Implement authentication using TDD.
PHASE 6: Implement vehicle CRUD using TDD.
PHASE 7: Implement search.
PHASE 8: Implement purchase/restock inventory logic using TDD.
PHASE 9: Complete backend tests.
PHASE 10: Build frontend.
PHASE 11: Integrate frontend with backend.
PHASE 12: Polish UI/UX.
PHASE 13: Run complete quality checks.
PHASE 14: Write documentation.
PHASE 15: Prepare final test report and screenshots.

---

# 41. IMPORTANT — DO NOT HIDE PROBLEMS

If you encounter dependency conflicts, database errors, TypeScript errors, failing tests, architecture problems, security concerns, or ambiguous requirements, do not silently work around them.

---

# 42. IMPORTANT — CODE MUST BE EXPLAINABLE

The final implementation should be understandable by a junior/intermediate developer.

---

# 43. FINAL REVIEW CHECKLIST

[Full checklist as provided in the original prompt]

---

# 44. MOST IMPORTANT INSTRUCTION

Do not treat this as a simple CRUD assignment.

Treat it as a real software engineering project that will be reviewed by experienced developers.

---

# STARTING INSTRUCTION

First, inspect the current workspace and repository.

Do NOT start implementing everything immediately.

First provide the proposed architecture, then wait for approval before beginning Phase 1.

---

## Prompt 2 — Architecture Corrections

The architecture is approved overall, but before you begin Phase 1, make these corrections:

1. GET /api/vehicles must return ALL vehicles, including vehicles with quantity = 0. The frontend must display zero-stock vehicles as "Out of Stock" and disable the Purchase button. Do not hide zero-stock vehicles.

2. For Vehicle.quantity, enforce quantity >= 0 at the application/business-logic level AND at the PostgreSQL database level where supported. Do not describe a service-layer validation as a database-level constraint. Use a proper PostgreSQL CHECK constraint through a Prisma migration and explain the implementation.

3. For JWT storage, avoid unnecessary refresh-token complexity. If localStorage is used, explicitly document the security trade-off in the README and keep the implementation secure and interview-explainable.

4. Strengthen the TDD process. For every significant feature, actually write the test first, run it before implementation, show the expected failing result, implement the minimum code, run it again and show the passing result, refactor if appropriate, and rerun the relevant suite. Never fabricate RED/GREEN results.

5. Make the TDD Git history granular. Do not combine unrelated features into one test/feature pair. Prefer separate cycles such as:
   test: add vehicle listing tests
   feat: implement vehicle listing

   test: add vehicle search tests
   feat: implement vehicle search

   test: add vehicle update tests
   feat: implement vehicle update

   test: add vehicle delete tests
   feat: implement vehicle delete

   test: add purchase tests
   feat: implement vehicle purchase

   test: add restock tests
   feat: implement vehicle restock

6. Do not create or claim any Git commit until the corresponding work has actually been completed and verified.

After incorporating these changes, show me the updated architecture/TDD plan and then wait for my approval. Do not create project files yet.

---

## Prompt 3 — PostgreSQL User Security

One small change before approval:

Do not create the PostgreSQL application user as a SUPERUSER.

Create a dedicated database user with only the privileges required for the car_dealership and car_dealership_test databases.

Do not hardcode or expose a real password in commands, source files, README, or Git history.

Use a placeholder during setup and store the actual DATABASE_URL only in the local .env file.

Please update the PostgreSQL setup instructions accordingly.

---

## Prompt 4

install it now

---

## Prompt 5

begin Phase 1

---

## Prompt 6

Stop before proceeding further.

I noticed two issues that must be corrected before continuing:

1. PROMPTS.md currently contains summaries/placeholders such as "[Full master implementation prompt...]" and "..." rather than the actual raw prompts. This does not satisfy the assignment requirement for raw, unedited AI prompts/chat logs.

Replace the contents of PROMPTS.md with the exact, complete, verbatim prompts that I actually sent during this development session. Do not summarize, shorten, paraphrase, or replace any portion with "..." or placeholders.

At minimum, include the complete master implementation prompt and the complete subsequent correction/approval prompts exactly as they were sent.

2. The Git identity currently uses "kanthi@example.com". Do not use a fake email for commits. Before the first commit, configure Git with my actual GitHub-associated email or GitHub noreply email. Do not invent an email address.

Do not proceed to the next Phase 1 step until these two issues are corrected and verified.

Do not make any commit yet.

---

## Prompt 7

You took too long to respond - try to split up the work into smaller steps.

---

## Prompt 8

Use my GitHub-associated noreply email for Git.

For PROMPTS.md: YES, include the complete master implementation prompt verbatim, exactly as I originally sent it, along with every subsequent correction/approval prompt from this development session.

Do not summarize, shorten, paraphrase, or replace any part with "..." or placeholders.

PROMPTS.md must contain the actual raw prompts exactly as they were sent to Amazon Q.

Do not make any Git commit yet. First finish these corrections and show me the verification.

---

## Prompt 9

150179859+IndukuriKanthi@users.noreply.github.com

---

*This file is updated as new prompts are submitted during development.*
