import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  weight: number;
  material: string;
  purity: string;
  badge: string;
  features: string[];
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
}

export type CreateProductInput = Omit<Product, 'id' | 'categoryName'>;

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly base = `${environment.apiUrl}/api/products`;

  constructor(private http: HttpClient) {}

  list(opts?: { featured?: boolean; categoryId?: number; search?: string }): Observable<Product[]> {
    const parts: string[] = [];
    if (opts?.featured) parts.push('featured=true');
    if (opts?.categoryId != null) parts.push(`categoryId=${opts.categoryId}`);
    if (opts?.search) parts.push(`search=${encodeURIComponent(opts.search)}`);
    const qs = parts.length ? `?${parts.join('&')}` : '';
    return this.http.get<Product[]>(`${this.base}${qs}`);
  }

  get(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  create(input: CreateProductInput): Observable<Product> {
    return this.http.post<Product>(this.base, input);
  }

  update(id: number, input: CreateProductInput): Observable<Product> {
    return this.http.put<Product>(`${this.base}/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  uploadImage(file: File): Observable<{ imageUrl: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.base}/upload`, form);
  }

  /** Resolve a relative `/uploads/...` URL against the API base; pass external URLs through unchanged. */
  resolveImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('assets/')) {
      return url;
    }
    return `${environment.apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}
