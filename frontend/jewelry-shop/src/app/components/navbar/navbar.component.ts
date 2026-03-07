import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, CommonModule, AsyncPipe],
    template: `
    <nav class="navbar" [class.scrolled]="scrolled">
      <div class="nav-inner">
        <a routerLink="/" class="nav-logo">✦ Gold &amp; Grace</a>

        <ul class="nav-links">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a></li>
          <li><a routerLink="/shop" routerLinkActive="active">Shop</a></li>
          <li *ngIf="auth.isLoggedIn"><a routerLink="/orders" routerLinkActive="active">My Orders</a></li>
        </ul>

        <div class="nav-actions">
          <a routerLink="/cart" class="cart-btn" *ngIf="auth.isLoggedIn">
            <span class="cart-icon">🛒</span>
            <span class="cart-badge" *ngIf="(cart.items$ | async)?.length">{{ cart.totalItems }}</span>
          </a>

          <ng-container *ngIf="auth.user$ | async as user; else guestLinks">
            <div class="user-menu">
              <span class="user-greeting">Hi, {{ user.fullName.split(' ')[0] }}</span>
              <button class="btn btn-ghost btn-sm" (click)="auth.logout()">Logout</button>
            </div>
          </ng-container>

          <ng-template #guestLinks>
            <a routerLink="/auth/login" class="btn btn-ghost btn-sm">Sign In</a>
            <a routerLink="/auth/register" class="btn btn-gold btn-sm">Sign Up</a>
          </ng-template>
        </div>
      </div>
    </nav>
  `,
    styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(13,11,14,0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--color-border);
      transition: background 0.3s;
    }
    .navbar.scrolled {
      background: rgba(13,11,14,0.97);
    }
    .nav-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
      height: 72px;
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .nav-logo {
      font-family: var(--font-heading);
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--color-gold);
      white-space: nowrap;
    }
    .nav-logo:hover { color: var(--color-gold-light); }
    .nav-links {
      display: flex;
      list-style: none;
      gap: 32px;
      flex: 1;
    }
    .nav-links a {
      color: var(--color-text-muted);
      font-size: 0.9rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 4px 0;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--color-gold);
      border-bottom-color: var(--color-gold);
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cart-btn {
      position: relative;
      font-size: 1.3rem;
      display: flex;
      align-items: center;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      background: rgba(212,175,55,0.08);
      transition: background 0.2s;
    }
    .cart-btn:hover { background: rgba(212,175,55,0.15); }
    .cart-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--color-gold);
      color: #1a1200;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      font-size: 0.7rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-menu { display: flex; align-items: center; gap: 10px; }
    .user-greeting { font-size: 0.9rem; color: var(--color-text-muted); }
    .btn-sm { padding: 8px 18px; font-size: 0.85rem; }
  `]
})
export class NavbarComponent implements OnInit {
    scrolled = false;

    constructor(public auth: AuthService, public cart: CartService) { }

    ngOnInit(): void {
        window.addEventListener('scroll', () => {
            this.scrolled = window.scrollY > 20;
        });
    }
}
