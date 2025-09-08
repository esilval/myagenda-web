import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../../core/api-tokens';

export type Client = {
  id: string;
  company_id?: string | null;
  contact_name: string;
  phone?: string | null;
  email?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
  company?: {
    id: string;
    nit: string;
    business_name: string;
    city?: string | null;
    status: 'ACTIVE' | 'INACTIVE';
  };
};

export type ClientsResponse = {
  total: number;
  items: Client[];
};

export type ClientInput = {
  company_id?: string | null;
  contact_name: string;
  phone?: string | null;
  email?: string | null;
};

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(options: { page?: number; size?: number; status?: 'ACTIVE' | 'INACTIVE' | undefined; q?: string | undefined; include_company?: boolean }) {
    let params = new HttpParams();
    if (options.page) params = params.set('page', String(options.page));
    if (options.size) params = params.set('size', String(options.size));
    if (options.status) params = params.set('status', options.status);
    if (options.q) params = params.set('q', options.q);
    if (options.include_company) params = params.set('include_company', 'true');
    return this.http.get<ClientsResponse>(`${this.baseUrl}/clients`, { params });
  }

  get(id: string) {
    return this.http.get<Client>(`${this.baseUrl}/clients/${id}`);
  }

  create(payload: ClientInput) {
    return this.http.post<Client>(`${this.baseUrl}/clients`, payload);
  }

  update(id: string, payload: ClientInput) {
    return this.http.put<Client>(`${this.baseUrl}/clients/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/clients/${id}`);
  }
}


