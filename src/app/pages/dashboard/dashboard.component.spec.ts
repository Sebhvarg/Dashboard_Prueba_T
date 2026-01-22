import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ApiService } from '../../services/api.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgChartsModule } from 'ng2-charts';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockApiService: any;

  beforeEach(async () => {
    mockApiService = {
      get: jasmine.createSpy('get').and.returnValue(of({
        totalOrders: 10,
        completedOrders: 5,
        pendingOrders: 3,
        rejectedOrders: 2,
        activeClients: 8,
        totalRevenue: 1000,
        ordersByDate: []
      }))
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule, NgChartsModule],
      providers: [
        { provide: ApiService, useValue: mockApiService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Debería Crearse', () => {
    expect(component).toBeTruthy();
  });

  it('Debería cargar las estadísticas', () => {
    expect(mockApiService.get).toHaveBeenCalledWith('Orders/stats');
    expect(component.stats.totalOrders).toBe(10);
  });
});
