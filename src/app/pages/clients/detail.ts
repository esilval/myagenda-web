import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientsService, Client } from './clients.service';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="p-6">
      <a routerLink="/clients" class="text-sm text-indigo-600 hover:text-indigo-800">← Volver a Clientes</a>
      <h1 class="text-2xl font-bold text-gray-900 mt-2 mb-6">Detalle de Cliente</h1>

      <div *ngIf="client as c" class="bg-white rounded-lg shadow-sm p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">Nombre</p>
            <p class="text-gray-900 font-medium">{{ c.contact_name }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Compañía</p>
            <p class="text-gray-900 font-medium">{{ c.company?.business_name || '—' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Teléfono</p>
            <p class="text-gray-900 font-medium">{{ c.phone || '—' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Correo</p>
            <p class="text-gray-900 font-medium">{{ c.email || '—' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Estado</p>
            <span [class]="c.status === 'ACTIVE' ? 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800' : 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'">
              {{ c.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <div>
            <p class="text-sm text-gray-500">Creado</p>
            <p class="text-gray-900 font-medium">{{ c.created_at | date:'medium' }}</p>
          </div>
        </div>
      </div>
    </main>
  `,
})
export class ClientDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly clients = inject(ClientsService);

  client: Client | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clients.get(id).subscribe({ next: (c) => (this.client = c) });
    }
  }
}
