import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse, Order, OrderStatus } from './models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.api.baseUrl}/api/orders`;

  // El BFF decide según el rol: Cliente recibe solo sus pedidos
  getAll(): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(this.url).pipe(map((res) => res.data ?? []));
  }

  // El customerId lo asigna el BFF desde el token
  create(productId: number, quantity: number): Observable<Order> {
    return this.http
      .post<ApiResponse<Order>>(this.url, { productId, quantity })
      .pipe(map((res) => res.data));
  }

  changeStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http
      .put<ApiResponse<Order>>(`${this.url}/${id}/status`, { status })
      .pipe(map((res) => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/${id}`).pipe(map(() => undefined));
  }
}
