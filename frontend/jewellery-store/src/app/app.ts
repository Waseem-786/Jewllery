import { Component, computed, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { ToastContainer } from './shared/toast/toast-container';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Footer, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('jewellery-store');
  private readonly currentUrl = signal<string>('/');

  // Hide storefront header/footer on admin routes — they have their own chrome.
  protected readonly showChrome = computed(() => !this.currentUrl().startsWith('/admin'));

  constructor(router: Router) {
    // Seed from the actual address bar so the chrome is right on the very
    // first render — Router.url is still '/' before initial navigation
    // completes, so depending on it would flash the storefront chrome on
    // /admin pages before NavigationEnd fires.
    if (typeof window !== 'undefined' && window.location?.pathname) {
      this.currentUrl.set(window.location.pathname);
    } else {
      this.currentUrl.set(router.url || '/');
    }
    router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.currentUrl.set(e.urlAfterRedirects || e.url));
  }
}
