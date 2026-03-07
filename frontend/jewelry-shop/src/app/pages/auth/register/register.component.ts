import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [RouterLink, CommonModule, FormsModule],
    template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-brand">✦ Gold &amp; Grace</div>
        <h1>Create Account</h1>
        <p class="auth-sub">Join thousands of jewellery lovers today</p>

        <div class="alert alert-error" *ngIf="errorMsg">{{ errorMsg }}</div>
        <div class="alert alert-success" *ngIf="successMsg">{{ successMsg }}</div>

        <form #f="ngForm" (ngSubmit)="onSubmit(f)">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" class="form-control" name="fullName" ngModel required placeholder="Ayesha Khan" />
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" class="form-control" name="email" ngModel required placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" class="form-control" name="password" ngModel required minlength="6" placeholder="Min. 6 characters" />
          </div>

          <button type="submit" class="btn btn-gold btn-full" [disabled]="loading">
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/auth/login">Sign In</a>
        </div>

        <div class="trust-badges">
          <span>🔒 Secure</span>
          <span>✓ No spam</span>
          <span>💎 Exclusive offers</span>
        </div>
      </div>

      <div class="auth-visual">
        <div class="auth-quote">
          <blockquote>"Wearing jewellery is a way of expressing your inner beauty and elegance."</blockquote>
          <cite>— Unknown</cite>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .auth-page { min-height: calc(100vh - 72px); display: grid; grid-template-columns: 1fr 1fr; }
    .auth-card { display: flex; flex-direction: column; justify-content: center; padding: 60px 64px; max-width: 520px; width: 100%; }
    .auth-brand { font-family: var(--font-heading); font-size: 1.1rem; color: var(--color-gold); margin-bottom: 28px; }
    .auth-card h1 { font-family: var(--font-heading); font-size: 2rem; color: var(--color-white); margin-bottom: 8px; }
    .auth-sub { color: var(--color-text-muted); margin-bottom: 32px; }
    .btn-full { width: 100%; justify-content: center; padding: 15px; font-size: 1rem; margin-top: 8px; }
    .auth-footer { text-align: center; margin-top: 20px; color: var(--color-text-muted); font-size: 0.9rem; }
    .trust-badges { display: flex; gap: 16px; justify-content: center; margin-top: 24px; }
    .trust-badges span { font-size: 0.78rem; color: var(--color-text-muted); }
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
    .auth-quote blockquote { font-family: var(--font-heading); font-size: 1.4rem; color: var(--color-white); line-height: 1.6; margin-bottom: 16px; font-style: italic; }
    .auth-quote cite { color: var(--color-gold); font-size: 0.9rem; font-style: normal; }
    @media (max-width: 860px) { .auth-page { grid-template-columns: 1fr; } .auth-visual { display: none; } .auth-card { max-width: 100%; padding: 40px 24px; } }
  `]
})
export class RegisterComponent {
    loading = false;
    errorMsg = '';
    successMsg = '';

    constructor(private auth: AuthService, private router: Router) { }

    onSubmit(form: NgForm): void {
        if (form.invalid) return;
        this.loading = true;
        this.errorMsg = '';

        this.auth.register({
            fullName: form.value.fullName,
            email: form.value.email,
            password: form.value.password
        }).subscribe({
            next: () => this.router.navigate(['/']),
            error: (err) => {
                this.errorMsg = err.error?.message || 'Registration failed. Please try again.';
                this.loading = false;
            }
        });
    }
}
