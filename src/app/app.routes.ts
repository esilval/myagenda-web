import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { authGuard } from './core/auth.guard';
import { ClientsPage } from './pages/clients/clients';
import { CompaniesPage } from './pages/companies/companies';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'clients', component: ClientsPage, canActivate: [authGuard] },
  { path: 'companies', component: CompaniesPage, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
