import { inject, Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from './api-tokens';
import { StorageService } from './storage.service';

type LoginResponse = { access_token: string; token_type: string; expires_in: number };
type User = { id: string; name: string; email: string; nickname?: string | null; company?: string | null; status: 'ACTIVE' | 'INACTIVE'; created_at: string; updated_at: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly storage = inject(StorageService);

  private readonly tokenKey = 'myagenda.token';
  private readonly userSig = signal<User | null>(null);
  // Para plantillas: usar auth.user() (signal) en lugar de propiedad mutable
  user = () => this.userSig();

  get token(): string | null {
    return this.storage.getItem(this.tokenKey);
  }

  get isAuthenticated(): boolean {
    return !!this.token;
  }

  get currentUser(): User | null { return this.userSig(); }

  login(identifier: string, password: string) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { identifier, password });
  }

  saveToken(token: string) {
    this.storage.setItem(this.tokenKey, token);
  }

  me() {
    return this.http.get<User>(`${this.baseUrl}/auth`);
  }

  setUser(u: User | null) { this.userSig.set(u); }

  logout() { this.storage.removeItem(this.tokenKey); this.userSig.set(null); }
}


