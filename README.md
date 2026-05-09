# Aurum — Gold Jewellery Store

A full-stack e-commerce reference for a luxury Pakistani jewellery brand. Storefront, admin dashboard, and PayFast Pakistan payment integration in one repo.

- **Backend**: ASP.NET Core 8 Web API · EF Core · SQL Server · JWT auth
- **Frontend**: Angular 21 (standalone components, signals, SSR) · SCSS · Vitest
- **Payments**: PayFast Pakistan (cards, JazzCash, Easypaisa, banks) via a single hosted-checkout flow

## Repository layout

```
.
├── backend/
│   └── GoldJewelryAPI/        ASP.NET Core 8 API
│       ├── Controllers/       Auth, Products, Categories, Orders, Payments, Admin
│       ├── Services/Payments/ PayFast provider + checkout HTML builder + state token
│       ├── DTOs/              All request/response DTOs in one file
│       ├── Models/            User, Category, Product, Order, OrderItem
│       ├── Data/              AppDbContext, DataSeeder
│       └── Migrations/        EF Core migrations
└── frontend/
    └── jewellery-store/       Angular 21 storefront
        ├── public/assets/     Static images
        │   └── videos/        Hero videos
        └── src/app/
            ├── core/          Singletons: auth, cart, toast, services, guards, interceptors
            ├── features/      Routed pages (home, products, product-detail, cart, checkout, auth, admin, …)
            ├── layout/        Header + footer
            └── shared/        Reusable components (charts, toast container)
```

## Features

### Storefront
- Catalogue with category filter, hero video, featured collection
- Product detail page with quantity selector, Add to Cart, **Buy Now**
- localStorage-backed cart keyed by product id
- Checkout with strict client-side validation and toast popups for errors
- Sign in / sign up with redirect-back flow (`?redirect=/checkout` survives the auth detour)
- Order success / failure pages

### Payments — PayFast Pakistan
- Server-side `GetAccessToken` call, then auto-submitting POST to `PostTransaction`
- Per-order HMAC `state` token verifies inbound callbacks (forged requests get a 401)
- Order is moved through `Pending → AwaitingProvider → Paid / Failed` based on PayFast `err_code`

### Admin dashboard
- Sidebar layout with five tabs: Overview, Orders, Products, Categories, Customers
- KPI cards (revenue, pending revenue, orders, customers)
- Hand-rolled SVG line + donut charts (no chart library dependency)
- Order management: filter by status, search, change status inline
- Product / category CRUD with image upload
- Customer roster with order count + total spent

## Getting started

### Prerequisites
- .NET 8 SDK
- Node.js 20+
- SQL Server (local instance — connection string defaults to `Server=localhost;Database=GoldJewelryDB;Trusted_Connection=True`)

### Backend

```bash
cd backend/GoldJewelryAPI
cp .env.example .env             # then fill PAYFAST_MERCHANT_ID + SECURED_KEY
dotnet tool restore
dotnet ef database update        # apply migrations + auto-seed admin user + sample catalogue
dotnet run                        # http://localhost:5000  ·  Swagger at /swagger
```

Default seed credentials (development only):
- **Admin**: `admin@goldjewelry.com` / `Admin@123`

### Frontend

```bash
cd frontend/jewellery-store
npm install
npm start                         # http://localhost:4200
```

Configure the API base in `src/environments/environment.ts` if not running on `localhost:5000`.

### Production build

```bash
cd frontend/jewellery-store
npm run build                                  # SSR bundle in dist/jewellery-store
npm run serve:ssr:jewellery-store              # run the prebuilt SSR server
```

## Environment variables

`backend/GoldJewelryAPI/.env` (gitignored — copy from `.env.example`):

| Key | Notes |
|---|---|
| `PAYFAST_MERCHANT_ID`     | From PayFast onboarding |
| `PAYFAST_SECURED_KEY`     | From PayFast onboarding (used for callback HMAC) |
| `PAYFAST_MERCHANT_NAME`   | Shown on the hosted checkout page |
| `PAYFAST_TOKEN_API_URL`   | Default points at the PayFast Pakistan UAT sandbox |
| `PAYFAST_REDIRECT_URL`    | Default points at the PayFast Pakistan UAT sandbox |
| `PAYFAST_CURRENCY`        | `PKR` |
| `APP_BACKEND_URL`         | Public URL PayFast can redirect back to (default `http://localhost:5000`) |
| `APP_FRONTEND_URL`        | Where to send the customer after a successful payment (default `http://localhost:4200`) |

## API surface (selected)

| Endpoint | Auth | Notes |
|---|---|---|
| `POST /api/auth/register` | — | BCrypt-hashed password; returns JWT |
| `POST /api/auth/login` | — | Returns JWT |
| `GET /api/products` | — | Public catalogue, supports `?featured=true&categoryId=&search=` |
| `GET /api/products/{id}` | — | Single product |
| `POST /api/products` | Admin | Create / update / delete is `[Authorize(Roles="Admin")]` |
| `POST /api/orders` | User | Atomic stock decrement + PayFast initiation |
| `GET /api/orders/my` | User | Orders for the calling user |
| `GET /api/admin/dashboard` | Admin | Stats for the admin overview |
| `GET /api/admin/orders` | Admin | All orders with `?status=&search=` |
| `PATCH /api/admin/orders/{id}/status` | Admin | Move through fulfilment lifecycle |
| `GET /api/admin/users` | Admin | Customer list |
| `GET /api/payments/payfast/checkout/{orderId}` | — | Renders the auto-submit form to PayFast |
| `GET\|POST /api/payments/callback/payfast` | — | PayFast post-payment redirect; verifies `state` token |

Browse the Swagger UI at `http://localhost:5000/swagger` for the full set.

## Tests

- Frontend: `npm test` runs Vitest (jsdom) against `*.spec.ts` files.
- Backend: no automated tests yet — verify changes manually via Swagger or the storefront flows.

## Notes on the QA pass

A focused QA pass was run against this codebase; the bug log and fix verification are in [BUGS.md](BUGS.md). Highlights of what was hardened:
- PayFast callback HMAC `state` verification (forged callbacks rejected)
- Atomic stock decrement (no overselling under concurrent orders)
- DataAnnotation validation on every order/auth DTO
- Cart keyed by `productId`, with localStorage migration from earlier keys
- Toast-based form feedback replacing `alert()` and inline error blocks

## License

This project is for educational / portfolio use. Don't reuse the bundled JWT key, admin credentials, or PayFast sandbox endpoints for anything that handles real money.
