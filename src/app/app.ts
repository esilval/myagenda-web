import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { ToastsComponent } from './shared/toasts';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, NgClass, ToastsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('myagenda-web');
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly mobileSidebarOpen = signal(false);

  ngOnInit(): void {
    if (this.auth.token && !this.auth.currentUser) {
      this.auth.me().subscribe({
        next: (u) => this.auth.setUser(u),
        error: () => this.auth.logout(),
      });
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  isLogin(): boolean {
    return this.router.url.startsWith('/login');
  }

  toggleSidebar() { this.mobileSidebarOpen.set(!this.mobileSidebarOpen()); }
  closeSidebar() { this.mobileSidebarOpen.set(false); }
}
