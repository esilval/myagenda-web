import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton" [style.height.px]="height" [style.width.%]="100"></div>
  `,
  styles: [`
    .skeleton { background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%); background-size: 400% 100%; animation: shimmer 1.4s ease infinite; border-radius: 6px; }
    @keyframes shimmer { 0% { background-position: 100% 0 } 100% { background-position: -100% 0 } }
  `]
})
export class SkeletonComponent { @Input() height = 16; }


