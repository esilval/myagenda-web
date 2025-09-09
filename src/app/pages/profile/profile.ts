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
  templateUrl: './profile.html',
})
export class ProfilePage {
  readonly auth = inject(AuthService);
  private readonly users = inject(UsersService);
  private readonly toast = inject(ToastService);

  name = '';
  nickname = '';
  company = '';
  password = '';
  confirmPassword = '';

  ngOnInit() { const u = this.auth.user(); if (u) this.reset(u); }

  reset(u: any) { this.name = u.name || ''; this.nickname = u.nickname || ''; this.company = u.company || ''; this.password = ''; this.confirmPassword = ''; }

  passwordError(): string | null {
    if (!this.password && !this.confirmPassword) return null; // no cambio
    if (this.password && this.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (this.password !== this.confirmPassword) return 'Las contraseñas no coinciden.';
    return null;
  }

  save() {
    const u = this.auth.user(); if (!u) return;
    const pwdError = this.passwordError();
    if (pwdError) { this.toast.show(pwdError, 'error'); return; }
    this.users.update(u.id, { name: this.name, nickname: this.nickname, company: this.company, password: this.password || undefined }).subscribe({
      next: (res) => { this.toast.show('Perfil actualizado', 'success'); this.auth.setUser({ ...u, ...res }); },
      error: (err) => { this.toast.show((err?.error?.error as string) || 'Error actualizando perfil', 'error'); },
    });
  }
}


