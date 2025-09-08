import { Component, inject, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ClientsService } from '../clients/clients.service';
import { CompaniesService } from '../companies/companies.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, Subscription, forkJoin } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Client } from '../clients/clients.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div class="bg-indigo-100 p-3 rounded-full">
            <svg class="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Compañías</p>
            <p class="text-3xl font-bold text-gray-900">{{ companiesCount }}</p>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div class="bg-green-100 p-3 rounded-full">
            <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Clientes Activos</p>
            <p class="text-3xl font-bold text-gray-900">{{ clientsActive }}</p>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm flex items-center">
          <div class="bg-red-100 p-3 rounded-full">
            <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Clientes Inactivos</p>
            <p class="text-3xl font-bold text-gray-900">{{ clientsInactive }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div class="bg-white p-6 rounded-lg shadow-sm overflow-hidden">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Clientes Recientes</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Cliente</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compañía</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th class="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200" *ngIf="recentClients.length > 0; else emptyRecent">
                <tr *ngFor="let c of recentClients">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ c.contact_name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ c.company?.business_name || '—' }}</td>
                  <td class="px-4 py-3">
                    <span [class]="c.status === 'ACTIVE' ? 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800' : 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'">
                      {{ c.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right"><a [routerLink]="['/clients', c.id]" class="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Ver</a></td>
                </tr>
              </tbody>
            </table>
            <ng-template #emptyRecent>
              <div class="text-sm text-gray-500 px-4 py-6">No hay clientes recientes.</div>
            </ng-template>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Nuevos Clientes (Últimos 6 meses)</h3>
          <canvas id="newClientsChart" height="220"></canvas>
        </div>
      </div>
    </main>
  `,
  styles: ``
})
export class HomeComponent implements OnDestroy {
  readonly auth = inject(AuthService);
  private readonly clients = inject(ClientsService);
  private readonly companies = inject(CompaniesService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly router = inject(Router);
  private navSub?: Subscription;

  companiesCount = 0;
  clientsActive = 0;
  clientsInactive = 0;
  recentClients: Client[] = [];

  private clientsStatusChart?: Chart;
  private summaryChart?: Chart;
  private newClientsChart?: Chart;

  ngOnInit() {
    this.reloadData();
    this.navSub = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      // Revisa la URL actual tras la navegación
      const urlNow = this.router.url;
      if (urlNow === '/' || urlNow === '') {
        this.reloadData(true);
      }
    });
  }

  ngOnDestroy(): void {
    this.clientsStatusChart?.destroy();
    this.summaryChart?.destroy();
    this.newClientsChart?.destroy();
    this.navSub?.unsubscribe();
  }

  private reloadData(resetCharts: boolean = false) {
    if (resetCharts) {
      this.clientsStatusChart?.destroy();
      this.summaryChart?.destroy();
      this.newClientsChart?.destroy();
    }
    forkJoin({
      companies: this.companies.list({ page:1, size:1 }),
      active: this.clients.list({ page:1, size:1, status:'ACTIVE', include_company:false }),
      inactive: this.clients.list({ page:1, size:1, status:'INACTIVE', include_company:false }),
      recent: this.clients.list({ page:1, size:50, include_company:true })
    }).subscribe(({ companies, active, inactive, recent }) => {
      this.companiesCount = companies.total;
      this.clientsActive = active.total;
      this.clientsInactive = inactive.total;
      this.recentClients = [...recent.items]
        .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      this.updateCharts();
    });
  }

  private updateCharts(): void {
    if (!this.isBrowser) return;

    // Registrar todo lo necesario de Chart.js (controladores, escalas, elementos, etc.)
    Chart.register(...registerables);

    const statusCanvas = document.getElementById('clientsStatusChart') as HTMLCanvasElement | null;
    const summaryCanvas = document.getElementById('summaryChart') as HTMLCanvasElement | null;
    const newClientsCanvas = document.getElementById('newClientsChart') as HTMLCanvasElement | null;

    if (statusCanvas) {
      this.clientsStatusChart?.destroy();
      const cfg: ChartConfiguration<'doughnut'> = {
        type: 'doughnut',
        data: {
          labels: ['Activos', 'Inactivos'],
          datasets: [{ data: [this.clientsActive, this.clientsInactive], backgroundColor: ['#10B981', '#EF4444'] }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
      };
      this.clientsStatusChart = new Chart(statusCanvas.getContext('2d')!, cfg);
    }

    if (summaryCanvas) {
      this.summaryChart?.destroy();
      const cfg2: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels: ['Compañías', 'Clientes Activos', 'Clientes Inactivos'],
          datasets: [{
            label: 'Total',
            data: [this.companiesCount, this.clientsActive, this.clientsInactive],
            backgroundColor: ['#6366F1', '#10B981', '#EF4444']
          }]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
          plugins: { legend: { display: false } }
        }
      };
      this.summaryChart = new Chart(summaryCanvas.getContext('2d')!, cfg2);
    }

    if (newClientsCanvas) {
      this.newClientsChart?.destroy();
      const now = new Date();
      const labels: string[] = [];
      const counts: number[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleString('es-ES', { month: 'short' });
        labels.push(label);
        counts.push(0);
      }
      // contar clientes por mes (creados) en los últimos 6 meses
      const allForWindow = this.recentClients; // ya tenemos 50 recientes; suficiente para demo
      allForWindow.forEach(c => {
        const cd = new Date(c.created_at);
        const diffMonths = (now.getFullYear() - cd.getFullYear()) * 12 + (now.getMonth() - cd.getMonth());
        if (diffMonths >= 0 && diffMonths <= 5) {
          const idx = 5 - diffMonths;
          counts[idx] += 1;
        }
      });
      this.newClientsChart = new Chart(newClientsCanvas.getContext('2d')!, {
        type: 'bar',
        data: {
          labels,
          datasets: [{ label: 'Nuevos', data: counts, backgroundColor: '#4F46E5' }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
      });
    }
  }
}
