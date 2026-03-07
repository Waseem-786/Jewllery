import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [RouterLink, CommonModule, FormsModule],
    template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-brand">✦ Gold &amp; Grace</div>
        <h1>Welcome Back</h1>
        <p class="auth-sub">Sign in to your account to continue</p>

        <div class="alert alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>

        <form #f="ngForm" (ngSubmit)="onSubmit(f)">
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" class="form-control" name="email" ngModel required placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" class="form-control" name="password" ngModel required placeholder="••••••••" />
          </div>

          <button type="submit" class="btn btn-gold btn-full" [disabled]="loading">
            {{ loading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/auth/register">Sign Up</a>
        </div>
      </div>

      <div class="auth-visual">
        <div class="auth-quote">
          <blockquote>"Jewellery is the most transformative thing you can wear."</blockquote>
          <cite>— Iris Apfel</cite>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .auth-page { min-height: calc(100vh - 72px); display: grid; grid-template-columns: 1fr 1fr; }
    .auth-card { display: flex; flex-direction: column; justify-content: center; padding: 60px 64px; max-width: 520px; width: 100%; }
    .auth-brand { font-family: var(--font-heading); font-size: 1.1rem; color: var(--color-gold); margin-bottom: 32px; }
    .auth-card h1 { font-family: var(--font-heading); font-size: 2rem; color: var(--color-white); margin-bottom: 8px; }
    .auth-sub { color: var(--color-text-muted); margin-bottom: 36px; }
    .btn-full { width: 100%; justify-content: center; padding: 15px; font-size: 1rem; margin-top: 8px; }
    .auth-footer { text-align: center; margin-top: 24px; color: var(--color-text-muted); font-size: 0.9rem; }
    .auth-visual {
      background: linear-gradient(135deg, #1a1200 0%, #0d0b0e 100%);
      display: flex; align-items: center; justify-content: center;
      padding: 60px;
      border-left: 1px solid var(--color-border);
      position: relative; overflow: hidden;
    }
    .auth-visual::before {
      content: '';
      position: absolute;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 65%);
      border-radius: 50%;
    }
    .auth-quote { position: relative; z-index: 1; text-align: center; }
    .auth-quote blockquote { font-family: var(--font-heading); font-size: 1.5rem; color: var(--color-white); line-height: 1.6; margin-bottom: 16px; font-style: italic; }
    .auth-quote cite { color: var(--color-gold); font-size: 0.9rem; font-style: normal; }
    @media (max-width: 860px) { .auth-page { grid-template-columns: 1fr; } .auth-visual { display: none; } .auth-card { max-width: 100%; padding: 40px 24px; } }
  `]
})
export class LoginComponent {
    loading = false;
    errorMsg = '';

    constructor(private auth: AuthService, private router: Router) { }

    onSubmit(form: NgForm): void {
        if (form.invalid) return;
        this.loading = true;
        this.errorMsg = '';

        this.auth.login({ email: form.value.email, password: form.value.password }).subscribe({
            next: () => this.router.navigate(['/']),
            error: (err) => {
                this.errorMsg = err.error?.message || 'Invalid email or password.';
                this.loading = false;
            }
        });
    }
}
