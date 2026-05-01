import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; 
import { CartService } from '../../../core/cart';

@Component({
  selector: 'app-cart',
  standalone: true,
    imports: [CommonModule, RouterLink], 
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class Cart {

  constructor(public cartService: CartService) {}
get items() {
  return this.cartService.getItems();
}
  // ✅ total getter
  get total(): number {
    return this.cartService.getItems().reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
confirmRemove(item: any) {
  if (confirm('Remove this item?')) {
    this.cartService.removeItem(item.name);
  }
}
}