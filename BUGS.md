# QA pass — 2026-05-09

15 bugs found across code review, browser testing, and direct DB inspection.
Numbering reflects priority (1 = most severe, fix first).

| # | Severity | Title |
|---|---|---|
| 1 | Critical | PayFast callback can be forged — any unauthenticated GET marks an order Paid |
| 2 | Critical | Customer signin page does not call AuthService — login is impossible from the storefront |
| 3 | Critical | Customer signup page does not call AuthService — registration is impossible from the storefront |
| 4 | Critical | Negative-quantity orders accepted; totalAmount stored as a negative number |
| 5 | High     | Stock decrement race — concurrent orders lose units (5→1 instead of 5→0 in test) |
| 6 | High     | Empty ShippingAddress and blank customer fields accepted by API |
| 7 | High     | CORS allows only `http://localhost:4200`; the same site at `127.0.0.1:4200` is silently broken |
| 8 | High     | Cart deduplicates by `product.name` instead of `productId` (collisions + wrong removals) |
| 9 | High     | CartService uses three different localStorage keys across history; stale carts resurrect across sessions |
| 10 | High    | Storefront header & footer leak into `/admin*` routes on direct navigation |
| 11 | High    | Header has no Sign In / Sign Up / Account / Logout — auth pages are unreachable from UI |
| 12 | Medium  | Admin login pre-fills the admin email in the input field — credential hint in clear |
| 13 | Medium  | Auth pages render decorative buttons ("Continue with Google/Apple", "Forgot Password?", footer "Register") that do nothing |
| 14 | Medium  | Cart page has no +/- quantity controls; only a misleading "Remove" button (decrements by 1) |
| 15 | Medium  | `/assets/about-immersive.jpg` 404 on every page that references it |

---

### 1. PayFast callback can be forged — Critical
**Where:** [backend/GoldJewelryAPI/Controllers/PaymentsController.cs:62-90](backend/GoldJewelryAPI/Controllers/PaymentsController.cs)
**What's wrong:** `PayFastCallback` accepts both `GET` and `POST`, parses `err_code` / `basket_id` / `transaction_id` straight from query/form, and trusts them without re-computing or validating any signature against `PAYFAST_SECURED_KEY`.
**Repro:**
```
GET /api/payments/callback/payfast?basket_id=1&err_code=000&transaction_id=FAKE-TXN
```
returns `302 Location: /order/success/1` and the DB row becomes `Status=Processing, PaymentStatus=Paid, PaymentReference=FAKE-TXN`.
**Impact:** Anyone on the internet can mark any order as paid.

### 2. Signin form does nothing — Critical
**Where:** [frontend/jewellery-store/src/app/features/auth/signin/signin.ts:17-19](frontend/jewellery-store/src/app/features/auth/signin/signin.ts)
**What's wrong:** `login()` body is `console.log(...)` — `AuthService` is never called.
**Repro:** Open `/signin`, submit any credentials → URL stays put, no auth token written, no error shown.

### 3. Signup form does nothing — Critical
**Where:** [frontend/jewellery-store/src/app/features/auth/signup/signup.ts:19-26](frontend/jewellery-store/src/app/features/auth/signup/signup.ts)
**What's wrong:** `register()` checks password match and `console.log`s — no API call.
**Repro:** `/signup` with valid input → no new user created in DB, no token, no redirect.

### 4. Negative-quantity orders accepted — Critical
**Where:** [backend/GoldJewelryAPI/Controllers/OrdersController.cs:30-77](backend/GoldJewelryAPI/Controllers/OrdersController.cs) + [DTOs/AppDtos.cs:83-93](backend/GoldJewelryAPI/DTOs/AppDtos.cs)
**What's wrong:** No bounds check on `OrderItemDto.Quantity`. The stock-validation early-out (`product.Stock < item.Quantity`) is true even when quantity is negative (-5 < 14), so negative orders pass.
**Repro:** `POST /api/orders` with `items: [{productId:1, quantity:-5}]` → DB row created, `totalAmount = -625000`.
**Impact:** Skews dashboard revenue; potential refund/credit abuse.

### 5. Stock decrement race — High
**Where:** [backend/GoldJewelryAPI/Controllers/OrdersController.cs:35-77](backend/GoldJewelryAPI/Controllers/OrdersController.cs)
**What's wrong:** Reads stock, validates, decrements in memory, then SaveChanges — no row lock or atomic UPDATE. Two parallel requests both pass the check with the original stock value, then both decrement.
**Repro:** Set product stock to 5, fire 5 concurrent `POST /api/orders qty=1`. Observed final stock = 1 (one decrement lost).
**Impact:** Overselling; inventory drift.

### 6. Empty / blank order fields accepted — High
**Where:** [backend/GoldJewelryAPI/DTOs/AppDtos.cs:83-93](backend/GoldJewelryAPI/DTOs/AppDtos.cs)
**What's wrong:** `PlaceOrderDto` has no `[Required]` / `[StringLength]` / `[EmailAddress]` annotations. Empty `ShippingAddress`, blank email/phone slip through.
**Repro:** Order with all customer fields `""` is created (Order #7 in DB has empty shipping).

### 7. CORS only allows literal `localhost:4200` — High
**Where:** [backend/GoldJewelryAPI/Program.cs:46-50](backend/GoldJewelryAPI/Program.cs)
**What's wrong:** Policy hardcodes `http://localhost:4200`. Loading the dev frontend at `http://127.0.0.1:4200` (default of `npx ng serve --host 127.0.0.1`) trips browser CORS — every API call fails silently.
**Repro:** First Playwright run hit `127.0.0.1:4200`; console shows `blocked by CORS policy: No 'Access-Control-Allow-Origin' header`.

### 8. Cart dedupes by name — High
**Where:** [frontend/jewellery-store/src/app/core/cart.ts:41-69](frontend/jewellery-store/src/app/core/cart.ts)
**What's wrong:** `addToCart` matches existing items by `i.name === product.name`; `removeItem(productName)` removes by name. Two products that share a display name collide; removing affects both.
**Impact:** Wrong items in cart, wrong order totals, customer pays for/receives the wrong product.

### 9. Multiple stale localStorage keys — High
**Where:** [frontend/jewellery-store/src/app/core/cart.ts:17](frontend/jewellery-store/src/app/core/cart.ts)
**What's wrong:** Current key is `luxury_cart`. Earlier code (still present in test snapshots) wrote to `aurum_cart` and `cart`. Old data from prior sessions persists indefinitely and resurrects when the key is reverted.
**Repro:** `Object.keys(localStorage)` after testing shows `['luxury_cart','aurum_auth','cart']`.

### 10. Chrome leaks into /admin routes — High
**Where:** [frontend/jewellery-store/src/app/app.ts:15-22](frontend/jewellery-store/src/app/app.ts)
**What's wrong:** `currentUrl` signal initializes to `/`; `showChrome` starts true; `NavigationEnd` only fires after route change, and direct navigation to `/admin/login` doesn't always retrigger it before render.
**Repro:** Hard-navigate to `/admin/login` → storefront `<app-header>` and `<app-footer>` are rendered above/below the admin login. Same on `/admin` dashboard.

### 11. Storefront header has no auth entry — High
**Where:** [frontend/jewellery-store/src/app/layout/header/header.html](frontend/jewellery-store/src/app/layout/header/header.html)
**What's wrong:** Nav contains only Home / Shop / About. No Sign In, no Sign Up, no Account dropdown, no Logout. Even if signin worked, customers cannot reach `/signin` from any page.

### 12. Admin login leaks default email in HTML — Medium
**Where:** [frontend/jewellery-store/src/app/features/admin/admin-login/admin-login.html](frontend/jewellery-store/src/app/features/admin/admin-login/admin-login.html)
**What's wrong:** Email field renders pre-populated with `admin@goldjewelry.com` (visible in DOM and in view-source). A casual visitor can read it; only the password is secret.

### 13. Decorative non-functional auth buttons — Medium
**Where:** [features/auth/signin/signin.html](frontend/jewellery-store/src/app/features/auth/signin/signin.html), [features/auth/signup/signup.html](frontend/jewellery-store/src/app/features/auth/signup/signup.html)
**What's wrong:** "Continue with Google", "Continue with Apple", "Forgot Password?", "Register"/"Sign In" footer text are styled as buttons/links but are inert.

### 14. Cart has no quantity controls — Medium
**Where:** [frontend/jewellery-store/src/app/features/cart/cart/cart.html](frontend/jewellery-store/src/app/features/cart/cart/cart.html)
**What's wrong:** Only a "Remove" button per line, which actually decrements by 1 (label/intent mismatch). No `+` button. Customers can't add a second of the same item from the cart, can't bulk-remove, can't see how to set qty to 5.

### 15. Missing about-page hero image — Medium
**Where:** [frontend/jewellery-store/src/app/features/about/about.html](frontend/jewellery-store/src/app/features/about/about.html) referencing `/assets/about-immersive.jpg`
**What's wrong:** Asset doesn't exist in `frontend/jewellery-store/src/assets/`. 404 fires twice on every page that uses the home component.

---

## Fixes
Applied below — see commit history for the diffs. Re-tested via API + Playwright after.
