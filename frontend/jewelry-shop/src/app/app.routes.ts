import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'shop',
        loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent)
    },
    {
        path: 'product/:id',
        loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
    },
    {
        path: 'auth/login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'auth/register',
        loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
    },
    {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent)
    },
    {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/orders/orders.component').then(m => m.OrdersComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
