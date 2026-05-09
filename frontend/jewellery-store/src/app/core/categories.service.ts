import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  productCount: number;
}

export type CreateCategoryInput = Omit<Category, 'id' | 'productCount'>;

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly base = `${environment.apiUrl}/api/categories`;

  constructor(private http: HttpClient) {}

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.base);
  }

  create(input: CreateCategoryInput): Observable<Category> {
    return this.http.post<Category>(this.base, input);
  }

  update(id: number, input: CreateCategoryInput): Observable<Category> {
    return this.http.put<Category>(`${this.base}/${id}`, input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
