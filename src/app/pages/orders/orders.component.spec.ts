import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdersComponent } from './orders.component';
import { OrderService } from '../../services/order.service';
import { ClientService } from '../../services/client.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('OrdersComponent', () => {
  let component: OrdersComponent;
  let fixture: ComponentFixture<OrdersComponent>;
  let mockOrderService: any;
  let mockClientService: any;

  beforeEach(async () => {
    mockOrderService = {
      getOrders: jasmine.createSpy('getOrders').and.returnValue(of([])),
      createOrder: jasmine.createSpy('createOrder').and.returnValue(of({})),
      updateOrder: jasmine.createSpy('updateOrder').and.returnValue(of({})),
      deleteOrder: jasmine.createSpy('deleteOrder').and.returnValue(of({}))
    };

    mockClientService = {
      getClients: jasmine.createSpy('getClients').and.returnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [OrdersComponent, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
        { provide: ClientService, useValue: mockClientService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('openCreateModal debería establecer el estado predeterminado en Pendiente y deshabilitarlo', () => {
    component.openCreateModal();
    const statusControl = component.orderForm.get('status');
    expect(component.isEditing).toBeFalsy();
    expect(statusControl?.value).toBe('Pending');
    expect(statusControl?.disabled).toBeTruthy();
  });

  it('Debería habilitar el control de estado', () => {
    const mockOrder: any = { id: 1, clientId: 1, totalAmount: 100, status: 'Pending' };
    component.openEditModal(mockOrder);
    const statusControl = component.orderForm.get('status');
    expect(component.isEditing).toBeTruthy();
    expect(statusControl?.disabled).toBeFalsy();
  });

  it('Debería validar el totalAmount (debe ser positivo)', () => {
    const amountControl = component.orderForm.controls['totalAmount'];
    amountControl.setValue(0);
    expect(amountControl.invalid).toBeTruthy();
    amountControl.setValue(10);
    expect(amountControl.valid).toBeTruthy();
  });

  it('Debería llamar a createOrder al guardar una nueva orden', () => {
    component.openCreateModal();
    component.orderForm.setValue({
      clientId: 1,
      totalAmount: 100,
      status: 'Pending',
      description: 'Test Order',
      cantidad: 1
    });
    
    component.saveOrder();
    expect(mockOrderService.createOrder).toHaveBeenCalled();
  });
});
