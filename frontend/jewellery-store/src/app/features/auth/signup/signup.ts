import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth';
import { ToastService } from '../../../core/toast.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss'],
})
export class Signup {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  readonly busy = signal(false);
  readonly fieldErrors = signal<FieldErrors>({});

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
  ) {}

  get redirect(): string {
    return this.route.snapshot.queryParamMap.get('redirect') || '/';
  }

  get signinLink(): { redirect: string } | null {
    const r = this.route.snapshot.queryParamMap.get('redirect');
    return r ? { redirect: r } : null;
  }

  register(): void {
    if (this.busy()) return;

    const errors: FieldErrors = {};
    const name = this.name.trim();

    if (!name)                                errors.name = 'Please enter your full name.';
    else if (name.length < 2)                 errors.name = 'Name must be at least 2 characters.';
    else if (!/[A-Za-z]/.test(name))          errors.name = 'Name should contain letters.';

    if (!this.email.trim())                   errors.email = 'Email is required.';
    else if (!EMAIL_RE.test(this.email))      errors.email = 'That doesn’t look like a valid email.';

    if (!this.password)                       errors.password = 'Password is required.';
    else if (this.password.length < 8)        errors.password = 'Password must be at least 8 characters.';
    else if (!/[A-Za-z]/.test(this.password) || !/\d/.test(this.password))
                                              errors.password = 'Password must contain both letters and numbers.';

    if (!this.confirmPassword)                errors.confirmPassword = 'Please confirm your password.';
    else if (this.confirmPassword !== this.password)
                                              errors.confirmPassword = 'Passwords do not match.';

    this.fieldErrors.set(errors);
    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors).find(v => !!v)!;
      this.toast.error(first, 'Please check the form');
      return;
    }

    this.busy.set(true);

    this.auth.register(name, this.email.trim(), this.password).subscribe({
      next: () => {
        this.busy.set(false);
        this.toast.success('Account created — welcome.');
        this.router.navigateByUrl(this.redirect);
      },
      error: err => {
        this.busy.set(false);
        const msg = err?.error?.message ?? 'Could not create account. The email may already be registered.';
        this.toast.error(msg, 'Sign up failed');
      },
    });
  }
}
