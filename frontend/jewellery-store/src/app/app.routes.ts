import { Routes } from '@angular/router';

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
}
];