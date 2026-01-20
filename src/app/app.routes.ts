import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LayoutComponent } from './components/layout/layout.component';
import { authGuard } from './guards/auth.guard';
import { ClientsComponent } from './pages/clients/clients.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { ProductsComponent } from './pages/products/products.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent }, // /dashboard
      { path: 'clients', component: ClientsComponent },     // /clients
      { path: 'orders', component: OrdersComponent },       // /orders
      { path: 'products', component: ProductsComponent },   // /products
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' } // default to dashboard
    ]
  },
  { path: '**', redirectTo: 'login' }
];
