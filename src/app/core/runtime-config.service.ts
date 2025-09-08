import { Injectable } from '@angular/core';

export type RuntimeConfig = {
  apiUrl?: string;
};

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
  private readonly config: RuntimeConfig = {};

  set<K extends keyof RuntimeConfig>(key: K, value: RuntimeConfig[K]) {
    this.config[key] = value;
  }

  get<K extends keyof RuntimeConfig>(key: K): RuntimeConfig[K] | undefined {
    return this.config[key];
  }
}


