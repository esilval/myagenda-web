import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toasts">
      <div *ngFor="let t of toast.toasts()" class="toast" [class.succ]="t.type==='success'" [class.err]="t.type==='error'">
        {{ t.message }}
      </div>
    </div>
  `,
  styles: [`
    .toasts { position: fixed; right: 1rem; bottom: 1rem; display: flex; flex-direction: column; gap: .5rem; z-index: 50; }
    .toast { background: #111827; color: #fff; padding: .5rem .75rem; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,.2); }
    .toast.succ { background: #065f46; }
    .toast.err { background: #7f1d1d; }
  `]
})
export class ToastsComponent {
  readonly toast = inject(ToastService);
}


