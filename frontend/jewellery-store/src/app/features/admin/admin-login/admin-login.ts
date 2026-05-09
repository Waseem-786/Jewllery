import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.scss'],
})
export class AdminLogin {
  email = '';
  password = '';
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    if (!this.email || !this.password) return;
    this.busy.set(true);
    this.error.set(null);
    this.auth.login(this.email, this.password).subscribe({
      next: res => {
        this.busy.set(false);
        if (res.role !== 'Admin') {
          this.auth.logout();
          this.error.set('This account is not an admin.');
          return;
        }
        this.router.navigate(['/admin']);
      },
      error: err => {
        this.busy.set(false);
        this.error.set(err?.error?.message ?? 'Login failed.');
      },
    });
  }
}
