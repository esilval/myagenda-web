import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientsService, Client } from './clients.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.html',
  styleUrl: './detail.scss'
})
export class ClientDetailPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly clients = inject(ClientsService);
  private readonly cdr = inject(ChangeDetectorRef);
  private subscription?: Subscription;

  client: Client | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadClient();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private loadClient(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('loadClient called with ID:', id);
    
    if (id) {
      this.loading = true;
      this.error = null;
      this.client = null;
      this.cdr.detectChanges(); // Forzar detección de cambios
      
      console.log('Loading client with ID:', id);
      this.subscription = this.clients.get(id).subscribe({ 
        next: (c) => {
          console.log('Client loaded successfully:', c);
          this.client = c;
          this.loading = false;
          this.cdr.detectChanges(); // Forzar detección de cambios
        },
        error: (err) => {
          console.error('Error loading client:', err);
          this.error = err?.error?.error || 'Error al cargar el cliente';
          this.loading = false;
          this.cdr.detectChanges(); // Forzar detección de cambios
        }
      });
    } else {
      this.error = 'ID de cliente no válido';
      this.loading = false;
      this.cdr.detectChanges(); // Forzar detección de cambios
    }
  }
}
