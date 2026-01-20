import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { ClientService } from '../../services/client.service';
import { Order, StateOrder } from '../../models/order.model';
import { Client } from '../../models/client.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  clients: Client[] = [];
  orderForm: FormGroup;
  isModalOpen = false;
  isEditing = false;
  currentOrderId: number | null = null;

  // Filters
  filterStatus: StateOrder | '' = '';
  filterClientId: number | '' = '';
  filterDate: string = '';

  constructor() {
    this.orderForm = this.fb.group({
      clientId: ['', Validators.required],
      totalAmount: [0, [Validators.required, Validators.min(0.01)]],
      status: ['Pending', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadOrders();
    this.loadClients();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.applyFilters();
      },
      error: (err) => console.error('Error loading orders', err)
    });
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (data) => this.clients = data,
      error: (err) => console.error('Error loading clients', err)
    });
  }

  applyFilters() {
    this.filteredOrders = this.orders.filter(order => {
      let matchesStatus = true;
      let matchesClient = true;
      let matchesDate = true;

      if (this.filterStatus) {
        matchesStatus = order.status === this.filterStatus;
      }

      if (this.filterClientId) {
        matchesClient = order.clientId === Number(this.filterClientId);
      }

      if (this.filterDate) {
        // Asumiendo orderDate es string ISO
        const orderDate = new Date(order.orderDate!).toISOString().split('T')[0];
        matchesDate = orderDate === this.filterDate;
      }

      return matchesStatus && matchesClient && matchesDate;
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.currentOrderId = null;
    this.orderForm.reset({ status: 'Pending', totalAmount: 0 });
    this.orderForm.get('status')?.disable(); // Deshabilitar estado al crear
    this.isModalOpen = true;
  }

  openEditModal(order: Order) {
    this.isEditing = true;
    this.currentOrderId = order.id!;
    this.orderForm.patchValue({
      clientId: order.clientId,
      totalAmount: order.totalAmount,
      status: order.status,
      description: order.description
    });
    this.orderForm.get('status')?.enable(); // Habilitar estado al editar
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveOrder() {
    if (this.orderForm.invalid) return;

    const orderData: Order = {
      ...this.orderForm.getRawValue(),
      clientId: Number(this.orderForm.value.clientId)
    };

    if (this.isEditing && this.currentOrderId) {
      orderData.id = this.currentOrderId;
      this.orderService.updateOrder(this.currentOrderId, orderData).subscribe({
        next: () => {
          this.loadOrders();
          this.closeModal();
        },
        error: (err) => console.error('Error updating order', err)
      });
    } else {
      this.orderService.createOrder(orderData).subscribe({
        next: () => {
          this.loadOrders();
          this.closeModal();
        },
        error: (err) => console.error('Error creating order', err)
      });
    }
  }

  deleteOrder(id: number) {
    if (confirm('¿Estás seguro de eliminar este pedido?')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => this.loadOrders(),
        error: (err) => console.error('Error deleting order', err)
      });
    }
  }

  getClientName(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : 'Desconocido';
  }
}
