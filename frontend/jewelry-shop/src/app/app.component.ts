import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent],
    template: `
    <app-navbar></app-navbar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="footer-logo">✦ Gold & Grace</span>
          <p>Crafting timeless jewellery since 1985. Each piece tells a story of elegance and tradition.</p>
        </div>
        <div class="footer-links">
          <h4>Quick Links</h4>
          <a routerLink="/">Home</a>
          <a routerLink="/shop">Shop</a>
        </div>
        <div class="footer-contact">
          <h4>Contact</h4>
          <p>📧 hello&#64;goldandgrace.com</p>
          <p>📞 +92 300 1234567</p>
          <p>📍 Lahore, Pakistan</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2024 Gold &amp; Grace Jewellery. All rights reserved.</p>
      </div>
    </footer>
  `
})
export class AppComponent { }
