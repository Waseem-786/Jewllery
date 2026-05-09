import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../core/cart';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  constructor(
    public cartService: CartService,
    public auth: AuthService,
    private router: Router,
  ) {}

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/');
  }
}
