import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  
  stats: any = {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    rejectedOrders: 0
  };

  // Chart Configuration
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: '#1f2937' }
      }
    }
  };
  public pieChartData: ChartData<'doughnut', number[], string | string[]> = {
    labels: [ 'Pendientes', 'Aprobadas', 'Rechazadas' ],
    datasets: [ {
      data: [ 0, 0, 0 ],
      backgroundColor: ['#FBBF24', '#10B981', '#EF4444'],
      hoverBackgroundColor: ['#F59E0B', '#059669', '#DC2626'],
      borderColor: '#ffffff',
      hoverBorderColor: '#ffffff'
    } ]
  };
  public pieChartType: ChartType = 'doughnut';

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.api.get('Orders/stats').subscribe({
      next: (data: any) => {
        this.stats = data;
        this.updateChart();
      },
      error: (err) => console.error('Error loading stats', err)
    });
  }

  updateChart() {
    this.pieChartData = {
      ...this.pieChartData,
      datasets: [{
        ...this.pieChartData.datasets[0],
        data: [
          this.stats.pendingOrders,
          this.stats.approvedOrders,
          this.stats.rejectedOrders
        ]
      }]
    };
  }
}
