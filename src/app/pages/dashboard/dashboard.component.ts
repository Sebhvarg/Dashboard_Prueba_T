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
    rejectedOrders: 0,
    activeClients: 0,
    ordersByDate: []
  };

  currentPeriod: string = '7days';

  onPeriodChange(event: any) {
    this.currentPeriod = event.target.value;
    this.loadStats();
  }

  // Pie Chart Configuration
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top', labels: { color: '#1f2937' } }
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

  // Bar Chart Configuration
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top', labels: { color: '#1f2937' } }
    },
    scales: {
      x: { ticks: { color: '#4B5563' } },
      y: { ticks: { color: '#4B5563' }, beginAtZero: true }
    }
  };
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Pedidos por Día', backgroundColor: '#3B82F6', hoverBackgroundColor: '#2563EB' }
    ]
  };
  public barChartType: ChartType = 'bar';

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.api.get(`Orders/stats?period=${this.currentPeriod}`).subscribe({
      next: (data: any) => {
        this.stats = data;
        this.updateCharts();
      },
      error: (err) => console.error('Error loading stats', err)
    });
  }

  updateCharts() {
    // Update Pie Chart
    this.pieChartData = {
      ...this.pieChartData,
      datasets: [{
        ...this.pieChartData.datasets[0],
        data: [
          this.stats.pendingOrders,
          this.stats.completedOrders, // Nota: Backend devuelve 'CompletedOrders' que es 'Approved'
          this.stats.rejectedOrders
        ]
      }]
    };

    // Update Bar Chart
    const dates = this.stats.ordersByDate.map((item: any) => new Date(item.date).toLocaleDateString());
    const counts = this.stats.ordersByDate.map((item: any) => item.count);

    this.barChartData = {
      labels: dates,
      datasets: [{
        ...this.barChartData.datasets[0],
        data: counts
      }]
    };
  }
}
