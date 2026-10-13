# E-Commerce API

A backend REST API for an online store, built with **Node.js**, **Express 5** and **MySQL**.

**What it currently includes**

- User registration, login (token-based sessions), profile update with photo, and logout
- Category management (create, list, view, update, activate/deactivate, delete) with image upload
- A database schema of 41 tables (products, orders, payments, coupons, shipping, etc.) created with Knex migrations, ready for future features

**Tech stack:** Node.js · Express 5 · MySQL (`mysql2`) · Knex (migrations) · bcrypt · multer · dotenv · nodemon

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start (clone and run)](#2-quick-start-clone-and-run)
3. [Create the Project From Scratch (step by step)](#3-create-the-project-from-scratch-step-by-step)
4. [Project Structure](#4-project-structure)
5. [What Each Folder Is For](#5-what-each-folder-is-for)
6. [Available Commands](#6-available-commands)
7. [API Endpoints](#7-api-endpoints)
8. [Upload This Project to GitHub](#8-upload-this-project-to-github)

---

## 1. Prerequisites

Install these first:

| Software | Version | Check with |
|----------|---------|------------|
| Node.js | 18 or newer | `node -v` |
| npm | comes with Node.js | `npm -v` |
| MySQL Server | 8.x recommended | `mysql --version` |
| Git | any recent version | `git --version` |

---

## 2. Quick Start (clone and run)

Use this if you only want to run the project.

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd ecommerce-api

# 2. Install all dependencies
npm install

# 3. Create your environment file
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env
# Open .env and set your MySQL details (see Step 6 in section 3)

# 4. Create the database (run inside MySQL)
#    CREATE DATABASE ecommerce_db;

# 5. Create all tables
npm run migrate

# 6. Start the server
npm run dev
```

Open <http://localhost:3000/api/v1/> — you should see:

```json
{ "success": true, "message": "E-commerce API is running", "data": null }
```

---

## 3. Create the Project From Scratch (step by step)

Follow these steps in order to build the same project yourself.

### Step 1 — Create the project folder and `package.json`

```bash
mkdir ecommerce-api
cd ecommerce-api
npm init -y
```

### Step 2 — Install the packages

```bash
# Production packages
npm install express mysql2 knex bcrypt multer dotenv

# Development package
npm install --save-dev nodemon
```

| Package | Why it is installed |
|---------|---------------------|
| `express` | Web framework: receives requests and sends responses |
| `mysql2` | MySQL driver used for the connection pool and by Knex |
| `knex` | Runs database migrations (creates the tables) |
| `bcrypt` | Hashes and checks passwords |
| `multer` | Handles image uploads |
| `dotenv` | Loads values from the `.env` file |
| `nodemon` *(dev)* | Restarts the server automatically when a file changes |

### Step 3 — Add the scripts to `package.json`

Open `package.json` and set the `"scripts"` section to:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "migrate": "knex --knexfile knexfile.js migrate:latest",
  "migrate:rollback": "knex --knexfile knexfile.js migrate:rollback",
  "migrate:status": "knex --knexfile knexfile.js migrate:list"
}
```

### Step 4 — Create the folders

**macOS / Linux / Git Bash:**

```bash
mkdir -p database/migrations
mkdir -p uploads/categories uploads/profiles
mkdir -p src/config src/constants src/controllers src/middlewares src/repositories src/routes/v1 src/services src/utils src/validations
```

**Windows PowerShell:**

```powershell
New-Item -ItemType Directory -Force -Path database\migrations, uploads\categories, uploads\profiles
New-Item -ItemType Directory -Force -Path src\config, src\constants, src\controllers, src\middlewares, src\repositories, src\routes\v1, src\services, src\utils, src\validations
```

### Step 5 — Create `.gitignore`

Create a file named `.gitignore` in the project root:

```gitignore
node_modules/
.env
uploads/*
!uploads/.gitkeep
*.log
.DS_Store
Thumbs.db
```

Then create empty placeholder files so Git keeps the upload folders:

```bash
touch uploads/.gitkeep          # Windows PowerShell: New-Item uploads\.gitkeep -ItemType File
```

### Step 6 — Create the environment files

Create `.env.example` (safe to commit) and copy it to `.env` (never commit):

```env
PORT=3000
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ecommerce_db
DB_USER=root
DB_PASSWORD=
```

> The variable names must be exactly `DB_NAME` and `DB_USER` because `src/config/env.js` reads those names.

### Step 7 — Create the config files

**`src/config/env.js`** — loads `.env` and exports the settings:

```js
require("dotenv").config();

const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME || "ecommerce_db",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  },
};

module.exports = env;
```

**`src/config/database.js`** — creates the MySQL connection pool:

```js
const mysql = require("mysql2/promise");
const env = require("./env");

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
```

**`knexfile.js`** (project root) — tells Knex how to connect and where migrations are:

```js
const env = require("./src/config/env");

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.name,
    },
    migrations: {
      directory: "./database/migrations",
      tableName: "knex_migrations",
    },
  },
};
```

### Step 8 — Create the database

Run this inside MySQL (Workbench, phpMyAdmin or the `mysql` command line). Knex creates tables, **not** the database itself:

```sql
CREATE DATABASE ecommerce_db;
```

### Step 9 — Create and run migrations

Create a migration file:

```bash
npx knex migrate:make create_users_table --knexfile knexfile.js
```

This creates `database/migrations/<timestamp>_create_users_table.js`. Write the `up` (create table) and `down` (remove table) functions:

```js
exports.up = function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.bigIncrements("id").primary();
    table.string("name", 100).notNullable();
    table.string("email", 150).notNullable().unique();
    table.string("password", 255).notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("users");
};
```

Run it:

```bash
npm run migrate            # create the tables
npm run migrate:status     # see which migrations have run
npm run migrate:rollback   # undo the last batch
```

Repeat `migrate:make` for every table you need (categories, user_sessions, products, ...). The complete set of 41 migrations is in `database/migrations/` of this repository.

### Step 10 — Add the source code

Create each file inside its folder using the structure in [section 4](#4-project-structure). The full working code for every file is in this repository under `src/` and `server.js`.
Build the layers in this order, because each layer depends on the one before it:

1. `src/utils/` — helpers (`asyncHandler`, `response`, `file`, `databaseHealth`)
2. `src/constants/` — shared messages
3. `src/repositories/` — SQL queries
4. `src/services/` — business logic
5. `src/validations/` — request checks
6. `src/middlewares/` — auth, upload, 404, error handler
7. `src/controllers/` — request/response handling
8. `src/routes/v1/` — URL definitions
9. `src/app.js` — assembles the Express app
10. `server.js` — starts the server

### Step 11 — Start the project

```bash
npm run dev        # development (auto-restart)
# or
npm start          # normal start
```

You should see:

```
Database connection is healthy
Server running on port 3000
```

If you see **"Database connection failed"**, check that MySQL is running and that the values in `.env` are correct.

### Step 12 — Test it

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123"}'

# Login (copy the "token" from the response)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Use the token
curl http://localhost:3000/api/v1/auth/me -H "Authorization: Bearer <token>"
```

---

## 4. Project Structure

```
ecommerce-api/
├── .env                      # Your local settings (NOT committed)
├── .env.example              # Template of the settings
├── .gitignore                # Files Git must ignore
├── knexfile.js               # Knex (migration) configuration
├── package.json              # Dependencies and scripts
├── package-lock.json         # Exact dependency versions
├── server.js                 # Entry point: checks DB, starts the server
│
├── database/
│   └── migrations/           # 41 migration files (one per table)
│
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   ├── constants/
│   │   └── messages.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── category.controller.js
│   │   └── index.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── notFound.middleware.js
│   │   └── upload.middleware.js
│   ├── repositories/
│   │   ├── base.repository.js
│   │   ├── category.repository.js
│   │   ├── test.repository.js
│   │   ├── user.repository.js
│   │   └── userSession.repository.js
│   ├── routes/
│   │   └── v1/
│   │       ├── auth.routes.js
│   │       ├── category.routes.js
│   │       └── index.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   └── category.service.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── databaseHealth.js
│   │   ├── file.js
│   │   └── response.js
│   └── validations/
│       ├── auth.validation.js
│       └── category.validation.js
│
└── uploads/                  # Uploaded images (NOT committed)
    ├── categories/
    └── profiles/
```

**How a request travels through the folders:**

```
routes → middlewares / validations → controllers → services → repositories → MySQL
```

---

## 5. What Each Folder Is For

### `src/app.js`
Builds the Express app: body parsing, the public `/uploads` route, the `/api/v1` routes, the 404 handler and the error handler. It is separate from `server.js` so the app can be reused and tested without starting a server.

### `src/config/`
Reads the `.env` file (`env.js`) and creates the MySQL connection pool (`database.js`). It exists so every other file gets settings from one place instead of reading `process.env` everywhere.

### `src/constants/`
Fixed values, such as messages, that are used by several files. Change a message here once and it updates everywhere.

### `src/controllers/`
Take the request, call one service, and send the JSON response. They exist to keep HTTP handling separate from business logic, so controllers contain no SQL and no business rules.

### `src/middlewares/`
Functions that run before the controller: login check (`auth`), image upload (`upload`), 404 handler (`notFound`) and error handler (`error`). They exist so shared behaviour is written once and reused on many routes.

### `src/repositories/`
The only place with SQL queries. Each function runs one query on one table. This way, if a query or table changes, only this folder needs to change.

### `src/routes/v1/`
Connect each URL and HTTP method to its middleware and controller. `v1` is the API version, so a future `v2` can be added without breaking existing users of `v1`.

### `src/services/`
Business logic: duplicate email/slug checks, password hashing, token creation, deleting old images, and turning database errors into friendly errors. Services have no `req`/`res` and no SQL.

### `src/utils/`
Small reusable helpers: `asyncHandler` (catches async errors), `response` (standard success/error JSON), `file` (deletes uploaded images) and `databaseHealth` (checks the DB connection at start-up).

### `src/validations/`
Check the incoming fields (required, length, format) before the controller runs. Invalid input is rejected early with a `422` response.

### `database/migrations/`
Knex files that create the database tables. Each file has an `up` (create) and a `down` (remove) function. Schema changes are kept as code, so everyone can build the same database.

### `uploads/`
Where uploaded images are saved (`categories/`, `profiles/`) and served publicly at `/uploads/...`. It holds runtime data only and is not committed to Git.

---

## 6. Available Commands

| Command | What it does |
|---------|--------------|
| `npm install` | Installs all dependencies |
| `npm start` | Starts the server (`node server.js`) |
| `npm run dev` | Starts the server with auto-restart (`nodemon`) |
| `npm run migrate` | Runs all pending migrations |
| `npm run migrate:rollback` | Undoes the last batch of migrations |
| `npm run migrate:status` | Shows which migrations have run |
| `npx knex migrate:make <name> --knexfile knexfile.js` | Creates a new migration file |

Always run commands from the project root (the folder that contains `package.json`).

---

## 7. API Endpoints

Base URL: `http://localhost:3000/api/v1`. Routes marked **Yes** need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description | Login required |
|--------|----------|-------------|----------------|
| GET | `/` | API status | No |
| POST | `/auth/register` | Create an account | No |
| POST | `/auth/login` | Log in and get a token | No |
| GET | `/auth/me` | Get the logged-in user | Yes |
| PUT | `/auth/me` | Update profile (optional `image` file) | Yes |
| POST | `/auth/logout` | Log out (revoke the current token) | Yes |
| POST | `/categories` | Create a category (optional `image` file) | Yes |
| GET | `/categories` | List all categories | Yes |
| GET | `/categories/:id` | Get one category | Yes |
| PUT | `/categories/:id` | Update a category | Yes |
| PATCH | `/categories/:id/status` | Switch active / inactive | Yes |
| DELETE | `/categories/:id` | Delete a category permanently | Yes |

All responses use this shape:

```json
{ "success": true, "message": "Category fetched successfully", "data": { } }
```

---

## 8. Upload This Project to GitHub

1. Create a new **empty** repository on GitHub (do not add a README there; this project already has one).
2. In your project root, run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Before running `git add .`, check that `.gitignore` is filled in (Step 5) so that `.env`, `node_modules/` and uploaded images are **not** uploaded. Check with `git status`.