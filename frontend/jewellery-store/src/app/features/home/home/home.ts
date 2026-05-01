import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/cart';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {

  constructor(private cartService: CartService) {}
  products = [
    {
      name: 'Diamond Ring',
      price: 120000,
      image: 'assets/p1.png',
      hoverImage: 'assets/p1-2.png'
    },
    {
      name: 'Gold Necklace',
      price: 95000,
      image: 'assets/p2.png',
      hoverImage: 'assets/p2-2.png'
    },
    {
      name: 'Luxury Earrings',
      price: 70000,
      image: 'assets/p3.png',
      hoverImage: 'assets/p3-2.png'
    },
    {
      name: 'Wedding Band',
      price: 85000,
      image: 'assets/p4.png',
      hoverImage: 'assets/p4-2.png'
    }
  ];

showToast = false;
private toastTimeout: any;

addToCart(product: any) {
  this.cartService.addToCart(product);

  this.showToast = true;

  clearTimeout(this.toastTimeout);

  this.toastTimeout = setTimeout(() => {
    this.showToast = false;
  }, 2000);
}
}