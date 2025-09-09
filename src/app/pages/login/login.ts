import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
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


