import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderResponse, PlaceOrderRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private readonly API = 'http://localhost:5000/api/orders';

    constructor(private http: HttpClient) { }

    placeOrder(request: PlaceOrderRequest): Observable<OrderResponse> {
        return this.http.post<OrderResponse>(this.API, request);
    }

    getMyOrders(): Observable<OrderResponse[]> {
        return this.http.get<OrderResponse[]>(`${this.API}/my`);
    }
}
