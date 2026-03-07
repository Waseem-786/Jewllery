import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Product } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private readonly API = 'http://localhost:5000/api';

    constructor(private http: HttpClient) { }

    getProducts(filters?: { categoryId?: number; search?: string; featured?: boolean }): Observable<Product[]> {
        let params = new HttpParams();
        if (filters?.categoryId) params = params.set('categoryId', filters.categoryId);
        if (filters?.search) params = params.set('search', filters.search);
        if (filters?.featured !== undefined) params = params.set('featured', filters.featured);
        return this.http.get<Product[]>(`${this.API}/products`, { params });
    }

    getProduct(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.API}/products/${id}`);
    }

    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.API}/categories`);
    }
}
