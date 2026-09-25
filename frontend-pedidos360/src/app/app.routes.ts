import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { roleGuard } from './auth/role.guard';
import { Roles } from './auth/roles';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';

// MsalGuard exige sesión; roleGuard exige el rol (leído del access token)
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [MsalGuard, roleGuard(Roles.ADMIN, Roles.OPERADOR, Roles.CLIENTE)],
  },
  {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [MsalGuard, roleGuard(Roles.ADMIN, Roles.OPERADOR, Roles.CLIENTE)],
  },
  {
    path: 'catalog',
    component: CatalogComponent,
    canActivate: [MsalGuard, roleGuard(Roles.ADMIN, Roles.OPERADOR)],
  },
  { path: 'unauthorized', component: UnauthorizedComponent, canActivate: [MsalGuard] },
  { path: '**', redirectTo: 'dashboard' },
];
