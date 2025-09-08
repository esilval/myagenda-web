import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../shared/toast.service';
import { UsersService } from './users.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="container" style="max-width:760px;">
      <h1 style="margin:0 0 1rem;">Perfil</h1>
      <form (ngSubmit)="save()" style="display:grid; grid-template-columns: 1fr 1fr; gap: .75rem;" *ngIf="auth.user() as u">
        <label>Nombre</label>
        <input [(ngModel)]="name" name="name" />
        <label>Nickname</label>
        <input [(ngModel)]="nickname" name="nickname" />
        <label>Empresa</label>
        <input [(ngModel)]="company" name="company" />
        <label>Nueva contraseña</label>
        <input [(ngModel)]="password" name="password" type="password" />
        <div style="grid-column: span 2; display:flex; justify-content:flex-end; gap:.5rem;">
          <button type="button" class="small" (click)="reset(u)">Restablecer</button>
          <button type="submit" class="primary">Guardar</button>
        </div>
      </form>
    </main>
  `,
})
export class ProfilePage {
  readonly auth = inject(AuthService);
  private readonly users = inject(UsersService);
  private readonly toast = inject(ToastService);

  name = '';
  nickname = '';
  company = '';
  password = '';

  ngOnInit() { const u = this.auth.user(); if (u) this.reset(u); }

  reset(u: any) { this.name = u.name || ''; this.nickname = u.nickname || ''; this.company = u.company || ''; this.password = ''; }

  save() {
    const u = this.auth.user(); if (!u) return;
    this.users.update(u.id, { name: this.name, nickname: this.nickname, company: this.company, password: this.password || undefined }).subscribe({
      next: (res) => { this.toast.show('Perfil actualizado', 'success'); this.auth.setUser({ ...u, ...res }); },
      error: (err) => { this.toast.show((err?.error?.error as string) || 'Error actualizando perfil', 'error'); },
    });
  }
}


