import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/cart';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class Products {

  constructor(private cartService: CartService) {}

  selectedCategory: string = 'all';

  products = [
    {
      name: 'Diamond Ring',
      price: 120000,
      category: 'ring',
      image: 'assets/p1.png',
      badge: 'ROYAL',
      description: 'A timeless diamond ring crafted with exceptional precision and designed to symbolize elegance, commitment, and brilliance.',
      features: ['18K Gold', 'Certified Diamond', 'Handcrafted Finish']
    },
    {
      name: 'Gold Necklace',
      price: 95000,
      category: 'necklace',
      image: 'assets/p2.png',
      badge: 'PREMIUM',
      description: 'An elegant necklace blending traditional artistry with modern sophistication for a refined appearance.',
      features: ['22K Gold', 'Lightweight', 'Premium Polish']
    },
    {
      name: 'Luxury Earrings',
      price: 70000,
      category: 'earring',
      image: 'assets/p3.png',
      badge: 'SIGNATURE',
      description: 'Minimal yet luxurious earrings designed for everyday elegance and comfort.',
      features: ['Gold Plated', 'Skin Safe', 'Hand Polished']
    },
    {
      name: 'Wedding Band',
      price: 85000,
      category: 'ring',
      image: 'assets/p4.png',
      badge: 'ROYAL',
      description: 'A refined wedding band symbolizing unity, strength, and timeless beauty.',
      features: ['18K Gold', 'Comfort Fit', 'Matte Finish']
    },
    {
      name: 'Emerald Pendant',
      price: 78000,
      category: 'necklace',
      image: 'assets/p2.png',
      badge: 'PREMIUM',
      description: 'A graceful pendant with gemstone detailing for a sophisticated and elegant look.',
      features: ['Gemstone', 'Fine Finish', 'Elegant Design']
    },
    {
      name: 'Stud Earrings',
      price: 45000,
      category: 'earring',
      image: 'assets/p3.png',
      badge: 'SIGNATURE',
      description: 'Classic stud earrings with modern detailing for subtle luxury.',
      features: ['Polished Gold', 'Comfort Wear', 'Lightweight']
    },
    {
      name: 'Platinum Ring',
      price: 150000,
      category: 'ring',
      image: 'assets/p1.png',
      badge: 'ROYAL',
      description: 'A premium platinum ring designed for those who appreciate rare elegance and durability.',
      features: ['Platinum', 'High Durability', 'Luxury Finish']
    },
    {
      name: 'Layered Necklace',
      price: 67000,
      category: 'necklace',
      image: 'assets/p2.png',
      badge: 'PREMIUM',
      description: 'A modern layered necklace crafted to create a bold and elegant statement.',
      features: ['Layered Style', 'Lightweight', 'Stylish Finish']
    }
  ];

  get filteredProducts() {
    if (this.selectedCategory === 'all') return this.products;
    return this.products.filter(p => p.category === this.selectedCategory);
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
  }

  addToCart(product: any) {
    this.cartService.addToCart(product);
  }
}