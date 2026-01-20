import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientsComponent } from './clients.component';
import { ClientService } from '../../services/client.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ClientsComponent', () => {
  let component: ClientsComponent;
  let fixture: ComponentFixture<ClientsComponent>;
  let mockClientService: any;

  beforeEach(async () => {
    mockClientService = {
      getClients: jasmine.createSpy('getClients').and.returnValue(of([])),
      createClient: jasmine.createSpy('createClient').and.returnValue(of({})),
      updateClient: jasmine.createSpy('updateClient').and.returnValue(of({})),
      deleteClient: jasmine.createSpy('deleteClient').and.returnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [ClientsComponent, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [
        { provide: ClientService, useValue: mockClientService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clientForm should be invalid when empty', () => {
    expect(component.clientForm.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    const emailControl = component.clientForm.controls['email'];
    emailControl.setValue('invalid-email');
    expect(emailControl.valid).toBeFalsy();
    emailControl.setValue('valid@example.com');
    expect(emailControl.valid).toBeTruthy();
  });

  it('should validate phone format (starts with 09 and 10 digits)', () => {
    const phoneControl = component.clientForm.controls['phone'];
    phoneControl.setValue('1234567890'); // Invalid start
    expect(phoneControl.valid).toBeFalsy();
    phoneControl.setValue('0999999999'); // Valid
    expect(phoneControl.valid).toBeTruthy();
  });

  it('should call createClient when saving a new client', () => {
    component.openCreateModal();
    component.clientForm.setValue({
      name: 'Test Client',
      email: 'test@example.com',
      phone: '0999999999',
      address: 'Test Address',
      status: 'Active'
    });
    
    component.saveClient();
    expect(mockClientService.createClient).toHaveBeenCalled();
  });
});
