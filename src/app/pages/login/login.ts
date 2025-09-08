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
    <section class="min-h-screen grid lg:grid-cols-2">
      <div class="hidden lg:flex bg-indigo-600 text-white p-12 flex-col justify-between">
        <div><h1 class="text-3xl font-bold tracking-wider">MyAgenda</h1></div>
        <div class="max-w-md">
          <h2 class="text-4xl font-bold mb-4">Bienvenido de nuevo</h2>
          <p class="text-indigo-200 text-lg">Gestiona tus compañías y clientes con un flujo simple y eficiente. Toda tu información, en un solo lugar.</p>
        </div>
        <div class="text-sm text-indigo-300">&copy; 2024 MyAgenda Inc. Todos los derechos reservados.</div>
      </div>
      <div class="w-full flex items-center justify-center p-6 sm:p-12">
        <div class="w-full max-w-md">
          <div class="text-center lg:text-left mb-8">
            <h2 class="text-3xl font-bold text-gray-900">Iniciar sesión en tu cuenta</h2>
            <p class="text-gray-500 mt-2">O <a class="text-indigo-600 hover:text-indigo-500 font-medium">crea una cuenta nueva</a></p>
          </div>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Correo o Nickname</label>
              <input formControlName="identifier" type="text" class="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 p-3" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Contraseña</label>
              <input formControlName="password" type="password" class="mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 p-3" />
            </div>
            <div class="flex items-center justify-between">
              <label class="flex items-center text-sm"><input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /> <span class="ml-2 text-gray-700">Recordarme</span></label>
              <a class="text-sm text-indigo-600 hover:text-indigo-500">¿Olvidaste tu contraseña?</a>
            </div>
            <button type="submit" class="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" [disabled]="form.invalid || loading">{{ loading ? 'Entrando...' : 'Iniciar Sesión' }}</button>
            <p *ngIf="error" class="text-sm text-red-700 bg-red-100 p-2 rounded">{{ error }}</p>
          </form>
        </div>
      </div>
    </section>
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


