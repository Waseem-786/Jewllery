# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independent applications, intended to be run together:

- `backend/GoldJewelryAPI/` — ASP.NET Core 8 Web API (C#, EF Core + SQL Server, JWT auth, PayFast Pakistan).
- `frontend/jewellery-store/` — Angular 21 storefront (standalone components, signals, SSR with prerendering, SCSS, Vitest).

There is no root-level build orchestrator — each side is built and run from its own directory.

## Backend (`backend/GoldJewelryAPI`)

### Common commands (run from `backend/GoldJewelryAPI/`)

```bash
dotnet restore
dotnet build
dotnet run                 # serves the API on http://localhost:5000; Swagger UI at /swagger
dotnet tool restore        # installs the pinned dotnet-ef (see dotnet-tools.json)
dotnet ef migrations add <Name>
dotnet ef database update  # applies migrations to the configured SQL Server
```

### Configuration

- Connection string `DefaultConnection` in `appsettings.json` points at a **local SQL Server** (`Server=localhost;Database=GoldJewelryDB;Trusted_Connection=True`). Override via user secrets or environment for other environments — do not edit the committed file with real credentials.
- JWT settings (`Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`, `Jwt:ExpiryInDays`) are read in `Program.cs`. The committed key is a placeholder.
- **PayFast credentials live in `backend/GoldJewelryAPI/.env`** (gitignored). See [.env.example](backend/GoldJewelryAPI/.env.example) for required keys: `PAYFAST_MERCHANT_ID`, `PAYFAST_SECURED_KEY`, `PAYFAST_MERCHANT_NAME`, plus the sandbox/production endpoint URLs and `APP_FRONTEND_URL` / `APP_BACKEND_URL`. [Configuration/DotEnv.cs](backend/GoldJewelryAPI/Configuration/DotEnv.cs) loads them into the process env at startup so the standard configuration pipeline picks them up.
- CORS allows `http://localhost:4200` and `http://127.0.0.1:4200` via the `AllowAngular` policy. Add prod origins in `Program.cs` when deploying.

### Architecture notes

- Single `AppDbContext` ([Data/AppDbContext.cs](backend/GoldJewelryAPI/Data/AppDbContext.cs)) owns all entities: `User`, `Category`, `Product`, `Order`, `OrderItem`. Relationship config (cascade vs. restrict, decimal precision, unique email index) lives in `OnModelCreating` — keep it there rather than spreading attributes across models.
- Controllers are thin and talk directly to `AppDbContext`; there is no service/repository layer. DTOs for every endpoint live in a single file: [DTOs/AppDtos.cs](backend/GoldJewelryAPI/DTOs/AppDtos.cs).
- Auth: `AuthController` issues JWTs on register/login using BCrypt for password hashing. JWT carries `ClaimTypes.Role` so role-gated endpoints work via `[Authorize(Roles = "Admin")]`.
- `OrdersController.PlaceOrder` is `[Authorize]`-gated. It validates input via DataAnnotations, then runs the validate → atomic conditional `ExecuteUpdate` decrement (`WHERE Stock >= qty`) → order insert sequence inside a `ReadCommitted` transaction. The conditional UPDATE is what serializes concurrent stock decrements; the transaction is only there for rollback. Preserve that pattern when adding order-mutating endpoints.
- `AdminController` ([Controllers/AdminController.cs](backend/GoldJewelryAPI/Controllers/AdminController.cs)) is `[Authorize(Roles = "Admin")]` and exposes:
  - `GET /api/admin/dashboard` — KPI totals, status counts, 14-day revenue series, top products, recent orders, low stock list
  - `GET /api/admin/orders?status=&search=` — all orders with filters
  - `PATCH /api/admin/orders/{id}/status` — move an order through Pending → Processing → Shipped → Delivered → Cancelled
  - `GET /api/admin/users` — customers with order count + total spent
- **PayFast Pakistan** integration:
  - [Services/Payments/IPaymentProvider.cs](backend/GoldJewelryAPI/Services/Payments/IPaymentProvider.cs) is the abstraction; only [PayFastProvider.cs](backend/GoldJewelryAPI/Services/Payments/PayFastProvider.cs) is registered.
  - On order placement, `PayFastProvider.InitiateAsync` returns a redirect URL pointing at our own `GET /api/payments/payfast/checkout/{orderId}` endpoint.
  - That endpoint, via [PayFastCheckoutService.cs](backend/GoldJewelryAPI/Services/Payments/PayFastCheckoutService.cs), calls PayFast's `GetAccessToken` then renders an auto-submitting HTML form to PayFast's `PostTransaction` URL with the documented field set (MERCHANT_ID, TOKEN, PROCCODE, TXNAMT, BASKET_ID, SIGNATURE, SUCCESS_URL, FAILURE_URL, etc.).
  - PayFast redirects the customer back to `GET|POST /api/payments/callback/payfast`. The handler verifies a server-derived `state` token (HMAC over `orderId|userId|createdAt.Ticks`, computed by [OrderStateToken.cs](backend/GoldJewelryAPI/Services/Payments/OrderStateToken.cs)) before it trusts the `err_code`. Any callback without a valid state is rejected with 401.
- [Data/DataSeeder.cs](backend/GoldJewelryAPI/Data/DataSeeder.cs) seeds categories, ~16 products, and the admin user (`admin@goldjewelry.com` / `Admin@123`). It's called from `Program.cs` on every startup; the seeder is idempotent (skips if data already exists).

## Frontend (`frontend/jewellery-store`)

### Common commands (run from `frontend/jewellery-store/`)

```bash
npm install
npm start                  # ng serve, dev at http://localhost:4200
npm run build              # production build (SSR; outputs to dist/jewellery-store)
npm run watch              # dev build in watch mode
npm test                   # Vitest via ng test
npm run serve:ssr:jewellery-store   # run the prebuilt SSR server bundle
```

To run a single test: `npx vitest run src/app/core/cart.spec.ts` or `npx vitest -t "<test name>"`.

### Architecture notes

- Angular 21 with **standalone components** and signals — no NgModules. App bootstrap is in `src/main.ts`; providers in [src/app/app.config.ts](frontend/jewellery-store/src/app/app.config.ts) (`provideHttpClient(withInterceptors([authInterceptor]))`, `provideRouter`, `provideClientHydration`).
- Routes are lazy-loaded via `loadComponent` in [src/app/app.routes.ts](frontend/jewellery-store/src/app/app.routes.ts): `/` (home), `/shop`, `/product/:id`, `/cart`, `/checkout`, `/signin`, `/signup`, `/about`, `/admin/login`, `/admin`, `/order/success/:id`, `/order/failure/:id`. Add new pages by creating `features/<name>/<name>/` and registering a `loadComponent` route.
- **SSR is enabled** (`@angular/ssr`). [src/app/app.routes.server.ts](frontend/jewellery-store/src/app/app.routes.server.ts) marks dynamic routes as `RenderMode.Client` (data-fetch / browser-state pages) and falls back to `Prerender` for static ones. Any code that touches `window`/`localStorage` must guard for SSR — see [src/app/core/cart.ts](frontend/jewellery-store/src/app/core/cart.ts) for the established pattern.
- Folder convention:
  - `core/` — app-wide singletons. `auth.ts`, `auth.interceptor.ts`, `admin.guard.ts`, `cart.ts`, `toast.service.ts`, plus one HTTP service per backend area (`products.service.ts`, `categories.service.ts`, `orders.service.ts`, `admin.service.ts`).
  - `features/<name>/` — routed pages.
  - `layout/header/`, `layout/footer/` — global chrome. The header is hidden on `/admin*` routes via the `showChrome` computed signal in [app.ts](frontend/jewellery-store/src/app/app.ts).
  - `shared/` — reusable presentational components: `charts/line-chart.ts`, `charts/donut-chart.ts`, `toast/toast-container.ts`.
- `CartService` is a localStorage-backed signal store keyed by `productId` (`storage_key = 'aurum_cart'`). Earlier keys (`luxury_cart`, `cart`) are migrated once on construct then deleted.
- `ToastService` ([core/toast.service.ts](frontend/jewellery-store/src/app/core/toast.service.ts)) drives the global popup notifications. Inject it and call `toast.success(msg)`, `.error(msg, title?)`, `.info(msg)` — never use `alert()` or inline `<p class="form-error">` for user-facing errors. The container is mounted in [app.html](frontend/jewellery-store/src/app/app.html).
- Form validation pattern: components hold a `fieldErrors` signal (`Record<keyof Form, string>`) and a `validate()` method. On submit, populate `fieldErrors` and pop the first error via `toast.error(message, 'Please check the form')`. Mark the offending input with `[class.has-error]` and render a `.hint` below it. See [features/checkout/checkout/checkout.ts](frontend/jewellery-store/src/app/features/checkout/checkout/checkout.ts), `features/auth/signin/signin.ts`, `features/auth/signup/signup.ts` for the canonical shape.
- **Auth flow with redirect**: signin and signup both honour a `?redirect=<path>` query param and navigate there on success. The "Register" link inside the signin page passes the param through with `[queryParams]="signupLink"`, so a guest who lands on `/signin?redirect=/checkout` and switches to signup ends up back on `/checkout` after registering. Preserve this when adding new auth-gated routes.

### Static assets

- Static assets live in `frontend/jewellery-store/public/assets/`.
- Videos go in `public/assets/videos/` (referenced from templates as `assets/videos/<file>.mp4`).
- Product imagery is uploaded to the backend at runtime (`POST /api/products/upload`) and served from `wwwroot/uploads/`. The frontend `ProductService.resolveImageUrl` rewrites relative `/uploads/...` URLs against the API base.

## Cross-cutting

- The default admin credentials and JWT key in committed config are development-only — never reuse them outside local dev.
- When changing API surface, the frontend has no generated client yet, so update consumers by hand. Keep DTOs in sync with the matching `core/*.service.ts` interface.
- Test runs and review screenshots are kept under gitignored folders (`.review-screenshots/`, `.playwright-mcp/`). Don't commit them.
- See [BUGS.md](BUGS.md) for the QA pass log + repro steps for the issues fixed in the last review cycle.
