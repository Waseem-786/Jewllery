import { Routes } from '@angular/router';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home/home').then(m => m.Home),
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./features/products/products/products').then(m => m.Products),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./features/products/product-detail/product-detail').then(m => m.ProductDetail),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart/cart').then(m => m.Cart),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout/checkout').then(m => m.Checkout),
  },
  {
  path: 'signin',
  loadComponent: () =>
    import('./features/auth/signin/signin').then(m => m.Signin),
},
{
  path: 'signup',
  loadComponent: () =>
    import('./features/auth/signup/signup').then(m => m.Signup),
},
{
  path: 'about',
  loadComponent: () =>
    import('./features/about/about').then(m => m.About),
},
{
  path: 'admin/login',
  loadComponent: () =>
    import('./features/admin/admin-login/admin-login').then(m => m.AdminLogin),
},
{
  path: 'admin',
  canActivate: [adminGuard],
  loadComponent: () =>
    import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
},
{
  path: 'order/success/:id',
  data: { variant: 'success' },
  loadComponent: () =>
    import('./features/order/order-status/order-status').then(m => m.OrderStatus),
},
{
  path: 'order/failure/:id',
  data: { variant: 'failure' },
  loadComponent: () =>
    import('./features/order/order-status/order-status').then(m => m.OrderStatus),
}
];