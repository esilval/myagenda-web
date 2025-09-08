import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty">
      <div class="icon" aria-hidden="true">🗂️</div>
      <h3>{{ title }}</h3>
      <p class="desc">{{ description }}</p>
      <button *ngIf="ctaText" class="primary" (click)="cta.emit()">{{ ctaText }}</button>
    </div>
  `,
  styles: [
    `
    .empty { text-align: center; padding: 2.5rem 1rem; color: var(--muted); }
    .icon { font-size: 2rem; margin-bottom: .5rem; }
    h3 { margin: .25rem 0; color: var(--text); }
    .desc { margin: 0 0 1rem; }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() title = 'Sin registros';
  @Input() description = 'Empieza creando un nuevo elemento.';
  @Input() ctaText?: string;
  @Output() cta = new EventEmitter<void>();
}


