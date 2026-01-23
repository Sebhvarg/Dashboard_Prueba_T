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

  // Busqueda de clientes
  clientSearchText: string = '';
  filteredClients: Client[] = [];
  showClientDropdown: boolean = false;
  selectedClient: Client | null = null;

  showSuccessDialog = false;
  successMessage = '';

  // Confirm delete dialog
  showConfirmDialog = false;
  pendingDeleteId: number | null = null;


  // Filtros
  filterStatus: StateOrder | '' = '';
  filterClientId: number | '' = '';
  filterDate: string = '';

  constructor() {
    this.orderForm = this.fb.group({
      clientId: ['', Validators.required],
      totalAmount: [0, [Validators.required, Validators.min(0.01)]],
      status: ['Pending', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
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
    this.clearClientSelection();
    this.isModalOpen = true;
  }

  openEditModal(order: Order) {
    this.isEditing = true;
    this.currentOrderId = order.id!;
    this.orderForm.patchValue({
      clientId: order.clientId,
      totalAmount: order.totalAmount,
      status: order.status,
      description: order.description,
      cantidad: order.cantidad || 1
    });
    this.orderForm.get('status')?.enable(); // Habilitar estado al editar
    this.selectedClient = this.clients.find(c => c.id === order.clientId) || null;
    this.clientSearchText = this.selectedClient?.name || '';
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
          this.showSuccess('Orden actualizada exitosamente');
        },
        error: (err) => console.error('Error updating order', err)
      });
    } else {
      this.orderService.createOrder(orderData).subscribe({
        next: () => {
          this.loadOrders();
          this.closeModal();
          this.showSuccess('Orden creada exitosamente');
        },
        error: (err) => console.error('Error creating order', err)
      });
    }
  }

  deleteOrder(id: number) {
    this.pendingDeleteId = id;
    this.showConfirmDialog = true;
  }

  confirmDelete() {
    if (this.pendingDeleteId) {
      this.orderService.deleteOrder(this.pendingDeleteId).subscribe({
        next: () => {
          this.loadOrders();
          this.pendingDeleteId = null;
          this.showConfirmDialog = false;
          this.showSuccess('Orden eliminada exitosamente');
        },
        error: (err) => console.error('Error deleting order', err)
      });
    }
  }

  cancelDelete() {
    this.pendingDeleteId = null;
    this.showConfirmDialog = false;
  }

  getClientName(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : 'Desconocido';
  }

  // Busqueda de clientes
  filterClients() {
    if (!this.clientSearchText.trim()) {
      this.filteredClients = this.clients;
    } else {
      const searchLower = this.clientSearchText.toLowerCase();
      this.filteredClients = this.clients.filter(client =>
        client.name.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower)
      );
    }
    this.showClientDropdown = true;
  }

  selectClient(client: Client) {
    this.selectedClient = client;
    this.clientSearchText = client.name;
    this.orderForm.patchValue({ clientId: client.id });
    this.showClientDropdown = false;
  }

  clearClientSelection() {
    this.selectedClient = null;
    this.clientSearchText = '';
    this.orderForm.patchValue({ clientId: '' });
    this.filteredClients = this.clients;
    this.showClientDropdown = false;
  }

  onClientInputFocus() {
    this.filteredClients = this.clients;
    this.showClientDropdown = true;
  }

  onClientInputBlur() {
  
    setTimeout(() => {
      this.showClientDropdown = false;
    }, 200);
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessDialog = true;
  }

  closeSuccessDialog() {
    this.showSuccessDialog = false;
  }
}
