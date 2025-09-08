import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf],
  template: `
    <main style="padding:2rem; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, Apple Color Emoji, Segoe UI Emoji;">
      <h1>Dashboard</h1>
      <p>Bienvenido a MyAgenda.</p>
      <section *ngIf="auth.currentUser as u" style="margin-top:1rem;">
        <h3>Usuario</h3>
        <ul>
          <li><strong>Nombre:</strong> {{ u.name }}</li>
          <li><strong>Email:</strong> {{ u.email }}</li>
          <li><strong>Estado:</strong> {{ u.status }}</li>
          <li><strong>Empresa:</strong> {{ u.company || 'N/A' }}</li>
        </ul>
      </section>
    </main>
  `,
  styles: ``
})
export class HomeComponent {
  readonly auth = inject(AuthService);
}
