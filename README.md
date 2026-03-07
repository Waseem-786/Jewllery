# Gold & Grace Jewellery — Full Stack Project

A premium jewellery e-commerce platform built with **.NET 8 Web API** + **Angular 17**, featuring JWT authentication, an EF Core SQL Server database, and a beautiful dark/gold theme.

---

## Prerequisites

Before running, install:

| Tool | Download |
|---|---|
| **.NET 8 SDK** | https://dotnet.microsoft.com/download/dotnet/
https://dotnet.microsoft.com/en-us/download/dotnet/thank-you/sdk-8.0.418-macos-x64-installer8 |
| **Node.js 18+** | https://nodejs.org |
| **Angular CLI** | `npm install -g @angular/cli` |
| **SQL Server** | https://www.microsoft.com/en-us/sql-server/sql-server-downloads |

---

## Project Structure

```
Gold_Selling_Website/
├── backend/
│   └── GoldJewelryAPI/         ← .NET 8 Web API
│       ├── Controllers/
│       ├── Data/               ← DbContext + Seeder
│       ├── DTOs/
│       ├── Models/
│       ├── Program.cs
│       └── appsettings.json
└── frontend/
    └── jewelry-shop/           ← Angular 17
        └── src/app/
            ├── components/     ← Navbar
            ├── guards/         ← Auth guard
            ├── interceptors/   ← JWT interceptor
            ├── models/         ← TypeScript interfaces
            ├── pages/          ← All page components
            └── services/       ← All services
```

---

## 🚀 Running the Backend

```powershell
cd backend\GoldJewelryAPI

# Restore NuGet packages
dotnet restore

# Create and apply the database migration
dotnet ef migrations add InitialCreate
dotnet ef database update

# Run the API (auto-seeds data on startup)
dotnet run
```

**API will be available at:** `http://localhost:5000`  
**Swagger UI:** `http://localhost:5000/swagger`

> **Default Admin Login:** `admin@goldjewelry.com` / `Admin@123`

---

## 🅰️ Running the Frontend

```powershell
cd frontend\jewelry-shop

# Install npm packages
npm install

# Start development server
ng serve
```

**App will open at:** `http://localhost:4200`

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and get JWT token |
| GET | `/api/products` | Public | All products (supports ?categoryId, ?search, ?featured) |
| GET | `/api/products/{id}` | Public | Single product details |
| GET | `/api/categories` | Public | All categories with product counts |
| POST | `/api/orders` | 🔒 JWT | Place a new order |
| GET | `/api/orders/my` | 🔒 JWT | Get current user's orders |

---

## Database Schema

```
Users ──── Orders ──── OrderItems ──── Products ──── Categories
```

- **Users**: FullName, Email, PasswordHash (BCrypt), Role (Customer/Admin)
- **Categories**: Rings, Necklaces, Earrings, Bracelets, Pendants (5 seeded)
- **Products**: Name, Price, Weight, Material, Purity, IsFeatured (16 seeded)
- **Orders**: Total, Status, ShippingAddress, CreatedAt
- **OrderItems**: Quantity, UnitPrice (snapshot at time of order)

---

## Features

- ✦ **Premium dark/gold UI** with Playfair Display + Inter fonts
- 🔐 **JWT Authentication** — Register, Login, auto-logout
- 🛍️ **Product catalog** with category and search filters
- 🛒 **Persistent cart** stored in localStorage
- 📦 **Order placement** with stock validation
- 📋 **Order history** with status tracking
- 🎨 **Fully responsive** mobile-friendly design
