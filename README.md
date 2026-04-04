# Finance Dashboard Backend

A backend API for a finance dashboard system built with **Node.js**, **Express**, and **MongoDB**.

The project demonstrates:
- user and role management
- financial record CRUD
- filtering and pagination
- dashboard summary analytics
- backend-enforced access control
- input validation and error handling

## Tech Stack
- Node.js 18+
- Express.js
- MongoDB
- Mongoose
- Joi validation
- helmet, cors, morgan

## Key Features
- Create, update, list, and delete users
- Bootstrap the first admin user when the database is empty
- Role-based access control for `viewer`, `analyst`, and `admin`
- Create, update, list, and delete financial records
- Filter records by type, category, and date range
- Paginated record listing
- Dashboard summary endpoint with totals, category totals, recent transactions, and monthly trends
- Simple mock authentication using the `x-user-id` header
- End-to-end demo script for quick local verification

## Project Structure
```text
src/
  app.js
  server.js
  config/
    db.js
    env.js
  controllers/
    dashboardController.js
    recordController.js
    userController.js
  middleware/
    asyncHandler.js
    errorHandler.js
    mockAuth.js
    notFound.js
    requireRole.js
    validate.js
  models/
    Record.js
    User.js
  routes/
    dashboard.js
    index.js
    records.js
    users.js
  services/
    dashboardService.js
scripts/
  demo.js
```

## Requirements
- Node.js 18 or later
- MongoDB running locally or reachable through a MongoDB URI

## Installation
```bash
npm install
```

## Environment Setup
Create a `.env` file from the example:

```bash
copy .env.example .env
```

### Environment Variables
- `PORT` - server port, default `3000`
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - `development` or `production`
- `LOG_FORMAT` - morgan log format, default `dev`

### Example `.env`
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/finance_dashboard
LOG_FORMAT=dev
```

> In this workspace, `PORT=3001` is used because `3000` may already be occupied.

## Running Locally
### 1) Start MongoDB
If you want to use the bundled MongoDB binary in this repo:

```bash
.\.mongodb\dist\mongodb-win32-x86_64-windows-8.2.6\bin\mongod.exe --dbpath .\.mongodb\data --port 27017 --bind_ip 127.0.0.1
```

If you already have MongoDB installed, you can use that instead.

### 2) Start the API server
Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The API will be available at:
- `http://localhost:3000` by default
- `http://localhost:3001` in this workspace configuration

### 3) Health check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{ "status": "ok" }
```

## Deployment

### Vercel + MongoDB Atlas
This repository already includes Vercel serverless support through `api/index.js` and `vercel.json`.

1. Create a MongoDB Atlas cluster and database user.
2. Copy the Atlas connection string.
3. Import the GitHub repository into Vercel.
4. Set these environment variables in Vercel:
  - `MONGODB_URI` = your Atlas connection string
  - `NODE_ENV` = `production`
  - `LOG_FORMAT` = `combined` or `common`
5. Deploy the project.

After deployment, verify the app with `GET /health`.

## Authentication Model
This project uses a **mock authentication** approach for assessment purposes.

- Send the user id in the `x-user-id` header
- The middleware loads the user from MongoDB and attaches it to `req.user`
- If the header is missing, some routes may still allow bootstrap behavior
- If the user is inactive, the request is rejected with `403`

### Important
This is intentionally simple and is **not production authentication**.
For a production system, replace it with:
- JWT authentication
- sessions
- OAuth or SSO depending on the use case

## Roles and Permissions
### Viewer
- Can read records
- Can view dashboard summary only if the endpoint allows it? In this project, viewer can read records but **cannot access dashboard summary**
- Cannot create, update, or delete users or records

### Analyst
- Can read records
- Can access dashboard summary
- Cannot create, update, or delete users or records

### Admin
- Full access
- Can create and manage users
- Can create, update, delete records
- Can access dashboard summary

## Bootstrap Behavior
When the database has **zero users**:
- `POST /users` creates the first user without requiring `x-user-id`
- The server forces the first user to be:
  - `role = admin`
  - `status = active`

After the first user exists, user management becomes admin-only.

## Data Models
### User
Fields:
- `id`
- `name`
- `email`
- `role` (`viewer`, `analyst`, `admin`)
- `status` (`active`, `inactive`)
- `createdAt`
- `updatedAt`

### Record
Fields:
- `id`
- `amount`
- `type` (`income`, `expense`)
- `category`
- `date`
- `notes`
- `createdBy`
- `createdAt`
- `updatedAt`

## API Reference

## Health
### `GET /health`
Returns service status.

Example:
```bash
curl http://localhost:3001/health
```

Response:
```json
{ "status": "ok" }
```

## Users
### `POST /users`
Creates the first admin when the database is empty; otherwise admin-only.

Request body:
```json
{
  "name": "Admin",
  "email": "admin@example.com",
  "role": "admin",
  "status": "active"
}
```

Notes:
- During bootstrap, `role` and `status` are forced to `admin` and `active`
- After bootstrap, send `x-user-id` with an active admin id

Example:
```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Admin\",\"email\":\"admin@example.com\",\"role\":\"admin\",\"status\":\"active\"}"
```

### `GET /users`
Admin-only list of users.

Example:
```bash
curl http://localhost:3001/users \
  -H "x-user-id: <ADMIN_USER_ID>"
```

### `PUT /users/:id`
Admin-only update of a user.

Allowed fields:
- `name`
- `email`
- `role`
- `status`

### `DELETE /users/:id`
Admin-only deletion of a user.

## Records
### `POST /records`
Admin-only record creation.

Request body:
```json
{
  "amount": 2500,
  "type": "income",
  "category": "Salary",
  "date": "2026-04-01",
  "notes": "April salary"
}
```

Validation:
- `amount` must be a number >= 0
- `type` must be `income` or `expense`
- `category` is required
- `date` must be a valid ISO date
- `notes` is optional

### `GET /records`
Accessible to `viewer`, `analyst`, and `admin`.

Query parameters:
- `type` = `income` or `expense`
- `category` = category name
- `startDate` = ISO date
- `endDate` = ISO date
- `limit` = maximum results, capped at 200
- `skip` = offset

Example:
```bash
curl "http://localhost:3001/records?type=income&category=Salary&startDate=2026-04-01&endDate=2026-04-30&limit=10&skip=0" \
  -H "x-user-id: <ACTIVE_USER_ID>"
```

### `PUT /records/:id`
Admin-only record update.

Allowed fields:
- `amount`
- `type`
- `category`
- `date`
- `notes`

### `DELETE /records/:id`
Admin-only record deletion.

## Dashboard
### `GET /dashboard/summary`
Accessible to `analyst` and `admin`.

Query parameters:
- `startDate` = ISO date
- `endDate` = ISO date
- `recentLimit` = optional number of recent transactions to return

Response includes:
- `totalIncome`
- `totalExpense`
- `netBalance`
- `categoryWiseTotals`
- `recentTransactions`
- `monthlySummary`

Example:
```bash
curl "http://localhost:3001/dashboard/summary?recentLimit=10" \
  -H "x-user-id: <ANALYST_OR_ADMIN_USER_ID>"
```

## Error Handling
The API returns meaningful HTTP status codes:
- `400` - invalid input
- `401` - unauthorized / missing or invalid user header
- `403` - forbidden due to role or inactive status
- `404` - resource not found
- `409` - duplicate email while creating users
- `500` - unexpected server error

Validation is handled using Joi, and the application has centralized error handling middleware.

## Demo Script
A repeatable end-to-end demo is available.

### Run demo
```bash
npm run demo
```

If the database already has users, provide an existing admin id:

```powershell
$env:ADMIN_ID = "<ADMIN_USER_ID>"
npm run demo
```

What the demo does:
- calls `/health`
- creates analyst and viewer users
- creates income and expense records as admin
- verifies viewer cannot create records
- verifies analyst can access dashboard summary
- verifies viewer cannot access dashboard summary

## Testing
A quick smoke test can be done with the demo script.

### Manual test flow
1. Start MongoDB
2. Start the API server
3. Call health endpoint
4. Create first admin
5. Create additional users
6. Create records
7. Read dashboard summary
8. Verify access control behavior

## Common Commands
```bash
npm install
npm run dev
npm start
npm run demo
```

## Submission Notes
This project is intentionally kept simple and logically structured for assessment purposes.

Assumptions:
- mock auth is acceptable for the assignment
- MongoDB is used for persistence
- the first user bootstrap is allowed when the database is empty
- dashboard analytics are computed server-side from stored records

Tradeoffs:
- authentication is header-based for simplicity
- no frontend is included
- no external analytics service is used

## Useful URLs
- Health: `http://localhost:3001/health`
- API base: `http://localhost:3001`
- Demo script: [scripts/demo.js](scripts/demo.js)

## Deployment

### Deploy to Vercel
1. Push your repository to GitHub (already done ✓)
2. Go to [vercel.com](https://vercel.com)
3. Sign in with GitHub
4. Click "New Project"
5. Select this repository: `finance-dashboard-system-backend`
6. Environment variables:
   - `MONGODB_URI`: use MongoDB Atlas free tier or local MongoDB
   - `PORT`: 3000
   - `NODE_ENV`: production
7. Click "Deploy"
8. Vercel will provide a live URL like: `https://finance-dashboard-system-backend.vercel.app`

### Live Demo URL (when deployed)
```
Health: https://finance-dashboard-system-backend.vercel.app/health
API Base: https://finance-dashboard-system-backend.vercel.app
```

### Important for Vercel + MongoDB
- MongoDB Atlas free tier recommended (cloud MongoDB)
- Set `MONGODB_URI` in Vercel project settings
- Your local `.mongodb/` folder won't work on Vercel
