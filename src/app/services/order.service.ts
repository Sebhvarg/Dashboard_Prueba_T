import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Order, StateOrder } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private api = inject(ApiService);
  private endpoint = 'Orders';

  getOrders(): Observable<Order[]> {
    return this.api.get<Order[]>(this.endpoint);
  }

  getOrdersByStatus(status: StateOrder): Observable<Order[]> {
    return this.api.get<Order[]>(`${this.endpoint}/filter/${status}`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.api.post<Order>(this.endpoint, order);
  }

  updateOrder(id: number, order: Order): Observable<void> {
    return this.api.put<void>(`${this.endpoint}/${id}`, order);
  }

  deleteOrder(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  getStats(): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/stats`);
  }
}
