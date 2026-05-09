import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export interface AdminOrderItem {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface AdminOrder {
  id: number;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentProvider: string | null;
  paymentReference: string | null;
  paymentRedirectUrl: string | null;
  paidAt: string | null;
  userId: number;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  items: AdminOrderItem[];
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

export interface DailyRevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: number;
  name: string;
  imageUrl: string;
  quantitySold: number;
  revenue: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  imageUrl: string;
  stock: number;
  categoryName: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalCategories: number;
  totalRevenue: number;
  pendingRevenue: number;
  lowStockCount: number;
  ordersLast7Days: number;
  revenueLast7Days: number;
  orderStatusCounts: Record<string, number>;
  paymentStatusCounts: Record<string, number>;
  revenueSeries: DailyRevenuePoint[];
  topProducts: TopProduct[];
  recentOrders: AdminOrder[];
  lowStockProducts: LowStockProduct[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  dashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/dashboard`);
  }

  orders(filter?: { status?: string; search?: string }): Observable<AdminOrder[]> {
    const params: Record<string, string> = {};
    if (filter?.status && filter.status !== 'All') params['status'] = filter.status;
    if (filter?.search) params['search'] = filter.search;
    return this.http.get<AdminOrder[]>(`${this.base}/orders`, { params });
  }

  updateStatus(id: number, status: OrderStatus): Observable<AdminOrder> {
    return this.http.patch<AdminOrder>(`${this.base}/orders/${id}/status`, { status });
  }

  users(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.base}/users`);
  }
}
