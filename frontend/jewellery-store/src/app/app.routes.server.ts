import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Routes that fetch live data from the backend or rely on browser-only auth state
  // are rendered on the client to avoid SSR-time API calls and localStorage access.
  { path: '', renderMode: RenderMode.Client },
  { path: 'shop', renderMode: RenderMode.Client },
  { path: 'product/:id', renderMode: RenderMode.Client },
  { path: 'cart', renderMode: RenderMode.Client },
  { path: 'checkout', renderMode: RenderMode.Client },
  { path: 'signin', renderMode: RenderMode.Client },
  { path: 'signup', renderMode: RenderMode.Client },
  { path: 'admin', renderMode: RenderMode.Client },
  { path: 'admin/login', renderMode: RenderMode.Client },
  { path: 'order/success/:id', renderMode: RenderMode.Client },
  { path: 'order/failure/:id', renderMode: RenderMode.Client },

  // Static marketing pages stay prerendered.
  { path: '**', renderMode: RenderMode.Prerender }
];
