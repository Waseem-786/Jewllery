import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../../core/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class Cart {

  constructor(public cartService: CartService) {}

  inc(item: CartItem): void { this.cartService.increment(item.productId); }
  dec(item: CartItem): void { this.cartService.decrement(item.productId); }

  remove(item: CartItem): void {
    if (typeof window !== 'undefined' && !window.confirm(`Remove "${item.name}" from cart?`)) return;
    this.cartService.removeAll(item.productId);
  }
}
