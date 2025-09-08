import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  template: `
    <main style="padding:2rem; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, Apple Color Emoji, Segoe UI Emoji;">
      <h1>MyAgenda Web</h1>
      <p>Frontend inicial en Angular listo para desarrollo.</p>
    </main>
  `,
  styles: ``
})
export class HomeComponent {}
