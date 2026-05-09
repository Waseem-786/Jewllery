import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth';
import { ToastService } from '../../../core/toast.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signin.html',
  styleUrls: ['./signin.scss'],
})
export class Signin {
  email = '';
  password = '';
  readonly busy = signal(false);
  readonly fieldErrors = signal<{ email?: string; password?: string }>({});

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  get redirect(): string {
    return this.route.snapshot.queryParamMap.get('redirect') || '/';
  }

  get signupLink(): { redirect: string } | null {
    const r = this.route.snapshot.queryParamMap.get('redirect');
    return r ? { redirect: r } : null;
  }

  login(): void {
    if (this.busy()) return;

    const errors: { email?: string; password?: string } = {};
    if (!this.email.trim())            errors.email = 'Email is required.';
    else if (!EMAIL_RE.test(this.email)) errors.email = 'That doesn’t look like a valid email.';
    if (!this.password)                errors.password = 'Password is required.';

    this.fieldErrors.set(errors);
    if (Object.keys(errors).length > 0) {
      this.toast.error(Object.values(errors)[0]!, 'Please check the form');
      return;
    }

    this.busy.set(true);

    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        this.busy.set(false);
        this.toast.success('Welcome back.');
        this.router.navigateByUrl(this.redirect);
      },
      error: err => {
        this.busy.set(false);
        const msg = err?.error?.message ?? 'Invalid email or password.';
        this.toast.error(msg, 'Sign in failed');
      },
    });
  }
}
