import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ClientsService } from '../clients/clients.service';
import { CompaniesService } from '../companies/companies.service';
import { forkJoin, map } from 'rxjs';

export interface DashboardData {
  companiesCount: number;
  clientsActive: number;
  clientsInactive: number;
  recentClients: any[];
}

export const homeResolver: ResolveFn<DashboardData> = () => {
  const clients = inject(ClientsService);
  const companies = inject(CompaniesService);

  return forkJoin({
    companies: companies.list({ page: 1, size: 1 }),
    active: clients.list({ page: 1, size: 1, status: 'ACTIVE', include_company: false }),
    inactive: clients.list({ page: 1, size: 1, status: 'INACTIVE', include_company: false }),
    recent: clients.list({ page: 1, size: 50, include_company: true }),
  }).pipe(
    map(({ companies, active, inactive, recent }) => ({
      companiesCount: companies.total,
      clientsActive: active.total,
      clientsInactive: inactive.total,
      recentClients: [...recent.items]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5),
    }))
  );
};


