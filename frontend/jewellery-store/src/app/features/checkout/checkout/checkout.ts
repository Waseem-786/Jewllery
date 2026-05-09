import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/cart';
import { OrderService } from '../../../core/orders.service';
import { AuthService } from '../../../core/auth';
import { ToastService } from '../../../core/toast.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s\-]{7,20}$/;

interface CheckoutForm {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postal: string;
  country: string;
}

interface FieldErrors {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  address?: string;
  city?: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
})
export class Checkout implements OnInit {

  readonly placing = signal(false);
  readonly fieldErrors = signal<FieldErrors>({});

  form: CheckoutForm = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    city: '',
    postal: '',
    country: 'Pakistan',
  };

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    private auth: AuthService,
    private router: Router,
    private toast: ToastService,
  ) {}

  get total(): number {
    return this.cartService.getItems().reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  ngOnInit(): void {
    const a = this.auth.auth();
    if (a) {
      this.form.customerName  = a.fullName;
      this.form.customerEmail = a.email;
    }
  }

  validate(): FieldErrors {
    const errors: FieldErrors = {};
    const f = this.form;

    if (!f.customerName.trim())                    errors.customerName  = 'Full name is required.';
    else if (f.customerName.trim().length < 2)     errors.customerName  = 'Please enter your full name.';

    if (!f.customerEmail.trim())                   errors.customerEmail = 'Email is required.';
    else if (!EMAIL_RE.test(f.customerEmail))      errors.customerEmail = 'Enter a valid email address.';

    if (!f.customerPhone.trim())                   errors.customerPhone = 'Phone is required.';
    else if (!PHONE_RE.test(f.customerPhone))      errors.customerPhone = 'Enter a valid phone number (digits, spaces, optional +).';

    if (!f.address.trim())                         errors.address       = 'Shipping address is required.';
    else if (f.address.trim().length < 5)          errors.address       = 'Please enter your full street address.';

    if (!f.city.trim())                            errors.city          = 'City is required.';

    return errors;
  }

  placeOrder(): void {
    if (this.placing()) return;

    const errors = this.validate();
    this.fieldErrors.set(errors);
    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors).find(v => !!v)!;
      this.toast.error(first, 'Please complete the form');
      return;
    }

    if (!this.auth.isLoggedIn()) {
      this.toast.info('Please sign in to complete your purchase.', 'Sign in required');
      this.router.navigate(['/signin'], { queryParams: { redirect: '/checkout' } });
      return;
    }

    const items = this.cartService.getItems();
    if (items.length === 0) {
      this.toast.error('Your cart is empty. Add a piece before checking out.');
      return;
    }
    const missingId = items.find(i => !i.productId);
    if (missingId) {
      this.toast.error(`Item "${missingId.name}" is missing a product reference. Please re-add it from the shop.`);
      return;
    }

    this.placing.set(true);

    const f = this.form;
    const shippingAddress = `${f.address.trim()}, ${f.city.trim()}${f.postal ? ', ' + f.postal.trim() : ''}${f.country ? ', ' + f.country.trim() : ''}`;

    this.orderService.place({
      shippingAddress,
      customerName:  f.customerName.trim(),
      customerEmail: f.customerEmail.trim(),
      customerPhone: f.customerPhone.trim(),
      items: items.map(i => ({ productId: i.productId!, quantity: i.quantity })),
    }).subscribe({
      next: order => {
        this.cartService.clearCart();
        this.toast.success('Order placed — redirecting to payment.');

        if (order.paymentRedirectUrl && typeof window !== 'undefined') {
          window.location.href = order.paymentRedirectUrl;
          return;
        }
        this.router.navigate(['/order/success', order.id]);
      },
      error: err => {
        this.placing.set(false);
        const msg = err?.error?.message ?? 'Could not place your order. Please try again.';
        this.toast.error(msg, 'Order failed');
      },
    });
  }
}
