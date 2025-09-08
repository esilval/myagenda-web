import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <main style="max-width:420px;margin:4rem auto;padding:2rem;border:1px solid #e5e7eb;border-radius:8px;">
      <h1 style="margin:0 0 1rem;">Iniciar sesión</h1>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label>Correo o Nickname</label>
        <input formControlName="identifier" type="text" style="width:100%;padding:.5rem;margin:.25rem 0 1rem;" />
        <label>Contraseña</label>
        <input formControlName="password" type="password" style="width:100%;padding:.5rem;margin:.25rem 0 1rem;" />
        <button type="submit" [disabled]="form.invalid || loading" style="padding:.5rem 1rem">Entrar</button>
        <p *ngIf="error" style="color:#b91c1c;margin-top:1rem;">{{ error }}</p>
      </form>
    </main>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  error: string | null = null;

  form = this.fb.nonNullable.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    const { identifier, password } = this.form.getRawValue();
    this.auth.login(identifier, password).subscribe({
      next: (res) => {
        this.auth.saveToken(res.access_token);
        this.auth.me().subscribe({
          next: (u) => {
            this.auth.setUser(u);
            this.router.navigateByUrl('/');
          },
          error: () => {
            this.error = 'No se pudo cargar el perfil';
            this.loading = false;
          },
        });
      },
      error: (err) => {
        this.error = (err?.error?.error as string) || 'Credenciales inválidas';
        this.loading = false;
      },
    });
  }
}


