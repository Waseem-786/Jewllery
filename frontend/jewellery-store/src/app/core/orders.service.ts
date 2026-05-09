import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PlaceOrderRequest {
  shippingAddress: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: { productId: number; quantity: number }[];
}

export interface OrderResponse {
  id: number;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentProvider: string | null;
  paymentReference: string | null;
  paymentRedirectUrl: string | null;
  paidAt: string | null;
  items: {
    productId: number;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly base = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  place(req: PlaceOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.base, req);
  }

  myOrders(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.base}/my`);
  }

  get(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.base}/${id}`);
  }
}
