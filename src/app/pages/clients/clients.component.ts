import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css'
})
export class ClientsComponent implements OnInit {
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);

  clients: Client[] = [];
  clientForm: FormGroup;
  isModalOpen = false;
  isEditing = false;
  currentClientId: number | null = null;

  showSuccessDialog = false;
  successMessage = '';

  constructor() {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,4}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^09\d{8}$/)]],
      address: ['', [Validators.pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s,.-]{0,60}$/)]],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientService.getClients().subscribe({
      next: (data) => this.clients = data,
      error: (err) => console.error('Error loading clients', err)
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.currentClientId = null;
    this.clientForm.reset({ status: 'Active' });
    this.isModalOpen = true;
  }

  openEditModal(client: Client) {
    this.isEditing = true;
    this.currentClientId = client.id!;
    this.clientForm.patchValue(client);
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveClient() {
    if (this.clientForm.invalid) return;

    const clientData: Client = this.clientForm.value;

    if (this.isEditing && this.currentClientId) {
      this.clientService.updateClient(this.currentClientId, clientData).subscribe({
        next: () => {
          this.loadClients();
          this.closeModal();
          this.showSuccess('Cliente actualizado exitosamente');
        },
        error: (err) => console.error('Error updating client', err)
      });
    } else {
      this.clientService.createClient(clientData).subscribe({
        next: () => {
          this.loadClients();
          this.closeModal();
          this.showSuccess('Cliente creado exitosamente');
        },
        error: (err) => console.error('Error creating client', err)
      });
    }
  }

  deleteClient(id: number) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => this.loadClients(),
        error: (err) => console.error('Error deleting client', err)
      });
    }
  }

  showSuccess(message: string) {
    this.successMessage = message;
    this.showSuccessDialog = true;
  }

  closeSuccessDialog() {
    this.showSuccessDialog = false;
  }
}
