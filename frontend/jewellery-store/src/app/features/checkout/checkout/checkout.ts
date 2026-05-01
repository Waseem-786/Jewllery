import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/cart';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
})
export class Checkout {

  constructor(public cartService: CartService) {}

  get total() {
    return this.cartService.getItems().reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
}