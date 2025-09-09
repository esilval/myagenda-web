import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { authGuard } from './core/auth.guard';
import { ClientsPage } from './pages/clients/clients';
import { CompaniesPage } from './pages/companies/companies';
import { ProfilePage } from './pages/profile/profile';
import { homeResolver } from './pages/home/home.resolver';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: HomeComponent, canActivate: [authGuard], resolve: { dashboard: homeResolver }, runGuardsAndResolvers: 'always' },
  { path: 'clients', component: ClientsPage, canActivate: [authGuard] },
  {
    path: 'clients/:id',
    loadComponent: () => import('./pages/clients/detail').then(m => m.ClientDetailPage),
    canActivate: [authGuard]
  },
  { path: 'companies', component: CompaniesPage, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
