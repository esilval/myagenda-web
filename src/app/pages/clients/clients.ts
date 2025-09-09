import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmptyStateComponent } from '../../shared/empty-state';
import { SkeletonComponent } from '../../shared/skeleton';
import { ClientsService, Client, ClientInput } from './clients.service';
import { CompaniesService, Company } from '../companies/companies.service';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent, SkeletonComponent],
  templateUrl: './clients.html',
  styleUrl: './clients.scss',
})
export class ClientsPage {
  private readonly service = inject(ClientsService);
  private readonly companies = inject(CompaniesService);
  private readonly toast = inject(ToastService);

  readonly items = signal<Client[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly size = signal(5);
  readonly q = signal('');
  readonly status = signal<'ACTIVE' | 'INACTIVE' | ''>('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly includeCompany = signal(true);
  readonly maxPage = signal(1);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly companyOptions = signal<Company[]>([]);
  form: ClientInput = { company_id: '', contact_name: '', email: '', phone: '' };

  ngOnInit() { this.fetch(); }

  fetch() {
    this.loading.set(true); this.error.set(null);
    this.service.list({ page: this.page(), size: this.size(), q: this.q() || undefined, status: (this.status() as any) || undefined, include_company: this.includeCompany() })
      .subscribe({
        next: (res) => { this.items.set(res.items); this.total.set(res.total); this.maxPage.set(Math.max(1, Math.ceil(this.total()/this.size()))); this.loading.set(false); },
        error: (err) => { this.error.set((err?.error?.error as string) || 'Error cargando clientes'); this.loading.set(false); }
      });
  }

  openCreate() {
    this.editingId.set(null);
    this.form = { company_id: '', contact_name: '', email: '', phone: '' };
    this.formError.set(null);
    this.showForm.set(true);
    this.loadCompanies();
  }

  startEdit(c: Client) {
    this.editingId.set(c.id);
    this.form = { company_id: c.company_id || '', contact_name: c.contact_name, email: c.email || '', phone: c.phone || '' };
    this.formError.set(null);
    this.showForm.set(true);
    this.loadCompanies();
  }

  loadCompanies() {
    this.companies.list({ page: 1, size: 50, status: 'ACTIVE', q: '' }).subscribe({ next: (res) => this.companyOptions.set(res.items) });
  }

  closeForm() { this.showForm.set(false); }

  submitForm() {
    const id = this.editingId();
    this.saving.set(true);
    this.formError.set(null);
    const obs = id ? this.service.update(id, this.form) : this.service.create(this.form);
    obs.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.fetch(); this.toast.show(id ? 'Cliente actualizado' : 'Cliente creado', 'success'); },
      error: (err) => {
        this.saving.set(false);
        const code = (err?.error?.error as string) || '';
        const msg = code === 'EMAIL_TAKEN' ? 'El email ya está registrado' : code === 'PHONE_TAKEN' ? 'El teléfono ya está registrado' : (code || 'Error guardando');
        this.formError.set(msg);
        this.toast.show(msg, 'error');
      },
    });
  }

  confirmDelete(c: Client) {
    if (!confirm(`Eliminar cliente "${c.contact_name}"?`)) return;
    this.service.delete(c.id).subscribe({ next: () => { this.fetch(); this.toast.show('Cliente eliminado', 'success'); }, error: (err) => {
      const code = (err?.error?.error as string) || '';
      const msg = code || 'No se pudo eliminar';
      this.toast.show(msg, 'error');
    } });
  }

  private searchTimer: any;
  onSearchChange(v: string) {
    this.q.set(v); this.page.set(1);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.fetch(), 300);
  }
  onStatusChange(v: string) { this.status.set(v as any); this.page.set(1); this.fetch(); }
  onIncludeCompanyChange(v: boolean) { this.includeCompany.set(v); this.page.set(1); this.fetch(); }
  changePage(d: number) { const next = this.page()+d; this.page.set(Math.min(Math.max(1,next), this.maxPage())); this.fetch(); }
}


