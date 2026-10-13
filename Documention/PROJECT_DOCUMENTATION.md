# ecommerce-api — Complete Technical Documentation

> **Who this is for:** a new developer joining the project, and an existing developer who needs to modify or extend it.
> **Language:** plain English. Every statement below comes from reading the actual code, migrations, and lock file in the uploaded `ecommerce-api.zip`.

---

## Scope and Method (read this first)

- **What was analysed:** every file in the zip except the *contents* of `node_modules/` (generated code). For `node_modules/`, the `package-lock.json` and `node_modules/.package-lock.json` files were used to confirm exact installed versions.
- **Section numbering** follows the numbering of your documentation master prompt (sections 2–29), so you can cross-check easily. Section 1 of the prompt ("Important Rules") was applied as instructions and is not repeated.
- **The master prompt was cut off at "29. DOCKER".** No Docker files exist in this project, so section 29 documents that fact. If you meant to add more sections after 29, send them and I will extend this document.
- **Sections that do not apply** (frontend, hooks, state management, styling, TypeScript types) are kept in the document, with a short statement that the project does not have them. This is deliberate, so nobody has to wonder whether they were skipped.
- **Nothing was deleted or changed** in the project. Anything that looks unnecessary is only *documented*.
- **Secrets:** the `.env` file was inspected by key names only. It contains local-development defaults and an **empty** database password, so nothing needed to be redacted. See section 11.

---

## Key Things to Know Before You Touch the Code

These are the findings most likely to save you time or prevent a bug. Each one is explained in detail later.

| # | Finding | Where explained |
|---|---------|-----------------|
| 1 | **Only two features are coded:** Authentication (register/login/profile/logout) and Categories (CRUD). The database has **41 tables** prepared for a full store (products, orders, payments, coupons…), but **no API code uses them yet.** | §15, §18 |
| 2 | **Env variable name mismatch.** `.env` / `.env.example` define `DB_DATABASE` and `DB_USERNAME`, but `src/config/env.js` reads `DB_NAME` and `DB_USER`. The app currently works only because the code's fallback defaults (`ecommerce_db`, `root`) happen to equal the example values. | §11 |
| 3 | **`.gitignore` is empty (0 bytes).** As it stands, `node_modules/`, `.env`, and `uploads/` (including a real 1.2 MB profile photo) would all be committed. | §28 |
| 4 | **Roles/permissions are not enforced.** Tables `roles`, `permissions`, etc. exist, but no code checks them. Any logged-in user can create, edit, and **permanently delete** categories. | §19 |
| 5 | **Two installed packages have no usage:** `pg` (PostgreSQL driver) is never referenced; `crypto` (npm) is a deprecated placeholder that is never actually loaded because Node's built-in `crypto` wins. | §8 |
| 6 | **No tests, no linter, no formatter, no Docker, no CI, no README** exist in the project. | §26–§29 |
| 7 | **The server must be started from the project root folder.** Upload and static-file paths use `process.cwd()`. | §10, §23 |
| 8 | **If a `multipart` request fails validation, the uploaded image stays on disk** (multer runs before the validators). | §30 |

---

## 2. Project Overview

### 2.1 What this project is

`ecommerce-api` is a **backend-only REST API** for an e-commerce (online store) system. It is written in **JavaScript (CommonJS) on Node.js**, uses **Express 5** as the web framework and **MySQL** as the database.

### 2.2 What problem it solves

It gives a store's frontend (website or mobile app) a server to talk to for:

- Creating customer accounts and logging in with secure, revocable session tokens.
- Managing a customer's own profile (including a profile photo).
- Managing product **categories** (with an image each).

The **database design** goes much further (products, variants, carts, orders, payments, shipping, coupons, reviews, inventory, notifications). That schema is a foundation for features that have not been built in code yet.

### 2.3 Type of application

| Item | Value |
|------|-------|
| Application type | Backend REST/JSON API (no UI) |
| Number of applications | **1** (single service; not a monorepo) |
| API style | REST, JSON responses, versioned under `/api/v1` |

### 2.4 Main technologies

| Area | Technology | Evidence |
|------|-----------|----------|
| Frontend | **None** in this project | No HTML/CSS/React files exist |
| Backend | Node.js + **Express 5.2.1** | `package.json`, `src/app.js` |
| Language / module system | JavaScript, **CommonJS** (`require`) | `"type": "commonjs"` in `package.json` |
| Database | **MySQL** | `knexfile.js` client `mysql2`; `src/config/database.js` |
| DB access at runtime | **`mysql2/promise` connection pool + hand-written SQL** (repository pattern) | `src/repositories/*` |
| DB migrations | **Knex 3.3.0** (used **only** for migrations) | `knexfile.js`, `database/migrations/` |
| Authentication | Custom **opaque bearer token + database session** (not JWT) | `auth.service.js`, `auth.middleware.js` |
| Password hashing | **bcrypt** (cost 12) | `auth.service.js` |
| File uploads | **multer 2.4.0** (disk storage) | `upload.middleware.js` |
| Config | **dotenv** (`.env` file) | `src/config/env.js` |
| External APIs / services | **None** (no payment, email, SMS, cloud-storage integrations found) | code search |
| Build tools | **None** (plain Node, no compile step) | no bundler/transpiler config |
| Package manager | **npm** | `package-lock.json` |
| Testing tools | **None** | no test files or config |
| Deployment / build system | **None** in the project (no Dockerfile, CI, or Procfile) | file listing |

### 2.5 Simple architecture overview

```
   Client (web / mobile / Postman)
              │  HTTP + JSON  (or multipart/form-data for image uploads)
              ▼
  ┌──────────────────────────────────────────────┐
  │  Express app  (src/app.js)                   │
  │   ├─ express.json / urlencoded  (body parse) │
  │   ├─ /uploads  → static image files          │
  │   ├─ /api/v1   → routes ──┐                  │
  │   ├─ 404 handler          │                  │
  │   └─ error handler        │                  │
  └───────────────────────────┼──────────────────┘
                              ▼
   Route  →  Auth / Upload / Validation middleware
                              ▼
                        Controller      (HTTP in/out, formats response)
                              ▼
                         Service        (business rules, errors, file cleanup)
                              ▼
                       Repository       (SQL queries only)
                              ▼
              mysql2 connection pool  (max 10 connections)
                              ▼
                        MySQL database   (schema built by Knex migrations)
```

---

## 3. Complete Project Folder Structure

```
ecommerce-api/
├── .env                          # Local environment values (in the zip; see §11)
├── .env.example                  # Template of environment variables
├── .gitignore                    # EMPTY file (0 bytes)
├── knexfile.js                   # Knex (migration tool) configuration
├── package.json                  # Project manifest, dependencies, scripts
├── package-lock.json             # Exact dependency versions (npm, lockfileVersion 3)
├── server.js                     # Entry point: checks DB, starts HTTP server
│
├── database/
│   └── migrations/               # 41 Knex migration files (one per table)
│       ├── 20260911110802_create_users_table.js
│       ├── 20260911111224_create_categories_table.js
│       ├── 20260911111726_create_products_table.js
│       ├── 20260911112235_create_product_images_table.js
│       ├── 20260911112350_create_product_variants_table.js
│       ├── 20260911112459_create_addresses_table.js
│       ├── 20260911112551_create_carts_table.js
│       ├── 20260911112629_create_cart_items_table.js
│       ├── 20260911112715_create_orders_table.js
│       ├── 20260911112752_create_order_items_table.js
│       ├── 20260911112823_create_order_addresses_table.js
│       ├── 20260911112854_create_payments_table.js
│       ├── 20260911112930_create_product_reviews_table.js
│       ├── 20260911112957_create_wishlists_table.js
│       ├── 20260911113025_create_product_category_mappings_table.js
│       ├── 20260911113126_create_coupons_table.js
│       ├── 20260911113245_create_coupon_usages_table.js
│       ├── 20260911113325_create_product_attributes_table.js
│       ├── 20260911113349_create_product_tags_table.js
│       ├── 20260911113414_create_tags_table.js
│       ├── 20260911113446_create_inventory_transactions_table.js
│       ├── 20260911113523_create_stock_alerts_table.js
│       ├── 20260911113608_create_user_sessions_table.js
│       ├── 20260911113642_create_user_otps_table.js
│       ├── 20260911113708_create_password_reset_tokens_table.js
│       ├── 20260911113820_create_shipping_methods_table.js
│       ├── 20260911114053_create_shipping_zones_table.js
│       ├── 20260911114111_create_shipping_zone_locations_table.js
│       ├── 20260911114131_create_shipping_zone_methods_table.js
│       ├── 20260911114147_create_order_shipping_table.js
│       ├── 20260911114207_create_coupon_products_table.js
│       ├── 20260911114222_create_coupon_categories_table.js
│       ├── 20260911114247_create_roles_table.js
│       ├── 20260911114316_create_user_role_mappings_table.js
│       ├── 20260911114336_create_permissions_table.js
│       ├── 20260911114351_create_role_permissions_table.js
│       ├── 20260911114415_create_collections_table.js
│       ├── 20260911114434_create_product_collection_mappings_table.js
│       ├── 20260911114457_create_notifications_table.js
│       ├── 20260911114514_create_product_questions_table.js
│       └── 20260911114540_create_order_status_histories_table.js
│
├── src/
│   ├── app.js                    # Builds the Express app (middleware + routes)
│   ├── config/
│   │   ├── database.js           # mysql2 connection pool
│   │   └── env.js                # Loads .env and exports a config object
│   ├── constants/
│   │   └── messages.js           # Shared message strings
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
│   │   ├── test.repository.js    # not imported anywhere (see §5)
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
├── uploads/                      # Runtime user-uploaded images (served publicly)
│   ├── categories/               # (empty in the zip)
│   └── profiles/
│       └── profile-1789812911980-….jpg   # one sample upload, 1.2 MB, 4016×4016 px
│
└── node_modules/                 # GENERATED — installed packages (see below)
```

### 3.1 Generated / non-source folders

| Folder | Generated? | Should a developer edit it? | Notes |
|--------|-----------|-----------------------------|-------|
| `node_modules/` | **Yes** — created by `npm install` | **Never.** | Contains 152 packages in total (per lock file), including nested copies. It also holds Windows launcher files (`.cmd`, `.ps1` in `.bin/`), which shows it was installed on Windows. `bcrypt` ships pre-built native binaries for several platforms, but always run a fresh `npm install` on each machine instead of copying this folder. |
| `uploads/` | **Yes, at runtime** — filled by users uploading images | Not by hand, normally. | It is *data*, not source code. Do not commit it. The two sub-folders are also auto-created at start-up if missing (`upload.middleware.js`). |

Folders that are **not present** (checked): `dist/`, `build/`, `.next/`, `.cache/`, `coverage/`, `.git/` (not included in the zip), `tests/`, `public/`, `docs/`, `scripts/`, `seeds/`, `logs/`.

---

## 4. Root-Level Folder and File Documentation

### 4.1 `server.js` — the entry point

| Question | Answer |
|----------|--------|
| **Purpose** | The file Node runs. It checks the database first, then starts the HTTP server. |
| **Why it exists** | Keeps "starting the process" separate from "building the app" (`src/app.js`). This makes the app easier to test or reuse later. |
| **What is stored here** | Only start-up logic. |
| **What should NOT be stored here** | Routes, business logic, SQL, middleware. |
| **When to modify** | To change start-up behaviour (e.g. add graceful shutdown, log more info). |

```js
const database = await checkDatabaseConnection();
if (!database.connected) { console.error(...); process.exit(1); }
app.listen(env.port, () => console.log(`Server running on port ${env.port}`));
```

The server **refuses to start (exit code 1) if MySQL cannot be reached.**

### 4.2 `package.json`

| Question | Answer |
|----------|--------|
| **Purpose** | Project manifest: name, scripts, dependency list. |
| **Should be modified when** | Adding/removing a package or a script. Prefer `npm install <pkg>` / `npm uninstall <pkg>` so `package-lock.json` stays in sync. |
| **Notable details** | `"main": "index.js"` points to a file that **does not exist** (the real entry is `server.js`). This is harmless for an application (nobody `require`s this project as a library), but it is misleading. `description` and `keywords` are empty. No `engines` field, so no Node version is declared. |

### 4.3 `package-lock.json`

Auto-generated by npm (lockfile version 3). Records the **exact** version of all 152 installed packages. **Never edit by hand.** Commit it. Its presence is how we know the package manager is npm (§7).

### 4.4 `knexfile.js`

Configuration for the **Knex CLI** (used for migrations). Full explanation in §12.

### 4.5 `.env` and `.env.example`

| | `.env.example` | `.env` |
|---|----------------|--------|
| **Purpose** | Template listing every variable a developer must set. | The real local values Node actually reads. |
| **Commit to Git?** | **Yes** (safe template). | **No** — but `.gitignore` is empty, so nothing prevents it today (§28). |
| **Contents** | 8 keys (see §11). In this zip both files contain the same 8 keys and the same size (147 bytes). | Same keys. |

**Should NOT be stored here:** real production passwords in `.env.example`.

### 4.6 `.gitignore`

An **empty file** (0 bytes). It currently ignores nothing. See §28 for a suggested content.

### 4.7 `database/`

| Question | Answer |
|----------|--------|
| **Purpose** | Holds everything about the database *structure*. Currently only `migrations/`. |
| **Why it exists** | Database schema changes are code. Keeping them in their own top-level folder (outside `src/`) means they are run by the Knex CLI, not by the running application. |
| **What is stored here** | Knex migration files named `<timestamp>_create_<table>_table.js`, each with an `up` (create) and `down` (drop) function. |
| **What should NOT be stored here** | Application code, SQL queries used by the API (those live in `src/repositories/`). |
| **When to modify** | To add a new table or column: **create a new migration** (see §31). |
| **Not present** | `seeds/` (no seed data or seed command exists). |

Example (`20260911111224_create_categories_table.js`, simplified):

```js
exports.up = function (knex) {
  return knex.schema.createTable("categories", function (table) {
    table.bigIncrements("id").primary();
    table.string("slug", 120).notNullable().unique();
    table.enum("status", ["active", "inactive"]).notNullable().defaultTo("active");
    table.timestamps(true, true);
  });
};
exports.down = function (knex) { return knex.schema.dropTableIfExists("categories"); };
```

### 4.8 `uploads/`

| Question | Answer |
|----------|--------|
| **Purpose** | Storage for images that users upload. Served publicly at `http://<host>/uploads/...`. |
| **Why it exists** | multer saves files to local disk here; `app.use("/uploads", express.static("uploads"))` exposes them. |
| **What is stored here** | `categories/` (category images), `profiles/` (user profile photos). Files are named `category-<timestamp>-<32 hex chars>.<ext>` or `profile-...`. |
| **What should NOT be stored here** | Source code, private/secret files (**everything in this folder is publicly downloadable**), files that need access control. |
| **When to modify** | Almost never by hand. To support a new upload type, add a new sub-folder + storage in `upload.middleware.js`. |
| **Important** | The database stores **only the file name** (e.g. `profile-1789…jpg`). The full URL is built at response time from the request's protocol and host. |

### 4.9 `node_modules/`

Generated by `npm install`. See §3.1.

### 4.10 `src/`

All application source code. Fully documented in §5.

---

## 5. Complete `src/` Documentation

`src/` has **9 folders** (plus the nested `routes/v1/`) and one loose file, `app.js`.
They form a **layered architecture**. A request travels *down* the layers; a response travels back *up*:

```
routes  →  middlewares/validations  →  controllers  →  services  →  repositories  →  config/database  →  MySQL
```

**Rule of the architecture:** each layer only talks to the layer directly below it. Controllers never write SQL; repositories never build HTTP responses.

### 5.0 `src/app.js` (the loose file)

| | |
|---|---|
| **Purpose** | Creates and configures the Express app, and exports it (does **not** listen on a port). |
| **Order of setup** | 1) `express.json()` 2) `express.urlencoded({extended:true})` 3) static `/uploads` 4) `/api/v1` routes 5) 404 handler 6) error handler. **Order matters:** the error handler must stay last. |
| **Imports** | `express`, `routes/v1/index.routes`, `notFound.middleware`, `error.middleware`. |
| **Imported by** | `server.js`. |
| **Modify when** | Adding app-wide middleware (CORS, security headers, logging, rate limit) or mounting a new API version (e.g. `/api/v2`). |

---

### 5.1 `src/config/`

| | |
|---|---|
| **Purpose** | Reads configuration and creates shared infrastructure objects (the DB pool). |
| **Why separate** | Every other layer needs settings; centralising them avoids reading `process.env` all over the code. |
| **What belongs here** | Environment loading, DB pool, third-party client setup (e.g. future Redis/payment client). |
| **What does NOT belong** | Business logic, queries, route definitions. |
| **How it is used** | `env.js` is imported by `server.js`, `knexfile.js`, and `database.js`. `database.js` is imported by `base.repository.js` and `databaseHealth.js`. |
| **Dependencies** | `dotenv`, `mysql2/promise`. |
| **Used by** | Server start-up, all repositories, Knex CLI. |
| **Files** | `env.js`, `database.js` |
| **Adding new functionality** | New setting → add a field in `env.js` (and to `.env.example`). New external client → new file in this folder. |

Example from `env.js`:
```js
db: { host: process.env.DB_HOST || "localhost", port: Number(process.env.DB_PORT) || 3306,
      name: process.env.DB_NAME || "ecommerce_db", user: process.env.DB_USER || "root", ... }
```

### 5.2 `src/constants/`

| | |
|---|---|
| **Purpose** | Fixed strings/values that are shared across files. |
| **Why separate** | Change a message in one place, not in five. |
| **What belongs here** | Message text, status names, role names, limits. |
| **What does NOT belong** | Anything that changes at runtime or needs env values (→ `config/`). |
| **Dependencies / Used by** | Has no imports. Used by `index.controller.js`, `error.middleware.js`, `notFound.middleware.js`. |
| **Files** | `messages.js` (currently only a `SERVER` group: `RUNNING`, `INTERNAL_ERROR`, `ROUTE_NOT_FOUND`) |
| **Adding new functionality** | Add a group to the existing object in `messages.js`, or new file (e.g. `status.js`). **Note:** most messages in services/validators are still written inline as string literals — only three are centralised. |

### 5.3 `src/controllers/`

| | |
|---|---|
| **Purpose** | The HTTP "adapter". Reads `req` (body, params, file), calls **one service**, and sends the JSON response. |
| **Why separate** | Keeps HTTP details away from business rules, so services stay reusable and testable. |
| **What belongs here** | Extracting request data, calling the service, formatting output (e.g. turning a stored image file name into a full URL), choosing the HTTP status code. |
| **What does NOT belong** | SQL, password hashing, business decisions, file deletion. |
| **Dependencies** | `services/`, `utils/asyncHandler`, `utils/response`, `constants/messages`. |
| **Used by** | `routes/v1/*.routes.js`. |
| **Files** | `auth.controller.js` (register, login, me, updateProfile, logout), `category.controller.js` (create, list, get, update, status, delete), `index.controller.js` (home/health message). |
| **Adding new functionality** | New resource → new `<name>.controller.js`. New action on an existing resource → add a function to that controller and export it. Wrap every handler in `asyncHandler(...)`. |

Example (`index.controller.js`):
```js
const home = asyncHandler(async (req, res) =>
  successResponse(res, null, messages.SERVER.RUNNING));
```

### 5.4 `src/middlewares/`

| | |
|---|---|
| **Purpose** | Functions that run *between* the request arriving and the controller. |
| **Why separate** | Cross-cutting concerns (login check, file upload, errors) are reused by many routes. |
| **What belongs here** | Authentication, upload handling, 404 and error handlers. |
| **What does NOT belong** | Input-field validation for a specific endpoint (→ `validations/`), business logic (→ `services/`). |
| **Dependencies** | `repositories/` (auth), `constants`, `utils/response`, `multer`, `crypto`, `fs`, `path`. |
| **Used by** | `app.js` (404 + error), route files (auth + upload). |
| **Files** | `auth.middleware.js`, `upload.middleware.js`, `notFound.middleware.js`, `error.middleware.js` |
| **Adding new functionality** | New shared behaviour → new file here. **Role/permission checking would live here** (e.g. `role.middleware.js`) — it does not exist yet. |

### 5.5 `src/repositories/`

| | |
|---|---|
| **Purpose** | The **only** place that contains SQL. Each function runs one query and returns rows/ids/booleans. |
| **Why separate** | If the database or a query changes, only this layer changes. |
| **What belongs here** | `SELECT/INSERT/UPDATE/DELETE` with `?` placeholders (prepared statements). |
| **What does NOT belong** | Business rules (e.g. "email must be unique" is decided in the service, which *asks* the repository), HTTP objects. |
| **Dependencies** | `base.repository.js` → `config/database.js`. |
| **Used by** | Services, and `auth.middleware.js` (which reads sessions/users directly). |
| **Files** | `base.repository.js` (`executeQuery`), `user.repository.js`, `userSession.repository.js`, `category.repository.js`, `test.repository.js` |
| **Adding new functionality** | New table → new `<entity>.repository.js` using `executeQuery`. New query on an existing table → add a function there. |

Example:
```js
const findBySlug = async (slug) => {
  const result = await executeQuery(`SELECT ... FROM categories WHERE slug = ? LIMIT 1`, [slug]);
  return result[0] || null;
};
```

> **`test.repository.js` — appears unnecessary.** It exports `testDatabase()` which runs `SELECT 1`. **No file imports it.** The real start-up DB check lives in `utils/databaseHealth.js`. It looks like an early experiment. It was not removed.

### 5.6 `src/routes/` and `src/routes/v1/`

| | |
|---|---|
| **Purpose** | Maps **URL + HTTP method** to the chain of middleware and the controller. |
| **Why `v1/`** | API versioning. A future breaking change can go in `routes/v2/` without breaking existing clients. |
| **What belongs here** | `router.get/post/put/patch/delete(path, ...middlewares, controller)`. |
| **What does NOT belong** | Logic of any kind. |
| **Dependencies** | controllers, validations, middlewares. |
| **Used by** | `app.js` (mounts `index.routes.js` at `/api/v1`). |
| **Files** | `index.routes.js` (mounts everything), `auth.routes.js`, `category.routes.js` |
| **Adding new functionality** | New resource → new `<name>.routes.js`, then mount it in `index.routes.js` with `router.use("/<name>", ...)`. |

### 5.7 `src/services/`

| | |
|---|---|
| **Purpose** | **Business logic.** Decides what is allowed, combines several repository calls, throws errors with status codes. |
| **Why separate** | Rules like "duplicate email → 409", "delete old image after successful update" must not depend on HTTP. |
| **What belongs here** | Normalising input (trim/lowercase), duplicate checks, password hashing, token creation, file clean-up, translating DB errors to friendly errors. |
| **What does NOT belong** | `req`/`res` objects, raw SQL. |
| **Dependencies** | repositories, `utils/file`, `bcrypt`, `crypto`. |
| **Used by** | controllers. |
| **Files** | `auth.service.js`, `category.service.js` |
| **How errors are raised** | `const error = new Error("..."); error.statusCode = 409; throw error;` — the error middleware turns this into JSON. |
| **Adding new functionality** | New resource → new `<name>.service.js`. |

### 5.8 `src/utils/`

| | |
|---|---|
| **Purpose** | Small generic helpers that are not tied to one feature. |
| **What belongs here** | Pure helpers: response formatters, async wrapper, file deletion, health check. |
| **What does NOT belong** | Feature-specific business rules. |
| **Dependencies** | `config/database` (only `databaseHealth.js`), `fs`, `path`. |
| **Used by** | controllers, services, `server.js`. |
| **Files** | `asyncHandler.js`, `response.js`, `file.js`, `databaseHealth.js` |
| **Adding new functionality** | New helper used by ≥2 places → new file here. Details in §23. |

### 5.9 `src/validations/`

| | |
|---|---|
| **Purpose** | Express middleware that checks the **shape and format** of incoming fields *before* the controller runs. |
| **Why separate** | Rejects bad input early with a consistent `422` response. |
| **What belongs here** | Required/length/format checks; blocking fields that must not be sent. |
| **What does NOT belong** | Checks that need the database (e.g. "email already used") — those are in services. |
| **Dependencies** | None (hand-written; **no** validation library such as Joi/Zod is installed). |
| **Used by** | `auth.routes.js`, `category.routes.js`. |
| **Files** | `auth.validation.js` (`validateRegister`, `validateLogin`, `validateUpdateProfile`), `category.validation.js` (`validateCreateCategory`, `validateUpdateCategory`) |
| **Adding new functionality** | New resource → new `<name>.validation.js`. Follow the pattern: collect `errors = {}`; if any, `res.status(422).json({success:false, message, errors})`, else `next()`. |

---

## 6. Important Files, One by One

Legend — **Reusable?**: could this file be used unchanged by other features. **Normally modified?**: how often a developer edits it in day-to-day work.

### 6.1 Entry, app and config files

| File | Purpose / responsibility | Key exports | Imports (local) | Imported by | Reusable? | Normally modified? |
|------|--------------------------|-------------|-----------------|-------------|-----------|--------------------|
| `server.js` | Check DB, then `app.listen`. | (none — runs on load) | `src/app`, `src/config/env`, `src/utils/databaseHealth` | — (entry) | No | Rarely |
| `src/app.js` | Build Express app. | `app` | `routes/v1/index.routes`, `notFound.middleware`, `error.middleware` | `server.js` | No | When adding global middleware |
| `src/config/env.js` | Load `.env`, export settings. | `env` object: `port`, `nodeEnv`, `db.{host,port,name,user,password}` | — (package: `dotenv`) | `server.js`, `knexfile.js`, `config/database.js` | Yes | When adding a new setting |
| `src/config/database.js` | Create MySQL pool (`connectionLimit: 10`, `waitForConnections: true`, `queueLimit: 0`). | `pool` | `config/env` (package: `mysql2/promise`) | `base.repository.js`, `databaseHealth.js` | Yes | Rarely (pool tuning, SSL) |
| `knexfile.js` | Knex CLI config. | config object with `development` | `src/config/env` | Knex CLI only | — | Rarely |
| `src/constants/messages.js` | Shared strings. | `messages.SERVER.*` | — | `index.controller`, `error.middleware`, `notFound.middleware` | Yes | When adding shared messages |

### 6.2 Routes

| File | Responsibility | Imports (local) | Imported by |
|------|----------------|-----------------|-------------|
| `routes/v1/index.routes.js` | Mounts: `GET /` → home, `/auth` → auth routes, `/categories` → category routes. | `index.controller`, `auth.routes`, `category.routes` | `src/app.js` |
| `routes/v1/auth.routes.js` | Five auth endpoints (§17). | `auth.controller`, `auth.validation`, `auth.middleware`, `upload.middleware` | `index.routes.js` |
| `routes/v1/category.routes.js` | Six category endpoints; calls `router.use(authMiddleware)` first, so **every** category route requires login. | `category.controller`, `category.validation`, `upload.middleware`, `auth.middleware` | `index.routes.js` |

### 6.3 Controllers

| File | Functions | What it does beyond calling a service |
|------|-----------|---------------------------------------|
| `auth.controller.js` | `register`, `login`, `me`, `updateProfile`, `logout` | Contains two private helpers: `getProfileImageUrl(req, filename)` and `formatUser(req, user)` which replace `profile_image` (a file name) with a full URL like `http://host/uploads/profiles/<file>`. Passes `req.ip` and `User-Agent` to login. |
| `category.controller.js` | `createCategory`, `getCategories`, `getCategoryById`, `updateCategory`, `updateCategoryStatus`, `deleteCategory` | Private helpers `getImageUrl` / `formatCategory` do the same URL conversion for `image`. |
| `index.controller.js` | `home` | Returns `{success:true, message:"E-commerce API is running", data:null}`. Acts as a simple "is the API up" endpoint. |

All three import `services/*` (or `constants/messages`), `utils/asyncHandler`, `utils/response`; all are imported only by their matching route file.

### 6.4 Middlewares (core files — more detail)

**`auth.middleware.js`** — protects a route. Steps, in order:

1. Read the `Authorization` header. Missing → `401 "Authorization token is required"`.
2. Must look like `Bearer <token>`. Otherwise → `401 "Invalid authorization format"`.
3. Compute SHA-256 of the token; look for an **active, non-revoked, non-expired** row in `user_sessions` with that hash. None → `401 "Invalid or expired session"`.
4. Load the user by `session.user_id`. Not found → `401 "User not found"`.
5. If `user.status !== "active"` → `403 "User account is inactive"`.
6. Update the session's `last_activity_at`.
7. Attach `req.user` and `req.session`, then `next()`.

- Imports: `crypto` (Node built-in), `userSession.repository`, `user.repository`.
- Imported by: `auth.routes.js`, `category.routes.js`.
- Reusable: **yes** — add it to any route that needs a logged-in user.
- Note: it builds its own JSON error responses instead of throwing to the error handler, so its `401/403` bodies have no `errors` key.

**`upload.middleware.js`** — configures multer.

- On load it **creates** `uploads/categories` and `uploads/profiles` if missing.
- Exports `categoryUpload` and `profileUpload` (use as `.single("image")`).
- Accepts only `image/jpeg, image/png, image/webp, image/gif` **and** extensions `.jpg .jpeg .png .webp .gif`; max **5 MB**; a rejected type raises an error with `statusCode = 422`.
- File name = `<prefix>-<Date.now()>-<16 random bytes as hex><ext>`.
- Note: the type check trusts the client's declared MIME type and file extension; it does not inspect the file's real content.

**`error.middleware.js`** — final error handler `(err, req, res, next)`. Logs `console.error(err)`, uses `err.statusCode || 500`, and responds with `{success:false, message: err.message, errors:null}`. Note: for a `500`, the raw `err.message` is sent to the client.

**`notFound.middleware.js`** — responds `404 {success:false, message:"Route not found: <METHOD> <url>"}`.

### 6.5 Services (core files — more detail)

**`auth.service.js`**

| Function | What it does |
|----------|--------------|
| `register({name,email,password,phone})` | Trims name, lower-cases email; rejects duplicate email (**409**); hashes password with `bcrypt.hash(password, 12)`; inserts user (status `active`); returns the user **without** password. |
| `login({email,password,deviceName,deviceType,ipAddress,userAgent})` | Finds user by email; wrong email/password → **401** (same message for both, so attackers cannot tell which was wrong); inactive user → **403**; creates a random 32-byte token; stores only its **SHA-256 hash** in `user_sessions` with 7-day expiry; returns `{token, expiresAt, user}` (password removed). |
| `updateProfile(userId, fields)` | Merges only the supplied fields over the existing user; checks the new email is not used by someone else (**409**); updates DB; **deletes the newly uploaded image if anything fails**; deletes the **old** image after success. |
| `logout(sessionId)` | Marks the session revoked. Fails with **400** if nothing was updated. |

Imports: `bcrypt`, `crypto`, `path`, `user.repository`, `userSession.repository`, `utils/file`. Imported by: `auth.controller.js`.

**`category.service.js`**

| Function | What it does |
|----------|--------------|
| `createCategory` | Trims name, lower-cases slug; duplicate slug → **409**; inserts (status forced to `active`); returns the new row. |
| `getCategories` | Returns all categories (no filter, no paging). |
| `getCategoryById(id)` | Not found → **404**. |
| `updateCategory(id, fields)` | 404 if missing; slug must stay unique (**409**); merges fields; deletes the replaced image file after a successful update. |
| `updateCategoryStatus(id)` | **Toggles** `active` ⇄ `inactive`. |
| `deleteCategory(id)` | Hard delete. MySQL "row is referenced" errors (`ER_ROW_IS_REFERENCED`, `ER_ROW_IS_REFERENCED_2`) become **409** "Category cannot be deleted because it is being used by other records". Deletes the image file only after the DB delete succeeds. |

Imports: `path`, `category.repository`, `utils/file`. Imported by: `category.controller.js`.

### 6.6 Repositories

| File | Functions | Table(s) |
|------|-----------|----------|
| `base.repository.js` | `executeQuery(sql, params)` → runs `pool.execute` (prepared statement) and returns the rows/result object | — |
| `user.repository.js` | `findByEmail` (includes `password` hash — needed for login), `findByEmailExceptUser`, `createUser`, `findById` (**excludes** password), `updateProfile` | `users` |
| `userSession.repository.js` | `createSession`, `findActiveSessionByTokenHash`, `updateLastActivity`, `revokeSession` | `user_sessions` |
| `category.repository.js` | `createCategory`, `findAll`, `findById`, `findBySlug`, `updateCategory`, `updateStatus`, `deleteCategory` | `categories` |
| `test.repository.js` | `testDatabase` (`SELECT 1`) — **unused** | — |

### 6.7 Validations and utils

| File | Exports | Notes |
|------|---------|-------|
| `validations/auth.validation.js` | `validateRegister`, `validateLogin`, `validateUpdateProfile` | See rules in §17. `validateUpdateProfile` also **rejects any field outside** `name, email, phone, address, gender`. |
| `validations/category.validation.js` | `validateCreateCategory`, `validateUpdateCategory` | Slug must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Update rejects a `status` field (must use the status endpoint). |
| `utils/asyncHandler.js` | `asyncHandler(fn)` | Wraps an async controller so rejected promises go to `next(err)`. |
| `utils/response.js` | `successResponse(res, data, message, statusCode)`, `errorResponse(res, message, statusCode, errors)` | Defines the standard JSON shape (§13/§17). |
| `utils/file.js` | `deleteFile(relativePath)` | Deletes `<cwd>/uploads/<relativePath>` if it exists. Used with paths like `profiles/<file>` and `categories/<file>`. |
| `utils/databaseHealth.js` | `checkDatabaseConnection()` | Runs `SELECT 1`; returns `{connected, message, error?}`. Used only by `server.js`. |

### 6.8 Migrations

41 files in `database/migrations/`. Each exports `up` (create table) and `down` (drop table). They are pure schema — no application file imports them; only the Knex CLI runs them. Full table documentation is in §18.

---

## 7. Package Manager

| Item | Answer |
|------|--------|
| **Package manager** | **npm** |
| **How this was determined** | `package-lock.json` exists (lockfileVersion 3, produced by npm 7+) and `node_modules/.package-lock.json` (npm's hidden lock file) exists. There is **no** `yarn.lock`, `pnpm-lock.yaml`, `bun.lock`, or `bun.lockb`. |
| **Node.js version declared?** | **No.** There is no `engines` field, `.nvmrc`, `.node-version`, Dockerfile, or CI file. |
| **Minimum Node.js that will work (derived)** | **Node 18 or newer.** The lock file shows `express@5.2.1` and `bcrypt@6.0.0` both require `node >= 18`. |
| **Probable developer version (inference, not a fact)** | Node 22.x — the installed `@types/node` is 22.20.2. |
| **Recommendation** | Use a current LTS release (Node 22 is what the tooling suggests). Consider adding `"engines": {"node": ">=18"}` or an `.nvmrc`. |

---

## 8. All Installed Packages / Dependencies

The lock file lists **152 packages** in total: **8 direct production dependencies**, **1 direct dev dependency**, and the rest are their own (transitive) dependencies. The full transitive list is in Appendix A.

### 8.1 Production dependencies (`dependencies`)

| Package | Version | Purpose (simple English) | Where / how it is used | Directly imported? |
|---------|---------|--------------------------|------------------------|--------------------|
| `express` | 5.2.1 | The web framework: receives HTTP requests, routes them, sends responses. | `src/app.js` (app, `express.json`, `express.urlencoded`, `express.static`), `routes/v1/*.js` (`express.Router`). | **Yes** |
| `mysql2` | 3.24.4 | MySQL driver. The `/promise` API is used for the runtime connection pool. Knex also uses it as its MySQL client. | `src/config/database.js` (`require("mysql2/promise")`); `knexfile.js` (`client: "mysql2"`). | **Yes** |
| `knex` | 3.3.0 | Query builder + **migration runner**. In this project it is used **only** for migrations (the API itself does not use Knex queries). | Run through the `migrate*` scripts; configured in `knexfile.js`; migration files call `knex.schema.createTable(...)`. | **Not** imported in `src/` — invoked by the CLI (`node_modules/.bin/knex`) |
| `bcrypt` | 6.0.0 | Hashes and compares passwords. A native (C++) add-on with pre-built binaries. | `src/services/auth.service.js` (`bcrypt.hash(password, 12)`, `bcrypt.compare`). | **Yes** |
| `multer` | 2.4.0 | Handles `multipart/form-data` file uploads (saves images to disk). | `src/middlewares/upload.middleware.js`. | **Yes** |
| `dotenv` | 17.4.2 | Loads variables from `.env` into `process.env`. | `src/config/env.js` (`require("dotenv").config()`). | **Yes** |
| `pg` | 8.23.0 | PostgreSQL driver. | **This package is installed but no direct usage was found during analysis.** The database configured everywhere is MySQL (`knexfile.js` uses `mysql2`). Possibly installed while the DB choice was open. Not removed. | **No** |
| `crypto` | 1.0.1 | An old npm placeholder. Its own lock-file entry says: *"This package is no longer supported. It's now a built-in Node module."* | **This package is installed but has no effect.** The code does `require("crypto")` (in `auth.middleware.js`, `upload.middleware.js`, `auth.service.js`) and Node always resolves that name to its **built-in** module first, so the npm package is never loaded. It appears unnecessary; it was not removed. | Name is required, but resolves to Node's built-in |

### 8.2 Development dependencies (`devDependencies`)

| Package | Version | Purpose | Where / how it is used | Directly imported? |
|---------|---------|---------|------------------------|--------------------|
| `nodemon` | 3.1.14 | Restarts the server automatically when a file changes. | `npm run dev` → `nodemon server.js`. | No (CLI only) |

### 8.3 Packages present but not listed in `package.json`

| Package | Version | Why it is there |
|---------|---------|-----------------|
| `@types/node` | 22.20.2 | Installed **automatically** because `mysql2` declares it as a *peer dependency* (`>= 8`). npm 7+ installs peer dependencies. It is TypeScript typing only; this project has no TypeScript, so it has no effect at runtime. |

### 8.4 What the direct packages pull in (highlights)

| Direct package | Notable packages it brings |
|----------------|---------------------------|
| `express` | `body-parser` (JSON/URL-encoded parsing), `router`, `send` + `serve-static` (the `/uploads` static files), `qs`, `cookie`, `debug`, `http-errors`, `mime-types`, `path-to-regexp` |
| `multer` | `busboy` (multipart parser), `append-field`, `type-is` |
| `knex` | `commander` (CLI), `lodash`, `tarn` (connection pool), `colorette`, `getopts`, `resolve-from`, `rechoir`, `interpret`, `tildify`, `esm`, `pg-connection-string` |
| `mysql2` | `aws-ssl-profiles`, `iconv-lite`, `long`, `lru.min`, `named-placeholders`, `sql-escaper`, `generate-function` |
| `bcrypt` | `node-addon-api`, `node-gyp-build` |
| `nodemon` (dev) | `chokidar`, `minimatch`, `semver`, `touch`, `undefsafe`, `pstree.remy`, `simple-update-notifier`, `ignore-by-default`, `supports-color` |
| `pg` | `pg-pool`, `pg-protocol`, `pg-types`, `pgpass`, `pg-cloudflare`, `split2`, `xtend`, `postgres-*` |

---

## 9. Package Commands

`package.json` defines **5 scripts**. There is **no** `test`, `build`, `lint`, or `seed` script. (`npm test` would fail with "missing script".)

| Command | Runs | Purpose | When to use | Expected result | Controlled by |
|---------|------|---------|-------------|-----------------|---------------|
| `npm start` | `node server.js` | Start the API normally. | Production-style run. | Console prints `Database connection is healthy` then `Server running on port 3000` (port from `.env`). If MySQL is unreachable it prints the error and exits with code 1. | `server.js`, `.env` |
| `npm run dev` | `nodemon server.js` | Start with auto-restart on file save. | Everyday development. | Same output as above; restarts on changes. | `nodemon` (defaults — **no** `nodemon.json` exists) |
| `npm run migrate` | `knex --knexfile knexfile.js migrate:latest` | Apply every migration that has not been applied yet. | First-time setup; after pulling new migration files. | Knex prints `Batch 1 run: 41 migrations` on a fresh DB. Creates the `knex_migrations` bookkeeping tables too. | `knexfile.js`, `database/migrations/` |
| `npm run migrate:rollback` | `knex --knexfile knexfile.js migrate:rollback` | Undo the **last batch** of migrations (runs each `down`). | When a just-run migration was wrong. **Destroys data in the dropped tables.** | Prints `Batch N rolled back`. | same |
| `npm run migrate:status` | `knex --knexfile knexfile.js migrate:list` | Show which migrations are applied / pending. | Before/after migrating. | Lists completed and pending migration file names. | same |

**Related commands that are directly supported by the installed tooling but are not scripts** (use with `npx`):

```bash
npx knex migrate:make add_something_to_products --knexfile knexfile.js   # create a new migration file
```

Notes:
- Run every command from the **project root** (the folder containing `package.json`); `knexfile.js` uses the relative path `./database/migrations`, and uploads use `process.cwd()`.
- No script creates the database itself — see §10.

---

## 10. Installation Guide

### 10.1 Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | **18 or newer** (derived from `express@5` / `bcrypt@6`); the project was probably developed on Node 22 | Not pinned anywhere in the project. |
| **npm** | Comes with Node (lock file is version 3 → npm 7+) | The only supported package manager here. |
| **MySQL server** | Not specified in the project | Any current MySQL (8.x recommended) or compatible server reachable from your machine. The schema uses standard column types (`enum`, `decimal`, `text`, `timestamp`) and foreign keys. **I could not verify against a specific MySQL version.** |
| A MySQL client | any | To create the database (mysql CLI, MySQL Workbench, etc.). |
| C++ build tools / Python | **Usually not needed** | `bcrypt` ships pre-built binaries for Windows, macOS, and Linux (x64/arm64, glibc/musl). They are only needed if your platform has no pre-built binary. |
| Docker, Java, Python apps | **Not required** | Not used by this project. |

### 10.2 Step-by-step setup

```bash
# 1. Go to the project root (the folder that contains package.json)
cd ecommerce-api

# 2. Install dependencies (npm ci = exact versions from package-lock.json;
#    npm install also works)
npm ci

# 3. Create your local environment file
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
#    then edit .env — see section 11 (IMPORTANT: variable-name mismatch)

# 4. Create the empty database (see 10.4)
#    mysql -u root -p -e "CREATE DATABASE ecommerce_db;"

# 5. Create all tables
npm run migrate

# 6. Start the API in development mode
npm run dev
```

**Do not copy `node_modules/` from another computer.** The copy in the zip was installed on Windows; always run `npm ci`/`npm install` on your own machine.

### 10.3 Environment setup

See §11 for every variable. Minimum: MySQL host, port, user, password, database name.

### 10.4 Database setup

| Topic | What to do |
|-------|-----------|
| **Requirement** | A running MySQL server and an **existing, empty database**. Knex creates tables, not the database. |
| **Create the database** | `CREATE DATABASE ecommerce_db;` (the name the code defaults to). Character set/collation are not specified by the project; MySQL defaults apply. |
| **Local configuration** | Set values in `.env`. Default example: host `127.0.0.1`, port `3306`, user `root`, **empty password**. |
| **Migrations** | `npm run migrate` (applies all 41). Check with `npm run migrate:status`. |
| **Seed data** | **None.** There is no `seeds/` folder and no seed script. The database starts empty, so you must register a user through the API before you can log in. |
| **Reset** | There is no reset script. Options: (a) `npx knex migrate:rollback --all --knexfile knexfile.js` then `npm run migrate`; or (b) drop and re-create the database, then `npm run migrate`. Both **delete all data**. |
| **Adding a new migration** | `npx knex migrate:make <name> --knexfile knexfile.js`, edit the generated file, then `npm run migrate`. |
| **Careful** | The users migration file has a **newer modified date** (2026‑09‑19) than the other 40 (2026‑09‑11), which suggests it was edited after it was first created. If your database was migrated **before** that edit, the `users` table may be missing `address`, `gender`, or `profile_image`, and the profile endpoints will fail with "Unknown column". Migrations that have already run are **not** re-run by Knex; in that case, re-create the database (or roll back and re-run). |

### 10.5 Running the project

```bash
npm run dev        # development, auto-restart (nodemon)
# or
npm start          # plain node
```

Verify it works:

```bash
curl http://localhost:3000/api/v1/
# → {"success":true,"message":"E-commerce API is running","data":null}
```

Try the auth flow:

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123","phone":"9999999999"}'

# Login (copy the "token" from the response)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123","device_name":"my laptop","device_type":"web"}'

# Use the token
curl http://localhost:3000/api/v1/auth/me -H "Authorization: Bearer <token>"
```

Start-up failure "Database connection failed" means MySQL is not reachable or the credentials/database name are wrong (see §11).

### 10.6 Build

**There is no build step.** The code runs directly as written (plain JavaScript, no TypeScript/bundler).

### 10.7 Production run

- Command: `npm start` (runs `node server.js`).
- The project contains **no** process manager config (PM2), Dockerfile, or CI/CD, so how you deploy is up to you.
- Persist the `uploads/` folder (it is local disk storage — a container or server rebuild would lose uploaded images unless it is a mounted volume).
- **Migrations and `NODE_ENV`:** `knexfile.js` only defines a `development` block. If you run migrations with `NODE_ENV=production` set in the shell, Knex will not find a matching configuration block. Either add a `production` block to `knexfile.js`, or run migrations without setting that variable.
- Not present, and worth planning for before public exposure: HTTPS termination, CORS configuration, security headers, rate limiting (no package for any of these is installed).

---

## 11. Environment Variables

**Files found:** `.env` and `.env.example` (same 8 keys, same size). **Not found:** `.env.local`, `.env.development`, `.env.production`, or any deployment config.

`.env` was inspected **by key name only**. It contains local-development values; `DB_PASSWORD` is empty. No real secret was found, so there is nothing to redact — but see §28 about keeping it out of Git.

### 11.1 Variables the **code reads** (`src/config/env.js`)

| Variable | Required? | Purpose | Example / format | Default if missing | Used where |
|----------|-----------|---------|------------------|--------------------|-----------|
| `PORT` | No | HTTP port | `3000` | `3000` | `env.port` → `server.js` |
| `NODE_ENV` | No | Environment name | `development` | `"development"` | `env.nodeEnv` — **read but not used anywhere else in the code**. (Separately, the Knex CLI itself looks at `NODE_ENV` — see §10.7.) |
| `DB_HOST` | No | MySQL host | `127.0.0.1` | `"localhost"` | `config/database.js`, `knexfile.js` |
| `DB_PORT` | No | MySQL port | `3306` | `3306` | same |
| `DB_NAME` | No\* | Database name | `ecommerce_db` | `"ecommerce_db"` | same |
| `DB_USER` | No\* | MySQL user | `root` | `"root"` | same |
| `DB_PASSWORD` | Yes in practice | MySQL password | *(empty in the local file)* — `[SECRET - DO NOT DOCUMENT VALUE]` when set to a real password | `""` | same |

\* Not required only because the defaults match. **Not defined in `.env` / `.env.example`.**

### 11.2 Variables that are **defined in `.env` but never read**

| Variable | Value in file | Problem |
|----------|---------------|---------|
| `DB_DATABASE` | `ecommerce_db` | **Ignored.** The code reads `DB_NAME`, not `DB_DATABASE`. |
| `DB_USERNAME` | `root` | **Ignored.** The code reads `DB_USER`, not `DB_USERNAME`. |
| `DB_CONNECTION` | `mysql` | **Ignored.** No code reads it (the client is hard-coded to `mysql2`). |

> ### ⚠ The mismatch, in plain words
> If you change `DB_DATABASE=my_shop` or `DB_USERNAME=shop_user` in `.env`, **nothing happens** — the app still connects to `ecommerce_db` as `root`. Today this goes unnoticed only because the fallback defaults equal the example values.
> **Fix (either one):** add `DB_NAME=` and `DB_USER=` to `.env` / `.env.example`, **or** change `env.js` to read `DB_DATABASE` / `DB_USERNAME`. The project was not modified; this is a recommendation only.

---

## 12. Configuration Files

**Present:** `package.json`, `package-lock.json`, `knexfile.js`, `.env`, `.env.example`, `.gitignore` (empty).
**Not present** (checked): `tsconfig.json`, `vite/webpack/next/babel` configs, ESLint, Prettier, Tailwind, PostCSS, Jest/Vitest/Playwright configs, `nodemon.json`, `Dockerfile`, `docker-compose.yml`, CI/CD folders (`.github/`, `.gitlab-ci.yml`, etc.), `.nvmrc`, `.editorconfig`.

### 12.1 `knexfile.js`

| Question | Answer |
|----------|--------|
| **What it controls** | How the Knex **CLI** connects to the database and where migrations live. The running API does **not** use this file — it uses `src/config/database.js`. |
| **Why it exists** | The `migrate*` npm scripts pass `--knexfile knexfile.js`. |
| **Important settings** | Only a `development` block: `client: "mysql2"`; `connection` built from `src/config/env.js` (host, port, user, password, database); `migrations.directory: "./database/migrations"`; `migrations.tableName: "knex_migrations"`. |
| **When to modify** | Adding `staging`/`production` blocks; changing DB credentials source. |
| **Impact of changing** | Changing `directory` makes Knex stop seeing existing migration files. Changing `tableName` makes Knex think **nothing has been migrated**, so the next `migrate` tries to create tables that already exist and fails. |

### 12.2 `package.json` / `package-lock.json`

| File | Controls | Change with care because |
|------|----------|--------------------------|
| `package.json` | Scripts, dependency ranges (`^` = allow compatible minor/patch updates), module type `commonjs`. | Changing `"type"` to `"module"` would break every `require(...)` in the project. |
| `package-lock.json` | Exact versions used by `npm ci`. | Hand edits can corrupt installs. Let npm manage it. |

### 12.3 `.env` / `.env.example` / `.gitignore`

Covered in §4 and §11 / §28.

---

## 13. Technology Stack

Only technologies actually found are listed.

### Frontend
*None. This repository is API-only.*

### Backend

| Category | Technology |
|----------|-----------|
| Runtime | Node.js (≥ 18) |
| Framework | Express 5.2.1 |
| API architecture | REST, JSON, URL-versioned (`/api/v1`), layered (route → controller → service → repository) |
| Authentication | Opaque random bearer token; SHA-256 hash stored in MySQL `user_sessions`; passwords via bcrypt 6.0.0 |
| Database | MySQL (via `mysql2` 3.24.4) |
| ORM | **None** — hand-written parameterised SQL in repositories |
| Migrations | Knex 3.3.0 |
| Validation | Hand-written middleware (no Joi/Zod/express-validator) |
| File uploads | multer 2.4.0 (local disk) |
| Config | dotenv 17.4.2 |

### Development

| Category | Technology |
|----------|-----------|
| Language | JavaScript (CommonJS). No TypeScript. |
| Auto-reload | nodemon 3.1.14 |
| Linter / formatter | **None** |
| Testing | **None** |
| Build tool | **None** |
| Package manager | npm |

### Infrastructure

| Category | Technology |
|----------|-----------|
| Docker | **None** |
| CI/CD | **None** |
| Cloud / hosting | **None configured** |
| File storage | Local disk (`uploads/`) |

---

## 14. Architecture

### 14.1 The flow

```
Client (browser / mobile app / Postman)
   ↓  HTTP request
Express app                      src/app.js
   ↓  body parsing (JSON, urlencoded)
Route                            src/routes/v1/*.routes.js
   ↓
Middleware chain (per route)     auth.middleware → upload.middleware (multer) → validation
   ↓
Controller                       src/controllers/*.controller.js   (wrapped in asyncHandler)
   ↓
Service                          src/services/*.service.js         (business rules)
   ↓
Repository                       src/repositories/*.repository.js  (SQL)
   ↓
mysql2 pool                      src/config/database.js
   ↓
MySQL database
   ↑  rows
   ↑  … each layer returns data upward …
Controller formats JSON          utils/response.js → { success, message, data }
```

### 14.2 Worked example — `PUT /api/v1/auth/me` (update profile with a photo)

1. `app.js` parses the request; the path matches `/api/v1` → `index.routes.js` → `/auth` → `auth.routes.js`.
2. `authMiddleware` checks the Bearer token and sets `req.user` and `req.session`.
3. `profileUpload.single("image")` (multer) saves the image to `uploads/profiles/` and fills `req.file` and `req.body`.
4. `validateUpdateProfile` checks the text fields. (If this fails, a `422` is returned — and the image already saved stays on disk; see §30.)
5. `authController.updateProfile` calls `authService.updateProfile(req.user.id, {...})`.
6. The service loads the user, checks duplicate email, updates through `userRepository.updateProfile`, deletes the old image file, and returns the fresh user.
7. The controller turns `profile_image` into a full URL (`formatUser`) and sends `successResponse(...)`.

### 14.3 Answers to the standard questions

| Question | Answer in this project |
|----------|-----------------------|
| **How does data enter?** | JSON body, form-urlencoded body, `multipart/form-data` (multer), URL params (`:id`), the `Authorization` header, `User-Agent` and `req.ip` (stored with the login session). |
| **Where is state stored?** | **Nowhere in memory.** The server is stateless between requests: sessions live in MySQL (`user_sessions`), files on disk (`uploads/`). |
| **How are API calls made?** | This service makes **no outgoing API calls** (no email, payment, SMS, or storage integrations). |
| **How are responses handled?** | Every controller returns via `successResponse`, producing `{ "success": true, "message": "...", "data": ... }`. |
| **Where are errors handled?** | Four places: (1) validation middleware → `422`; (2) auth middleware → `401/403`; (3) services throw `Error` with `statusCode`, caught by `asyncHandler` → `error.middleware` → JSON (`500` if no statusCode); (4) `notFound.middleware` → `404`. |
| **How does authentication work?** | See §19. |
| **How does routing work?** | See §16. |
| **How are reusable components organised?** | Not applicable (no frontend). Reusable *backend* parts: `asyncHandler`, `response.js`, `file.js`, `auth.middleware`, `base.repository`. |

### 14.4 Standard JSON shapes

```jsonc
// success
{ "success": true, "message": "Category fetched successfully", "data": { ... } }

// validation failure (422)
{ "success": false, "message": "Validation failed", "errors": { "slug": "Category slug is required" } }

// thrown service error / unexpected error (errorResponse)
{ "success": false, "message": "Category not found", "errors": null }

// auth middleware & 404 handler (no "errors" key)
{ "success": false, "message": "Invalid or expired session" }
```

---

## 15. Feature Structure

Two features are implemented, plus a status endpoint. Everything else exists only as database tables.

### 15.1 Authentication & Profile

| Aspect | Detail |
|--------|--------|
| **Code lives in** | `routes/v1/auth.routes.js`, `controllers/auth.controller.js`, `services/auth.service.js`, `repositories/user.repository.js`, `repositories/userSession.repository.js`, `validations/auth.validation.js`, `middlewares/auth.middleware.js`, `middlewares/upload.middleware.js` (profile upload) |
| **Routes** | `/api/v1/auth/register`, `/login`, `/me` (GET, PUT), `/logout` |
| **Tables** | `users`, `user_sessions` |
| **Validation** | Hand-written in `auth.validation.js` |
| **Important dependencies** | `bcrypt`, `multer`, Node `crypto` |
| **Tests** | None |

```
Client
  ↓
POST /api/v1/auth/login            (auth.routes.js)
  ↓  validateLogin
authController.login
  ↓
authService.login
  ↓  bcrypt.compare + crypto random token
userRepository.findByEmail  →  userSessionRepository.createSession
  ↓
MySQL: users, user_sessions
```

### 15.2 Categories

| Aspect | Detail |
|--------|--------|
| **Code lives in** | `routes/v1/category.routes.js`, `controllers/category.controller.js`, `services/category.service.js`, `repositories/category.repository.js`, `validations/category.validation.js`, `middlewares/upload.middleware.js` (category upload) |
| **Routes** | `/api/v1/categories` (6 endpoints) — **all require login** |
| **Tables** | `categories` |
| **Important dependencies** | `multer` |
| **Tests** | None |

```
Client → PUT /api/v1/categories/5
  ↓  authMiddleware → categoryUpload.single("image") → validateUpdateCategory
categoryController.updateCategory
  ↓
categoryService.updateCategory
  ↓
categoryRepository.findById / findBySlug / updateCategory
  ↓
MySQL: categories
```

### 15.3 API status (`GET /api/v1/`)

`index.routes.js` → `index.controller.js` (`home`). No service, no database call. Returns "E-commerce API is running".

### 15.4 Designed in the database, **not yet built** in code

Products (with images, variants, attributes, tags, collections, reviews, questions), wishlists, addresses, carts, orders (items, addresses, shipping, status history), payments, shipping (methods, zones, locations), coupons (with product/category restrictions and usage), inventory (transactions and stock alerts), notifications, roles/permissions, OTPs, password-reset tokens. See §18.

---

## 16. Routing

Base URL: `http://<host>:<PORT>` (default `http://localhost:3000`).

### 16.1 Route table

| Route | Method | Purpose | Handler | Middleware chain | Auth required |
|-------|--------|---------|---------|------------------|---------------|
| `/api/v1/` | GET | API is running | `index.controller.home` | — | No |
| `/api/v1/auth/register` | POST | Create account | `auth.controller.register` | `validateRegister` | No |
| `/api/v1/auth/login` | POST | Log in, get token | `auth.controller.login` | `validateLogin` | No |
| `/api/v1/auth/me` | GET | Current user | `auth.controller.me` | `authMiddleware` | **Yes** |
| `/api/v1/auth/me` | PUT | Update profile (+ photo) | `auth.controller.updateProfile` | `authMiddleware`, `profileUpload.single("image")`, `validateUpdateProfile` | **Yes** |
| `/api/v1/auth/logout` | POST | Revoke current session | `auth.controller.logout` | `authMiddleware` | **Yes** |
| `/api/v1/categories` | POST | Create category | `category.controller.createCategory` | `authMiddleware`, `categoryUpload.single("image")`, `validateCreateCategory` | **Yes** |
| `/api/v1/categories` | GET | List categories | `category.controller.getCategories` | `authMiddleware` | **Yes** |
| `/api/v1/categories/:id` | GET | One category | `category.controller.getCategoryById` | `authMiddleware` | **Yes** |
| `/api/v1/categories/:id` | PUT | Update category | `category.controller.updateCategory` | `authMiddleware`, `categoryUpload.single("image")`, `validateUpdateCategory` | **Yes** |
| `/api/v1/categories/:id/status` | PATCH | Toggle active/inactive | `category.controller.updateCategoryStatus` | `authMiddleware` | **Yes** |
| `/api/v1/categories/:id` | DELETE | Permanently delete | `category.controller.deleteCategory` | `authMiddleware` | **Yes** |
| `/uploads/*` | GET | Static image files | `express.static("uploads")` | — | **No** (public) |
| *anything else* | any | 404 JSON | `notFound.middleware` | — | No |

### 16.2 Notes

- **Dynamic parameter:** `:id` (category id). It is not validated as a number; a non-numeric id simply finds nothing and returns `404`.
- **Nested routes:** only via mounting — `index.routes.js` mounts `/auth` and `/categories` under `/api/v1`.
- **Route guard:** `authMiddleware` (per route in `auth.routes.js`; applied to the **whole** category router with `router.use(authMiddleware)`).
- **Role checks:** none (see §19).
- **Middleware order matters:** multer runs **before** the validators on upload routes.

---

## 17. API Documentation

All examples use base URL `http://localhost:3000`. Authenticated requests need the header `Authorization: Bearer <token>`.

### 17.1 Common error responses

| Status | When | Body |
|--------|------|------|
| 401 | Missing/invalid/expired token; wrong login | `{success:false, message}` |
| 403 | Account status is `inactive` | `{success:false, message:"User account is inactive"}` |
| 404 | Unknown route or resource | `{success:false, message}` |
| 409 | Duplicate email/slug, or category still in use | `{success:false, message, errors:null}` |
| 422 | Validation failed → `errors:{field:message}`. A disallowed image type also returns 422, but with `errors:null` | `{success:false, message, errors}` |
| 500 | Unexpected error | `{success:false, message:<error text>, errors:null}` |

### 17.2 `GET /api/v1/`
Health/status. Auth: none. Response `200`:
```json
{ "success": true, "message": "E-commerce API is running", "data": null }
```

### 17.3 `POST /api/v1/auth/register`
Auth: none. Content-Type: `application/json` (or urlencoded).

| Field | Required | Rules |
|-------|----------|-------|
| `name` | Yes | 2–100 characters (after trimming) |
| `email` | Yes | Valid format, ≤ 150 characters; stored lower-cased |
| `password` | Yes | At least 8 characters (no maximum check) |
| `phone` | No | ≤ 20 characters |

`201` → `data` is the new user: `id, name, email, phone, status, address, gender, profile_image, created_at, updated_at` (never the password). Errors: `422` (field errors), `409 "Email is already registered"`.
Called from: `auth.routes.js` → `authController.register` → `authService.register`.

### 17.4 `POST /api/v1/auth/login`
Auth: none.

| Field | Required | Notes |
|-------|----------|-------|
| `email` | Yes | |
| `password` | Yes | |
| `device_name` | No | Saved on the session (DB column length 150) |
| `device_type` | No | Saved on the session (DB column length 50) |

`200`:
```json
{
  "success": true, "message": "Login successful",
  "data": { "token": "<64 hex characters>", "expiresAt": "<ISO date, now + 7 days>", "user": { "id": 1, "name": "…", "email": "…", "profile_image": null, "…": "…" } }
}
```
**Save the `token` — it is shown only once** (only its hash is stored). Errors: `422`, `401 "Invalid email or password"`, `403 "User account is inactive"`.

### 17.5 `GET /api/v1/auth/me`
Auth: **Bearer**. `200` → current user (with `profile_image` as a full URL or `null`). Errors: `401`, `403`.

### 17.6 `PUT /api/v1/auth/me`
Auth: **Bearer**. Content-Type: `multipart/form-data` (needed for the photo; plain JSON also works when there is no photo).

| Field | Rules |
|-------|-------|
| `name` | Optional. Not empty, 2–100 chars |
| `email` | Optional. Valid, ≤150; must not belong to another user |
| `phone` | Optional. ≤20 chars, digits/`+`/`-`/spaces/parentheses, 7–20 long; empty string clears it |
| `address` | Optional. ≤255 chars; empty string clears it |
| `gender` | Optional. `male`, `female`, or `other` (case-insensitive) |
| `image` (file) | Optional. JPG/JPEG/PNG/WEBP/GIF, max 5 MB. Replaces the old photo |

Only fields you send are changed. **Any other field** (e.g. `password`, `status`) is rejected with `422` ("The following fields cannot be updated here"). Errors: `401/403`, `404`, `409`, `422`.

### 17.7 `POST /api/v1/auth/logout`
Auth: **Bearer**. No body. `200 {message:"Logout successful", data:null}`. Revokes **only this session**. The same token then returns `401`.

### 17.8 Categories (all need Bearer)

Category object: `id, name, slug, description, image (full URL or null), status ("active"/"inactive"), sort_order, created_at, updated_at`.

| Endpoint | Body / params | Success | Errors |
|----------|---------------|---------|--------|
| `POST /api/v1/categories` (multipart) | `name`* (≤100), `slug`* (≤120; lowercase letters, digits, hyphens), `description`, `sort_order` (integer ≥ 0, default 0), `image` (file) | `201` category, status `active` | `422`, `409 "Category slug is already registered"` |
| `GET /api/v1/categories` | — | `200` array, ordered by `sort_order` ascending then `id` descending. **Includes inactive categories. No pagination.** | `401` |
| `GET /api/v1/categories/:id` | `:id` | `200` category | `404 "Category not found"` |
| `PUT /api/v1/categories/:id` (multipart) | any of `name`, `slug`, `description`, `sort_order`, `image`. **`status` is rejected.** | `200` updated category; the replaced image file is deleted | `404`, `409`, `422` |
| `PATCH /api/v1/categories/:id/status` | none | `200` category with status flipped | `404` |
| `DELETE /api/v1/categories/:id` | `:id` | `200 "Category deleted permanently"`; image file deleted | `404`, `409 "Category cannot be deleted because it is being used by other records"` |

Example:
```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer <token>" \
  -F "name=Mobile Phones" -F "slug=mobile-phones" -F "sort_order=1" -F "image=@phone.jpg"
```

### 17.9 Static files
`GET /uploads/categories/<file>` and `GET /uploads/profiles/<file>` — public, no authentication.

---

## 18. Database

### 18.1 Basics

| Item | Detail |
|------|--------|
| Technology | **MySQL** |
| Connection (runtime) | `src/config/database.js` — `mysql2/promise` **pool**, `connectionLimit: 10`, `waitForConnections: true`, `queueLimit: 0`. Values come from `src/config/env.js` (see §11 — credentials are **not** shown here). |
| Connection (migrations) | `knexfile.js` (same env values) |
| Query layer | Raw SQL in `src/repositories/`, using `pool.execute` (prepared statements with `?` placeholders → protects against SQL injection). |
| ORM / models | **None.** There are no model classes. The "models" are the tables. |
| Migrations | 41 Knex files, `database/migrations/` |
| Seed data | None |
| Common columns | IDs are `BIGINT` auto-increment (`bigIncrements`). Almost every table has `created_at` and `updated_at` (`timestamps(true, true)`); repositories set `updated_at = NOW()` explicitly in their `UPDATE` statements. |

### 18.2 Tables and how they connect

**Legend:** ✅ = used by current API code; — = created but unused so far. "FK" = foreign key. `CASCADE` = children deleted with the parent. `RESTRICT` = parent cannot be deleted while children exist. `SET NULL` = the link is cleared.

#### Users, security and access

| Table | Used | Key columns | Relationships |
|-------|------|-------------|---------------|
| `users` | ✅ | `name, email (unique), password (hash), phone, status active/inactive, address, gender male/female/other, profile_image` | Parent of most user-related tables |
| `user_sessions` | ✅ | `user_id, token_hash (unique, 64 chars), refresh_token_hash (unique, nullable — **unused**), device_name, device_type, ip_address, user_agent, last_activity_at, expires_at, revoked_at, is_active` | FK `user_id → users` CASCADE |
| `user_otps` | — | `user_id (nullable), identifier, identifier_type email/phone, otp_hash, purpose (registration/login/forgot_password/change_email/change_phone), expires_at, verified_at, attempts, is_used` | FK `user_id → users` CASCADE |
| `password_reset_tokens` | — | `user_id, token_hash (unique), expires_at, used_at, ip_address, user_agent` | FK → users CASCADE |
| `roles` | — | `name, slug (unique), description, status` | — |
| `permissions` | — | `name, slug (unique), description` | — |
| `user_role_mappings` | — | `user_id, role_id` (unique pair) | → users, → roles (both CASCADE) |
| `role_permissions` | — | `role_id, permission_id` (unique pair) | → roles, → permissions (both CASCADE) |
| `addresses` | — | `user_id, name, phone, address_line_1/2, city, state, country (default "India"), postal_code, address_type shipping/billing, is_default` | FK → users CASCADE |

#### Catalogue

| Table | Used | Key columns | Relationships |
|-------|------|-------------|---------------|
| `categories` | ✅ | `name, slug (unique), description, image, status, sort_order` | Referenced by `products` (RESTRICT), `product_category_mappings` and `coupon_categories` (CASCADE) |
| `products` | — | `category_id, name, slug (unique), sku (unique), description, price, sale_price, stock_quantity, status (string, default "active"), is_featured` | FK `category_id → categories` RESTRICT |
| `product_images` | — | `product_id, image, is_primary, sort_order` | → products CASCADE |
| `product_variants` | — | `product_id, sku (unique), name, size, color, price, sale_price, stock_quantity, status (boolean)` | → products CASCADE |
| `product_attributes` | — | `product_id, attribute_name, attribute_value, sort_order` | → products CASCADE |
| `product_category_mappings` | — | `product_id, category_id, is_primary` (unique pair) | → products, → categories (CASCADE) |
| `tags` | — | `name, slug (unique), status` | — |
| `product_tags` | — | `product_id, tag` (text, unique pair) | → products CASCADE. **Not linked to `tags`.** |
| `collections` | — | `name, slug (unique), description, image, status, sort_order` | — |
| `product_collection_mappings` | — | `product_id, collection_id` (unique pair) | CASCADE both |
| `product_reviews` | — | `product_id, user_id, order_id (nullable), rating (tiny int), review, status pending/approved/rejected, is_verified_purchase` | → products, → users CASCADE; → orders SET NULL |
| `product_questions` | — | `product_id, user_id, question, answer, answered_by, status pending/answered/rejected` | → products, → users CASCADE; `answered_by → users` SET NULL |
| `wishlists` | — | `user_id, product_id` (unique pair) | CASCADE both |

#### Inventory

| Table | Used | Key columns | Relationships |
|-------|------|-------------|---------------|
| `inventory_transactions` | — | `product_id, variant_id, type (purchase/sale/return/adjustment/restock/damage/cancelled), quantity, previous_quantity, new_quantity, order_id, note` | → products RESTRICT; → variants, → orders SET NULL |
| `stock_alerts` | — | `product_id, variant_id, current_quantity, threshold_quantity (default 5), alert_type low_stock/out_of_stock, status pending/resolved, resolved_at` | → products, → variants CASCADE |

#### Cart and orders

| Table | Used | Key columns | Relationships |
|-------|------|-------------|---------------|
| `carts` | — | `user_id, status active/converted/abandoned` | → users CASCADE |
| `cart_items` | — | `cart_id, product_id, variant_id, quantity (default 1), unit_price`; unique `(cart_id, product_id, variant_id)` | → carts CASCADE; → products RESTRICT; → variants SET NULL |
| `orders` | — | `user_id, order_number (unique), status (pending/confirmed/processing/shipped/delivered/cancelled/returned), payment_status (pending/paid/failed/refunded/partially_refunded), payment_method (cod/card/upi/net_banking/wallet), subtotal, discount, shipping_charge, tax, total_amount, customer_note` | → users RESTRICT |
| `order_items` | — | `order_id, product_id, variant_id, product_name, sku, variant_name, quantity, unit_price, discount, total_price` (name/sku are **snapshots** so history stays correct if a product changes) | → orders CASCADE; → products RESTRICT; → variants SET NULL |
| `order_addresses` | — | `order_id, address_type` + full address copy; unique `(order_id, address_type)` | → orders CASCADE |
| `order_shipping` | — | `order_id, shipping_method_id, method_name, shipping_charge, tracking_number, carrier, shipped_at, delivered_at` | → orders CASCADE; → shipping_methods RESTRICT |
| `order_status_histories` | — | `order_id, status, changed_by, note` | → orders CASCADE; `changed_by → users` SET NULL |
| `payments` | — | `order_id, transaction_id (unique, nullable), payment_gateway, method, amount, status (pending/processing/successful/failed/refunded), gateway_response, paid_at` | → orders CASCADE |

#### Shipping

| Table | Used | Key columns | Relationships |
|-------|------|-------------|---------------|
| `shipping_methods` | — | `name, code (unique), description, price, free_shipping_min_amount, estimated_min_days, estimated_max_days, status, sort_order` | — |
| `shipping_zones` | — | `name, description, status` | — |
| `shipping_zone_locations` | — | `shipping_zone_id, country, state, city, postal_code` | → zones CASCADE |
| `shipping_zone_methods` | — | `shipping_zone_id, shipping_method_id, price, free_shipping_min_amount, status` (unique pair) | CASCADE both |

#### Promotions and notifications

| Table | Used | Key columns | Relationships |
|-------|------|-------------|---------------|
| `coupons` | — | `code (unique), name, description, discount_type percentage/fixed, discount_value, minimum_order_amount, maximum_discount_amount, usage_limit, used_count, starts_at, expires_at, status` | — |
| `coupon_usages` | — | `coupon_id, user_id, order_id, discount_amount` (unique `(coupon_id, order_id)`) | → coupons, → users RESTRICT; → orders CASCADE |
| `coupon_products` | — | `coupon_id, product_id` (unique pair) | CASCADE both |
| `coupon_categories` | — | `coupon_id, category_id` (unique pair) | CASCADE both |
| `notifications` | — | `user_id, type, title, message, data (text), read_at` | → users CASCADE |

### 18.3 The design in simple English

- A **user** can log in from many devices → many **sessions**.
- A **category** groups **products**. A product has images, variants (size/colour), attributes, tags, reviews, questions.
- A **cart** belongs to a user and holds **cart items**. Checkout would turn a cart into an **order** with **order items**, two **order addresses** (shipping and billing), a **shipping** record, a **payment**, and a **status history**.
- **Coupons** can be limited to certain products/categories, and each use is recorded.
- **Inventory transactions** are a stock ledger (before/after quantities); **stock alerts** flag low stock.
- **Roles → permissions** describe who can do what (not connected to code yet).

### 18.4 Design observations (documented, not changed)

- **Two ways to link product ↔ category:** `products.category_id` (required, one category) *and* `product_category_mappings` (many categories, with `is_primary`). How they are meant to work together is unclear from the code.
- **Two tag systems:** `tags` (with slug/status) and `product_tags` (plain text per product) are not connected by a foreign key. Purpose of having both is unclear.
- **Status columns are not uniform:** most are `enum(...)`, but `products.status` is a free string (default `"active"`) and `product_variants.status` / `shipping_zone_methods.status` are booleans.
- **Money** uses `DECIMAL(12,2)` everywhere (good practice).
- **Deleting a category** is blocked (MySQL error) if any product uses it; the service turns that into HTTP `409`. Rows in `product_category_mappings` and `coupon_categories` would be deleted automatically (CASCADE).
- The users migration was apparently edited after creation (§10.4).

---

## 19. Authentication and Authorization

### 19.1 Design in one paragraph

The API uses **server-side sessions with opaque bearer tokens** — *not* JWT. On login the server makes a random 32-byte token, gives the **raw token** to the client once, and stores only a **SHA-256 hash** of it in `user_sessions`. Each protected request sends the token; the server hashes it and looks it up. Because the raw token is never stored, a database leak does not reveal usable tokens, and any session can be revoked instantly.

### 19.2 Flows

**Registration** — `POST /auth/register`: validate → lower-case/trim → reject duplicate email (409) → `bcrypt.hash(password, 12)` → insert user with `status = 'active'` → return user. *(No email/phone verification; the `user_otps` table is unused.)*

**Login** — `POST /auth/login`:
1. Validate input. 2. Find user by email (same "Invalid email or password" for unknown email and wrong password). 3. Reject inactive user (403). 4. `bcrypt.compare`. 5. `token = crypto.randomBytes(32).toString("hex")`, `tokenHash = sha256(token)`, `expiresAt = now + 7 days`. 6. Insert into `user_sessions` (with device name/type, IP, user agent). 7. Return `{ token, expiresAt, user }`.

**Each protected request** — see the 7 steps in §6.4 (`auth.middleware.js`).

**Logout** — `POST /auth/logout`: sets `is_active = false` and `revoked_at = NOW()` for the current session only.

### 19.3 Reference table

| Topic | Answer |
|-------|--------|
| Session handling | Row in `user_sessions`, one per login; multiple devices allowed at once |
| Token format / handling | 64-hex-character random string, sent as `Authorization: Bearer <token>` |
| Cookies / local storage | **Not used by the server.** The client decides where to keep the token |
| Token lifetime | **7 days, fixed.** `last_activity_at` is updated on use but the expiry is **not** extended (no sliding expiry) |
| Token refresh | **Not implemented.** The column `refresh_token_hash` exists but is unused. After 7 days the user must log in again |
| Protected routes | `/auth/me` (GET, PUT), `/auth/logout`, and **all** `/categories/*` |
| Roles / permissions | Tables exist (`roles`, `permissions`, `user_role_mappings`, `role_permissions`) but **no code reads them.** There is only a user `status` check (`active`/`inactive`) |
| **Consequence** | **Any logged-in user can create, edit, and permanently delete categories.** If categories are meant to be admin-only, a role check must be added (see §31) |
| Middleware / guard | `src/middlewares/auth.middleware.js` |
| Password rules | Minimum 8 characters. bcrypt only uses the first 72 bytes of a password, so anything beyond that is ignored |
| Not implemented | Password change, forgot/reset password, email/phone verification, "log out everywhere", account deletion, session clean-up job (expired sessions remain in the table) |

---

## 20. State Management

**No state-management library** exists (no Redux, Zustand, etc.) — this is a backend.

| Kind of state | Where it lives |
|---------------|----------------|
| User login state | MySQL table `user_sessions` (per request: `req.user`, `req.session` set by `auth.middleware.js`, then discarded) |
| Persistent data | MySQL |
| Uploaded files | `uploads/` on disk |
| In-memory singletons | `env` object (`config/env.js`) and the MySQL `pool` (`config/database.js`) — both created once when first `require`d |

The server keeps **no per-user data in memory**, so it can restart at any time without logging anyone out.

## 21. Component Architecture
Not applicable — there is no frontend. (The closest backend equivalent of "reusable building blocks" is described in §6 and §23.)

## 22. Hooks
Not applicable — no React or custom hooks exist. The closest equivalent in this codebase is **Express middleware**, documented in §5.4 and §6.4.

---

## 23. Utilities / Helpers

All helpers are in `src/utils/`. They are small, framework-light, and reused across features.

| File | What it does | Why it is centralised | Used by | Should stay generic? |
|------|--------------|-----------------------|---------|----------------------|
| `asyncHandler.js` | `asyncHandler(fn)` returns a middleware that forwards any error/rejected promise from an async controller to `next(err)`. | Avoids `try/catch` in every controller. | All 3 controllers | Yes |
| `response.js` | `successResponse` and `errorResponse` produce the standard JSON shape. | One place defines the API response format. | All 3 controllers, `error.middleware.js` | Yes |
| `file.js` | `deleteFile("profiles/abc.jpg")` deletes `<cwd>/uploads/profiles/abc.jpg` if it exists. | File clean-up is needed by more than one feature. | `auth.service.js`, `category.service.js` | Yes — it takes a path *relative to `uploads/`* |
| `databaseHealth.js` | `checkDatabaseConnection()` runs `SELECT 1` and returns a status object. | Keeps DB-check code out of `server.js`. | `server.js` only | Mostly generic (could later power a `/health` endpoint) |

Correct usage examples:

```js
// controller
const list = asyncHandler(async (req, res) => {
  const data = await someService.list();
  return successResponse(res, data, "Fetched successfully");
});

// service (after a successful DB update)
deleteFile(path.join("categories", oldFileName));
```

> **Rule:** helpers must not contain business rules, and must not import controllers/services/repositories.
> **Caveat on `asyncHandler`:** Express 5 already forwards rejected promises from async handlers to the error handler, so this wrapper is probably redundant with the installed Express version. It is harmless and consistently used, so it was left as is.

---

## 24. Types / Interfaces / Models

The project is plain JavaScript. There are **no** TypeScript files, `.d.ts` files, interfaces, enums, or model classes.

- The only type hints are the JSDoc comments generated in migration files (`@param { import("knex").Knex } knex`).
- The **shape of data** is defined by: the database tables (migrations), the SQL `SELECT` column lists in repositories, and the JSON shapes in §14.4/§17.
- **Enum-like values** (`status`, `gender`, order statuses, …) exist only as MySQL `enum` definitions in migrations and as string literals in code. If you need shared constants, put them in `src/constants/`.
- `@types/node` is installed only as a peer dependency of `mysql2` (§8.3).

## 25. Styling
Not applicable — no CSS, SCSS, Tailwind, or any UI code.

---

## 26. Testing

| Item | Status |
|------|--------|
| Test framework (Jest, Vitest, Mocha, Playwright…) | **None installed** |
| Unit / integration / end-to-end tests | **None** |
| Test folders or `*.test.js` / `*.spec.js` files | **None** in the project code (the only `test` folders are inside third-party packages in `node_modules`) |
| Test config | None |
| Test command | **None.** `npm test` does not exist (running it prints "Missing script: test") |

`src/repositories/test.repository.js` **is not a test file** — it is an unused database ping helper (§5.5).

**How to verify changes today:** run `npm run dev`, then call the endpoints with `curl`/Postman using the examples in §10.5 and §17.

## 27. Linting and Formatting

| Tool | Status |
|------|--------|
| ESLint | Not installed, no config |
| Prettier | Not installed, no config |
| EditorConfig | None |
| Other linters/formatters | None |
| Commands | None (no `lint` or `format` script) |

Effect: code style varies between files (compare the compact style of `auth.controller.js` with the vertically-spread style of `category.controller.js`), and several files use Windows (CRLF) line endings.

**Before committing, without automated tools:** (1) start the app with `npm run dev` and confirm no start-up error; (2) run `npm run migrate:status` if you touched migrations; (3) exercise the endpoints you changed; (4) confirm `git status` does not include `.env`, `node_modules/`, or `uploads/` files.

---

## 28. Git and Version Control

| Item | Status |
|------|--------|
| `.git/` folder | Not included in the zip (cannot inspect branches/history) |
| `.gitignore` | **Exists but is empty (0 bytes)** |
| Git hooks, Husky, lint-staged, commitlint | **None** |
| Branch configuration | None found |

**Because `.gitignore` is empty, a `git add .` would commit:** `node_modules/` (thousands of files), `.env`, and everything in `uploads/` (including the 1.2 MB sample profile photo).

**Suggested `.gitignore`** (recommendation only — the file was not changed):

```gitignore
# dependencies
node_modules/

# environment (keep .env.example)
.env
.env.*
!.env.example

# user uploads (runtime data)
uploads/*
!uploads/.gitkeep

# logs and OS/editor files
*.log
npm-debug.log*
.DS_Store
Thumbs.db
.vscode/
.idea/
```
(If you ignore `uploads/*`, add an empty `uploads/.gitkeep` so the folder exists after cloning — although the app also creates `uploads/categories` and `uploads/profiles` itself on start-up.)

**Never commit:** `.env` with real credentials, uploaded user files, `node_modules/`, database dumps containing real customer data.

---

## 29. Docker

**No Docker configuration exists** in this project: no `Dockerfile`, `docker-compose.yml`, or `.dockerignore`. MySQL and the API are both expected to be installed/run directly on the developer's machine (or provided by whatever environment you deploy to).

*(Your master prompt ended at the heading "29. DOCKER" with no further instructions, so this section documents only what exists. If Docker was meant to be added, note that the container would need: Node ≥ 18, a MySQL service, the `.env` values, and a persistent volume for `uploads/`.)*

---

## 30. Observations and Risks (documented only — nothing was changed)

Ordered roughly by how likely they are to matter.

| # | Observation | Effect | Where |
|---|-------------|--------|-------|
| 1 | Env names mismatch: `.env` has `DB_DATABASE`, `DB_USERNAME`, `DB_CONNECTION`; code reads `DB_NAME`, `DB_USER` | Changing those three `.env` values has no effect; wrong DB/user silently used in other setups | §11 |
| 2 | `.gitignore` is empty | `.env`, `node_modules/`, and uploads would be committed | §28 |
| 3 | No role/permission check on any route | Any logged-in user can permanently delete categories | §19 |
| 4 | Multer runs **before** validators on upload routes | If validation fails (422), the uploaded file **stays on disk** (orphan file). Same for category `create`/`update` when the service throws `409`/`404` — unlike `auth.updateProfile`, which does clean up | `auth.routes.js`, `category.routes.js`, `category.service.js` |
| 5 | Multer errors (e.g. file over 5 MB → `LIMIT_FILE_SIZE`) carry no `statusCode` | Returned as HTTP **500** instead of a 4xx | `upload.middleware.js` + `error.middleware.js` |
| 6 | `error.middleware.js` returns the raw `err.message` even for 500s | Internal error text (e.g. SQL errors) can reach the client | `error.middleware.js` |
| 7 | `validateRegister`, `validateLogin`, and the category validators call `.trim()` directly on body values | A JSON body with a non-string value (e.g. `{"name": 123}`) throws a TypeError → **500** instead of 422. (`validateUpdateProfile` is safe: it wraps values in `String()`.) | `validations/*` |
| 8 | `device_name` (max 150) and `device_type` (max 50) are not length-validated | Too-long values would hit the database column limit and fail with a 500 (under MySQL's default strict mode) | `auth.validation.js`, `user_sessions` migration |
| 9 | No brute-force protection, CORS, security-headers, or request logging packages | Login can be attempted unlimited times; browsers on other origins cannot call the API without CORS config | not present |
| 10 | Image URLs are built from `req.protocol` + `req.get("host")` | Behind an HTTPS reverse proxy without Express `trust proxy`, URLs may be produced as `http://` | controllers |
| 11 | Expired/revoked sessions are never deleted | `user_sessions` grows forever | no clean-up job |
| 12 | Category list returns inactive items and has no pagination | Fine for now; revisit when a public storefront needs it | `category.service.js` |
| 13 | Error JSON shape varies slightly (`errors` key present in some, missing in others) | Frontend code must not assume `errors` always exists | §14.4 |
| 14 | Unused/unneeded items: `pg`, npm `crypto`, `test.repository.js`, `package.json` `"main": "index.js"`, `env.nodeEnv`, `refresh_token_hash`, 38 of the 41 tables (only `users`, `user_sessions`, `categories` are used) | Clutter/confusion only. Not removed | §5.5, §8, §18 |
| 15 | Users migration edited after creation (newer file date) | Databases migrated before the edit may be missing columns | §10.4 |
| 16 | `knexfile.js` has only a `development` block | Migrations with `NODE_ENV=production` will not find a config | §10.7 |
| 17 | Password max length not checked | bcrypt ignores everything after 72 bytes | §19 |

---

## 31. Adding New Functionality — Worked Guide

### 31.1 Add a new resource (example: **Products** list + detail)

The tables already exist (`products`, `product_images`, …), so start at the repository.

| Step | Action | File |
|------|--------|------|
| 1 | Write SQL functions (`findAll`, `findById`, …) using `executeQuery` | **create** `src/repositories/product.repository.js` |
| 2 | Add business rules; throw errors with `error.statusCode` | **create** `src/services/product.service.js` |
| 3 | Add request checks returning 422 | **create** `src/validations/product.validation.js` |
| 4 | Add handlers wrapped in `asyncHandler`, reply with `successResponse` | **create** `src/controllers/product.controller.js` |
| 5 | Define URLs and middleware chain | **create** `src/routes/v1/product.routes.js` |
| 6 | Mount it: `router.use("/products", productRoutes);` | **edit** `src/routes/v1/index.routes.js` |
| 7 | If it needs image upload, add a `productUpload` + folder | **edit** `src/middlewares/upload.middleware.js` |
| 8 | Test with curl/Postman | — |

Do **not** add SQL to controllers, or `req`/`res` to services/repositories.

### 31.2 Change the database

```bash
npx knex migrate:make add_barcode_to_products --knexfile knexfile.js
# edit the new file in database/migrations/ (write both up and down)
npm run migrate
```
**Do not edit a migration that has already been run on any shared database** — create a new migration instead. (The existing users migration appears to have been edited in place; see §10.4.)

### 31.3 Restrict an endpoint to admins (currently impossible without new code)

1. Create seed/insert logic for `roles`, `user_role_mappings` (tables already exist).
2. Add `src/repositories/role.repository.js` to read a user's roles.
3. Add `src/middlewares/role.middleware.js` (e.g. `requireRole("admin")`) that runs **after** `authMiddleware`.
4. Use it in routes: `router.delete("/:id", requireRole("admin"), categoryController.deleteCategory)`.

### 31.4 Add a new environment variable

1. Add it to `.env` **and** `.env.example`.
2. Expose it in `src/config/env.js` (with a default if sensible).
3. Import `env` where needed — never read `process.env` outside `env.js`.
4. Use the **exact same name** in all three places (this is the mistake behind observation #1).

---

## Appendix A — Complete Installed Package List (from `package-lock.json`, 152 packages)

Versions are exact. **D** = development-only (comes from `nodemon`). Direct dependencies are in bold.

| Package | Version | Type |
|---|---|---|
| @types/node | 22.20.2 | transitive (peer dependency of mysql2) |
| accepts | 2.0.0 | transitive |
| anymatch | 3.1.3 | D (transitive) |
| append-field | 1.0.0 | transitive |
| aws-ssl-profiles | 1.1.2 | transitive |
| balanced-match | 4.0.4 | D (transitive) |
| **bcrypt** | 6.0.0 | direct |
| binary-extensions | 2.3.0 | D (transitive) |
| body-parser | 2.3.0 | transitive |
| content-type *(nested copy under body-parser)* | 2.1.0 | transitive |
| brace-expansion | 5.0.9 | D (transitive) |
| braces | 3.0.3 | D (transitive) |
| busboy | 1.6.0 | transitive |
| bytes | 3.1.2 | transitive |
| call-bind-apply-helpers | 1.0.2 | transitive |
| call-bound | 1.0.4 | transitive |
| chokidar | 3.6.0 | D (transitive) |
| colorette | 2.0.19 | transitive |
| commander | 10.0.1 | transitive |
| content-disposition | 1.1.0 | transitive |
| content-type | 1.0.5 | transitive |
| cookie | 0.7.2 | transitive |
| cookie-signature | 1.2.2 | transitive |
| **crypto** | 1.0.1 | direct |
| debug | 4.4.3 | transitive |
| depd | 2.0.0 | transitive |
| **dotenv** | 17.4.2 | direct |
| dunder-proto | 1.0.1 | transitive |
| ee-first | 1.1.1 | transitive |
| encodeurl | 2.0.0 | transitive |
| es-define-property | 1.0.1 | transitive |
| es-errors | 1.3.0 | transitive |
| es-object-atoms | 1.1.2 | transitive |
| escalade | 3.2.0 | transitive |
| escape-html | 1.0.3 | transitive |
| esm | 3.2.25 | transitive |
| etag | 1.8.1 | transitive |
| **express** | 5.2.1 | direct |
| fill-range | 7.1.1 | D (transitive) |
| finalhandler | 2.1.1 | transitive |
| forwarded | 0.2.0 | transitive |
| fresh | 2.0.0 | transitive |
| fsevents | 2.3.3 | D (transitive) |
| function-bind | 1.1.2 | transitive |
| generate-function | 2.3.1 | transitive |
| get-intrinsic | 1.3.0 | transitive |
| get-package-type | 0.1.0 | transitive |
| get-proto | 1.0.1 | transitive |
| getopts | 2.3.0 | transitive |
| glob-parent | 5.1.2 | D (transitive) |
| gopd | 1.2.0 | transitive |
| has-flag | 3.0.0 | D (transitive) |
| has-symbols | 1.1.0 | transitive |
| hasown | 2.0.4 | transitive |
| http-errors | 2.0.1 | transitive |
| iconv-lite | 0.7.3 | transitive |
| ignore-by-default | 1.0.1 | D (transitive) |
| inherits | 2.0.4 | transitive |
| interpret | 2.2.0 | transitive |
| ipaddr.js | 1.9.1 | transitive |
| is-binary-path | 2.1.0 | D (transitive) |
| is-core-module | 2.16.2 | transitive |
| is-extglob | 2.1.1 | D (transitive) |
| is-glob | 4.0.3 | D (transitive) |
| is-number | 7.0.0 | D (transitive) |
| is-promise | 4.0.0 | transitive |
| is-property | 1.0.2 | transitive |
| **knex** | 3.3.0 | direct |
| debug *(nested copy under knex)* | 4.3.4 | transitive |
| ms *(nested copy under knex)* | 2.1.2 | transitive |
| pg-connection-string *(nested copy under knex)* | 2.6.2 | transitive |
| lodash | 4.18.1 | transitive |
| long | 5.3.2 | transitive |
| lru.min | 1.1.5 | transitive |
| math-intrinsics | 1.1.0 | transitive |
| media-typer | 1.1.1 | transitive |
| merge-descriptors | 2.0.0 | transitive |
| mime-db | 1.54.0 | transitive |
| mime-types | 3.0.2 | transitive |
| minimatch | 10.2.6 | D (transitive) |
| ms | 2.1.3 | transitive |
| **multer** | 2.4.0 | direct |
| media-typer *(nested copy under multer)* | 0.3.0 | transitive |
| mime-db *(nested copy under multer)* | 1.52.0 | transitive |
| mime-types *(nested copy under multer)* | 2.1.35 | transitive |
| type-is *(nested copy under multer)* | 1.6.18 | transitive |
| **mysql2** | 3.24.4 | direct |
| named-placeholders | 1.1.6 | transitive |
| negotiator | 1.1.0 | transitive |
| content-type *(nested copy under negotiator)* | 2.1.0 | transitive |
| node-addon-api | 8.9.2 | transitive |
| node-gyp-build | 4.8.4 | transitive |
| **nodemon** | 3.1.14 | direct, dev |
| normalize-path | 3.0.0 | D (transitive) |
| object-inspect | 1.13.4 | transitive |
| on-finished | 2.4.1 | transitive |
| once | 1.4.0 | transitive |
| parseurl | 1.3.3 | transitive |
| path-parse | 1.0.7 | transitive |
| path-to-regexp | 8.4.2 | transitive |
| **pg** | 8.23.0 | direct |
| pg-cloudflare | 1.4.0 | transitive |
| pg-connection-string | 2.14.0 | transitive |
| pg-int8 | 1.0.1 | transitive |
| pg-pool | 3.14.0 | transitive |
| pg-protocol | 1.16.0 | transitive |
| pg-types | 2.2.0 | transitive |
| pgpass | 1.0.5 | transitive |
| picomatch | 2.3.2 | D (transitive) |
| postgres-array | 2.0.0 | transitive |
| postgres-bytea | 1.0.1 | transitive |
| postgres-date | 1.0.7 | transitive |
| postgres-interval | 1.2.0 | transitive |
| proxy-addr | 2.0.7 | transitive |
| pstree.remy | 1.1.8 | D (transitive) |
| qs | 6.16.0 | transitive |
| range-parser | 1.3.0 | transitive |
| raw-body | 3.0.2 | transitive |
| readdirp | 3.6.0 | D (transitive) |
| rechoir | 0.8.0 | transitive |
| resolve | 1.22.12 | transitive |
| resolve-from | 5.0.0 | transitive |
| router | 2.2.0 | transitive |
| safer-buffer | 2.1.2 | transitive |
| semver | 7.8.5 | D (transitive) |
| send | 1.2.1 | transitive |
| serve-static | 2.2.1 | transitive |
| setprototypeof | 1.2.0 | transitive |
| side-channel | 1.1.1 | transitive |
| side-channel-list | 1.0.1 | transitive |
| side-channel-map | 1.0.1 | transitive |
| side-channel-weakmap | 1.0.2 | transitive |
| simple-update-notifier | 2.0.0 | D (transitive) |
| split2 | 4.2.0 | transitive |
| sql-escaper | 1.5.1 | transitive |
| statuses | 2.0.2 | transitive |
| streamsearch | 1.1.0 | transitive |
| supports-color | 5.5.0 | D (transitive) |
| supports-preserve-symlinks-flag | 1.0.0 | transitive |
| tarn | 3.1.2 | transitive |
| tildify | 2.0.0 | transitive |
| to-regex-range | 5.0.1 | D (transitive) |
| toidentifier | 1.0.1 | transitive |
| touch | 3.1.1 | D (transitive) |
| type-is | 2.1.0 | transitive |
| content-type *(nested copy under type-is)* | 2.1.0 | transitive |
| undefsafe | 2.0.5 | D (transitive) |
| undici-types | 6.21.0 | transitive |
| unpipe | 1.0.0 | transitive |
| vary | 1.1.2 | transitive |
| wrappy | 1.0.2 | transitive |
| xtend | 4.0.2 | transitive |

---

*End of document. Generated from a complete read of the project files in `ecommerce-api.zip`. No project files were modified.*
