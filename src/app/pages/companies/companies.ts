import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompaniesService, Company, CompanyInput } from './companies.service';
import { ToastService } from '../../shared/toast.service';
import { EmptyStateComponent } from '../../shared/empty-state';
import { SkeletonComponent } from '../../shared/skeleton';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent, SkeletonComponent],
  templateUrl: './companies.html',
  styleUrl: './companies.scss',
})
export class CompaniesPage {
  private readonly service = inject(CompaniesService);
  private readonly toast = inject(ToastService);

  readonly items = signal<Company[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly size = signal(5);
  readonly q = signal('');
  readonly status = signal<'ACTIVE' | 'INACTIVE' | ''>('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly maxPage = signal(1);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  form: CompanyInput = { nit: '', business_name: '', city: '', phone: '', address: '', description: '' };

  ngOnInit() {
    this.fetch();
  }

  fetch() {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .list({ page: this.page(), size: this.size(), q: this.q() || undefined, status: (this.status() as any) || undefined })
      .subscribe({
        next: (res) => {
          this.items.set(res.items);
          this.total.set(res.total);
          this.maxPage.set(Math.max(1, Math.ceil(this.total() / this.size())));
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set((err?.error?.error as string) || 'Error cargando compañías');
          this.loading.set(false);
        },
      });
  }

  private searchTimer: any;
  onSearchChange(value: string) {
    this.q.set(value);
    this.page.set(1);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.fetch(), 300);
  }

  onStatusChange(value: string) {
    this.status.set(value as any);
    this.page.set(1);
    this.fetch();
  }

  changePage(delta: number) {
    const next = this.page() + delta;
    this.page.set(Math.min(Math.max(1, next), this.maxPage()));
    this.fetch();
  }

  openCreate() {
    this.editingId.set(null);
    this.form = { nit: '', business_name: '', city: '', phone: '', address: '', description: '' };
    this.formError.set(null);
    this.showForm.set(true);
  }

  startEdit(c: Company) {
    this.editingId.set(c.id);
    this.form = { nit: c.nit, business_name: c.business_name, city: c.city || '', phone: c.phone || '', address: c.address || '', description: c.description || '' };
    this.formError.set(null);
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  submitForm() {
    const id = this.editingId();
    this.saving.set(true);
    this.formError.set(null);
    const obs = id ? this.service.update(id, this.form) : this.service.create(this.form);
    obs.subscribe({
      next: () => { this.saving.set(false); this.showForm.set(false); this.fetch(); this.toast.show(id ? 'Compañía actualizada' : 'Compañía creada', 'success'); },
      error: (err) => {
        this.saving.set(false);
        const code = (err?.error?.error as string) || '';
        const msg = code === 'NIT_TAKEN' ? 'El NIT ya está registrado' : (code || 'Error guardando');
        this.formError.set(msg);
        this.toast.show(msg, 'error');
      },
    });
  }

  confirmDelete(c: Company) {
    if (!confirm(`Eliminar compañía "${c.business_name}"?`)) return;
    this.service.delete(c.id).subscribe({ next: () => { this.fetch(); this.toast.show('Compañía eliminada', 'success'); }, error: (err) => {
      const code = (err?.error?.error as string) || '';
      const msg = code || 'No se pudo eliminar';
      this.toast.show(msg, 'error');
    } });
  }
}


