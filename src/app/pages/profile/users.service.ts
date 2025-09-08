import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/api-tokens';

export type UpdateUserInput = {
  name?: string;
  nickname?: string;
  company?: string;
  password?: string;
};

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  update(id: string, payload: UpdateUserInput) {
    return this.http.patch<any>(`${this.base}/users/${id}`, payload);
  }
}


