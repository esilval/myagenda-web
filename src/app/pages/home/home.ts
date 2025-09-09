import { Component, inject, OnDestroy } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { ClientsService } from '../clients/clients.service';
import { CompaniesService } from '../companies/companies.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, Subscription, forkJoin } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Client } from '../clients/clients.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styles: ``
})
export class HomeComponent implements OnDestroy {
  readonly auth = inject(AuthService);
  private readonly clients = inject(ClientsService);
  private readonly companies = inject(CompaniesService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private navSub?: Subscription;

  companiesCount = 0;
  clientsActive = 0;
  clientsInactive = 0;
  recentClients: Client[] = [];

  private clientsStatusChart?: Chart;
  private summaryChart?: Chart;
  private newClientsChart?: Chart;

  ngOnInit() {
    const data = this.route.snapshot.data['dashboard'];
    if (data) {
      this.companiesCount = data.companiesCount;
      this.clientsActive = data.clientsActive;
      this.clientsInactive = data.clientsInactive;
      this.recentClients = data.recentClients;
      this.updateCharts();
    } else {
      this.reloadData();
    }
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
    Chart.register(...registerables, ChartDataLabels);

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
      const maxVal = Math.max(...counts);
      const yMax = maxVal === 0 ? 1 : Math.ceil(maxVal * 1.3);
      const barColors = counts.map(v => (v === maxVal ? '#4F46E5' : 'rgba(99,102,241,0.25)'));

      this.newClientsChart = new Chart(newClientsCanvas.getContext('2d')!, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Nuevos',
            data: counts,
            backgroundColor: barColors,
            borderRadius: 14,
            borderSkipped: 'bottom',
            barPercentage: 0.75,
            categoryPercentage: 0.75,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
            datalabels: {
              display: (ctx) => ctx.dataset.data[ctx.dataIndex] === maxVal,
              color: '#4F46E5',
              anchor: 'end',
              align: 'end',
              offset: 8,
              font: { weight: 'bold' },
              formatter: (v) => (v ? String(v) : ''),
            },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#9CA3AF' } },
            y: { grid: { display: false }, ticks: { display: false }, beginAtZero: true, suggestedMax: yMax },
          },
        }
      });
    }
  }
}
