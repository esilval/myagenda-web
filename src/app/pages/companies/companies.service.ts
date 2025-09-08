import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../../core/api-tokens';

export type Company = {
  id: string;
  nit: string;
  business_name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  city?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
};

export type CompaniesResponse = {
  total: number;
  items: Company[];
};

export type CompanyInput = {
  nit: string;
  business_name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  city?: string | null;
};

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(options: { page?: number; size?: number; status?: 'ACTIVE' | 'INACTIVE' | undefined; q?: string | undefined }) {
    let params = new HttpParams();
    if (options.page) params = params.set('page', String(options.page));
    if (options.size) params = params.set('size', String(options.size));
    if (options.status) params = params.set('status', options.status);
    if (options.q) params = params.set('q', options.q);
    return this.http.get<CompaniesResponse>(`${this.baseUrl}/companies`, { params });
  }

  get(id: string) {
    return this.http.get<Company>(`${this.baseUrl}/companies/${id}`);
  }

  create(payload: CompanyInput) {
    return this.http.post<Company>(`${this.baseUrl}/companies`, payload);
  }

  update(id: string, payload: CompanyInput) {
    return this.http.put<Company>(`${this.baseUrl}/companies/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/companies/${id}`);
  }
}


